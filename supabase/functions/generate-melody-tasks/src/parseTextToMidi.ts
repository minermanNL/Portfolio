// supabase/functions/generate-melody-tasks/src/utils/parseTextToMidi.ts

import { Midi } from 'https://esm.sh/@tonejs/midi';

interface ParsedNoteEvent {
    type: 'on' | 'off';
    tick: number;
    channel: number; // 0-indexed MIDI channel
    note: number;    // MIDI note number
    velocity?: number; // MIDI velocity 0-127
}

interface ActiveNoteInfo {
    startTick: number;
    velocity: number; // Original MIDI velocity 0-127
    channel: number;
}

interface FinalNoteInfo {
    channel: number; // 0-indexed MIDI channel
    pitch: number;   // MIDI note number
    velocityNormalized: number; // Normalized 0-1 for Tone.js Midi.Note
    startTick: number;
    durationTicks: number;
}

export function parseTextToMidi(inputText: string): string {
    console.log('[parseTextToMidi] Received input text (first 500 chars):', inputText.substring(0, Math.min(inputText.length, 500)));

    const tempoMicrosecondsRe = /^\s*Tempo:\s*(\d+)\s*$/;
    const resolutionRe = /^\s*Resolution:\s*(\d+)\s*$/;
    const noteOnRe = /^\s*Tick\s+(\d+):\s+NoteOn\s+Channel\s+(\d+)\s+Note\s+(\d+)\s+Velocity\s+(\d+)\s*$/;
    const noteOffRe = /^\s*Tick\s+(\d+):\s+NoteOff\s+Channel\s+(\d+)\s+Note\s+(\d+)(?:\s+Velocity\s+\d+)?\s*$/;
    const endRe = /^\s*End:\s*(\d+)\s*$/;

    const DEFAULT_BPM = 120;
    const DEFAULT_RESOLUTION = 480;
    const MINIMAL_DURATION_TICKS = 1; 

    let tempoBpm: number = DEFAULT_BPM;
    let parsedResolution: number = DEFAULT_RESOLUTION;
    let endTickFromText: number | null = null;
    const parsedEvents: ParsedNoteEvent[] = [];
    let highestTickInEvents = 0;

    const lines = inputText.split('\n');
    console.log('[parseTextToMidi] Parsing', lines.length, 'lines...');
    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#') || trimmedLine.startsWith('---')) continue;

        let match: RegExpMatchArray | null;

        if ((match = trimmedLine.match(tempoMicrosecondsRe))) {
            const microsecs = parseInt(match[1], 10);
            if (microsecs > 0) tempoBpm = Math.round(60000000 / microsecs);
            console.log(`[parseTextToMidi] Parsed Tempo (from µs): ${tempoBpm} BPM`);
        } else if ((match = trimmedLine.match(resolutionRe))) {
            parsedResolution = parseInt(match[1], 10);
            console.log('[parseTextToMidi] Parsed Resolution (TPQN):', parsedResolution);
        } else if ((match = trimmedLine.match(noteOnRe))) {
            try {
                const [, tickStr, chStr, noteStr, velStr] = match;
                const tick = parseInt(tickStr, 10);
                const channel = parseInt(chStr, 10);
                const note = parseInt(noteStr, 10);
                const velocity = parseInt(velStr, 10);
                if (tick >= 0 && channel >= 1 && channel <= 16 && note >= 0 && note <= 127 && velocity > 0 && velocity <= 127) {
                    parsedEvents.push({ type: 'on', tick, channel: channel - 1 , note, velocity });
                    highestTickInEvents = Math.max(highestTickInEvents, tick);
                } else console.warn(`[parseTextToMidi] Invalid NoteOn params: ${trimmedLine}`);
            } catch (e:any) { console.warn(`[parseTextToMidi] Error parsing NoteOn: ${trimmedLine} - ${e.message}`); }
        } else if ((match = trimmedLine.match(noteOffRe))) {
             try {
                const [, tickStr, chStr, noteStr] = match;
                const tick = parseInt(tickStr, 10);
                const channel = parseInt(chStr, 10);
                const note = parseInt(noteStr, 10);
                 if (tick >= 0 && channel >= 1 && channel <= 16 && note >= 0 && note <= 127) {
                    parsedEvents.push({ type: 'off', tick, channel: channel - 1, note });
                    highestTickInEvents = Math.max(highestTickInEvents, tick);
                } else console.warn(`[parseTextToMidi] Invalid NoteOff params: ${trimmedLine}`);
            } catch (e:any) { console.warn(`[parseTextToMidi] Error parsing NoteOff: ${trimmedLine} - ${e.message}`); }
        } else if ((match = trimmedLine.match(endRe))) {
            endTickFromText = parseInt(match[1], 10);
            highestTickInEvents = Math.max(highestTickInEvents, endTickFromText);
            console.log('[parseTextToMidi] Parsed End Tick:', endTickFromText);
        } else {
            console.warn('[parseTextToMidi] No recognized pattern matched for line:', trimmedLine);
        }
    }
    console.log('[parseTextToMidi] Initial parsing complete. Events:', parsedEvents.length, 'Tempo:', tempoBpm, 'TPQN:', parsedResolution, 'EndTick:', endTickFromText);

    const currentResolution = (typeof parsedResolution === 'number' && parsedResolution > 0) ? parsedResolution : DEFAULT_RESOLUTION;
    let sequenceLengthTicks: number;

    if (endTickFromText !== null && endTickFromText >= highestTickInEvents) {
        sequenceLengthTicks = endTickFromText;
    } else {
        const ticksPerBar = currentResolution * 4; 
        const defaultTotalBars = 16;
        const minimumSequenceLength = ticksPerBar * defaultTotalBars; 

        if (parsedEvents.length > 0) {
            sequenceLengthTicks = highestTickInEvents + ticksPerBar; 
        } else {
            sequenceLengthTicks = minimumSequenceLength;
        }
    }
    console.log('[parseTextToMidi] Determined final sequenceLengthTicks:', sequenceLengthTicks);

    parsedEvents.sort((a, b) => a.tick - b.tick);

    const activeNotes = new Map<string, ActiveNoteInfo>(); 
    const finalNotes: FinalNoteInfo[] = [];

    console.log('[parseTextToMidi] Processing events to create final notes...');
    for (const event of parsedEvents) {
        if (event.tick > sequenceLengthTicks + (currentResolution * 4) && event.type === 'on') {
            console.warn(`[parseTextToMidi] Skipping NoteOn for Ch ${event.channel}, Note ${event.note} at tick ${event.tick} - too far beyond seq end.`);
            continue;
        }

        const key = `${event.channel}-${event.note}`;

        if (event.type === 'on') {
            const velocity = event.velocity !== undefined ? event.velocity : 100;
            if (velocity <= 0) {
                 console.warn(`[parseTextToMidi] Skipping NoteOn for Ch ${event.channel}, Note ${event.note} at tick ${event.tick} - velocity is zero or non-positive.`);
                 continue;
            }
            if (activeNotes.has(key)) {
                const previousNoteOnInfo = activeNotes.get(key)!;
                let duration = event.tick - previousNoteOnInfo.startTick;
                if (duration < MINIMAL_DURATION_TICKS) duration = MINIMAL_DURATION_TICKS;
                console.warn(`[parseTextToMidi] Retriggered note ${key}, closing previous at tick ${event.tick}. Duration: ${duration}`);
                finalNotes.push({
                    channel: previousNoteOnInfo.channel,
                    pitch: event.note,
                    velocityNormalized: previousNoteOnInfo.velocity / 127,
                    startTick: previousNoteOnInfo.startTick,
                    durationTicks: duration,
                });
            }
            activeNotes.set(key, { startTick: event.tick, velocity: velocity, channel: event.channel });
        } else if (event.type === 'off') {
            if (activeNotes.has(key)) {
                const noteOnInfo = activeNotes.get(key)!;
                activeNotes.delete(key);
                let duration = event.tick - noteOnInfo.startTick;
                if (duration < MINIMAL_DURATION_TICKS) duration = MINIMAL_DURATION_TICKS;
                
                if (noteOnInfo.startTick + duration > sequenceLengthTicks + (parsedResolution * 2)) {
                  duration = sequenceLengthTicks + (parsedResolution * 2) - noteOnInfo.startTick;
                  if (duration < MINIMAL_DURATION_TICKS) duration = MINIMAL_DURATION_TICKS;
                  console.warn(`[parseTextToMidi] Capped NoteOff for ${key} at ${event.tick} to duration ${duration}.`);
                }
                
                finalNotes.push({
                    channel: noteOnInfo.channel,
                    pitch: event.note,
                    velocityNormalized: noteOnInfo.velocity / 127,
                    startTick: noteOnInfo.startTick,
                    durationTicks: duration,
                });
            } else {
                console.warn(`[parseTextToMidi] NoteOff for ${key} at ${event.tick} without matching NoteOn.`);
            }
        }
    }

    console.log('[parseTextToMidi] Closing any remaining active notes at sequence end...');
    activeNotes.forEach((noteOnInfo, key) => {
        const notePitch = parseInt(key.split('-')[1], 10);
        let durationTicks = sequenceLengthTicks - noteOnInfo.startTick;
        if (durationTicks < MINIMAL_DURATION_TICKS) durationTicks = MINIMAL_DURATION_TICKS;
        
        if (noteOnInfo.startTick >= sequenceLengthTicks && finalNotes.length > 0) { 
            console.warn(`[parseTextToMidi] Discarding active note ${key} as it started at or after sequence end.`);
            return;
        }

        finalNotes.push({
            channel: noteOnInfo.channel,
            pitch: notePitch,
            velocityNormalized: noteOnInfo.velocity / 127,
            startTick: noteOnInfo.startTick,
            durationTicks: durationTicks,
        });
        console.log(`[parseTextToMidi] Closed active note ${key} at sequence end. Duration: ${durationTicks}`);
    });
    console.log('[parseTextToMidi] Total final notes to add to MIDI object:', finalNotes.length);

    const midi = new Midi();
    midi.header.name = "AI Generated Melody";
    midi.header.setTempo(tempoBpm);
    midi.header.tpqn = parsedResolution; 
    console.log(`[parseTextToMidi] Midi header set. Tempo: ${midi.header.tempos[0]?.bpm || 'N/A'} BPM, TPQN: ${midi.header.tpqn}`);

    const tracks: Map<number, ReturnType<typeof midi.addTrack>> = new Map();

    if (finalNotes.length === 0) {
        console.warn("[parseTextToMidi] No valid notes to add to MIDI. Creating a minimal empty track.");
        const emptyTrack = midi.addTrack();
        emptyTrack.name = "Empty Track";
        // Tone.js Midi's toArray() should create a valid empty MIDI structure.
    } else {
        finalNotes.sort((a, b) => {
            if (a.startTick !== b.startTick) return a.startTick - b.startTick;
            if (a.channel !== b.channel) return a.channel - b.channel;
            return a.pitch - b.pitch;
        });

        for (const note of finalNotes) {
            let track = tracks.get(note.channel);
            if (!track) {
                track = midi.addTrack();
                track.channel = note.channel; // 0-indexed
                track.name = `Channel ${note.channel + 1}`; // 1-indexed for display
                // Set default instrument (Acoustic Grand Piano - Program 0) for each track
                // Using track.instrument.program instead of addEvent
                track.instrument.program = 0; // <--- CORRECTED: Set program number directly
                tracks.set(note.channel, track);
                console.log(`[parseTextToMidi] Created new track for channel ${note.channel + 1}. Instrument program: ${track.instrument.program}`);
            }
            
            try {
                track.addNote({
                    midi: note.pitch,
                    ticks: note.startTick,
                    durationTicks: note.durationTicks,
                    velocity: note.velocityNormalized,
                });
            } catch (e: any) {
                console.error(`[parseTextToMidi] Error adding note to track ${note.channel + 1}: Pitch ${note.pitch}, StartTick ${note.startTick}, DurationTicks ${note.durationTicks}. Error: ${e.message}`);
            }
        }
    }
    console.log('[parseTextToMidi] Finished adding notes to tracks. Total MIDI tracks:', midi.tracks.length);

    const midiBytesArray = midi.toArray();
    console.log('[parseTextToMidi] Converted Midi object to Uint8Array. Byte length:', midiBytesArray.byteLength);
    
    if (midiBytesArray.byteLength < 50 && finalNotes.length > 0) { 
        console.warn(`[parseTextToMidi] WARNING: Generated MIDI is very small (${midiBytesArray.byteLength} bytes) for ${finalNotes.length} notes. It might be incomplete or silent.`);
    } else if (midiBytesArray.byteLength < 20) {
         console.error(`[parseTextToMidi] CRITICAL: Generated MIDI byte array is too small (${midiBytesArray.byteLength} bytes). Likely an empty or malformed MIDI was created.`);
    }

    const base64Midi = btoa(String.fromCharCode(...midiBytesArray));
    console.log('[parseTextToMidi] Converted Uint8Array to base64 string (first 50 chars):', base64Midi.substring(0, Math.min(base64Midi.length, 50)));
    console.log('[parseTextToMidi] Final base64 string length:', base64Midi.length);

    return base64Midi;
}