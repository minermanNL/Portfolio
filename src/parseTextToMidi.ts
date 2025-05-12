import { Midi } from '@tonejs/midi';
import { Buffer } from 'buffer'; // Node.js Buffer

interface ParsedNoteEvent {
    type: 'on' | 'off';
    tick: number;
    channel: number;
    note: number;
    velocity?: number; // Only for NoteOn
}

interface ActiveNoteInfo {
    startTick: number;
    velocity: number;
    channel: number; // Store channel for debugging/clarity
}

interface FinalNoteInfo {
    channel: number;
    pitch: number;
    velocity: number; // Normalized 0-1 for Tonejs
    startTick: number;
    durationTicks: number;
}

// Function to parse the specific text format and generate MIDI bytes
export function parseTextToMidi(inputText: string): Buffer {
    // --- Regex patterns ---
    const tempoMicrosecondsRe = /^\s*Tempo:\s*(\d{4,})\s*(?:\/\/.*|\s*)$/;
    const tempoBPMRe = /^\s*Tempo:\s*(\d{1,3}(?:\.\d+)?)\s*(?:\/\/.*|\s*)$/;
    const resolutionRe = /^\s*Resolution:\s*(\d+)\s*(?:\/\/.*|\s*)$/;
    const noteOnRe = /^\s*Tick\s+(\d+):\s+NoteOn\s+Channel\s+(\d+)\s+Note\s+(\d+)\s+Velocity\s+(\d+)\s*(?:\/\/.*|\s*)$/;
    const noteOffRe = /^\s*Tick\s+(\d+):\s+NoteOff\s+Channel\s+(\d+)\s+Note\s+(\d+)\s+Velocity\s+(\d+)\s*(?:\/\/.*|\s*)$/;
    const endRe = /^\s*End:\s*(\d+)\s*(?:\/\/.*|\s*)$/;

    // --- Default values ---
    const DEFAULT_BPM = 120;
    const DEFAULT_RESOLUTION = 480; // Ticks Per Quarter Note (TPQN)
    const MINIMAL_DURATION_TICKS = 1;

    // --- Parsed values storage ---
    let tempoBpm: number | null = null;
    let parsedResolution: number | null = null;
    let endTick: number | null = null;
    const parsedEvents: ParsedNoteEvent[] = [];
    let highestTickEncountered = 0;

    // --- 1. Parse Input Line by Line ---
    const lines = inputText.split('\n');
    for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('#') || trimmedLine.startsWith('---')) {
            continue;
        }

        let match: RegExpMatchArray | null;

        if ((match = trimmedLine.match(tempoMicrosecondsRe)) && tempoBpm === null) {
            const microsecs = parseInt(match[1], 10);
            if (microsecs > 0) tempoBpm = 60000000 / microsecs;
        } else if ((match = trimmedLine.match(tempoBPMRe)) && tempoBpm === null) {
             tempoBpm = parseFloat(match[1]);
        } else if ((match = trimmedLine.match(resolutionRe)) && parsedResolution === null) {
            parsedResolution = parseInt(match[1], 10);
        } else if ((match = trimmedLine.match(noteOnRe))) {
            try {
                const [, tick, ch, note, vel] = match.map(Number);
                if (ch >= 0 && ch <= 15 && note >= 0 && note <= 127 && vel >= 0 && vel <= 127) {
                    parsedEvents.push({ type: 'on', tick, channel: ch, note, velocity: vel });
                    highestTickEncountered = Math.max(highestTickEncountered, tick);
                } else {
                    console.warn(`Warning: Invalid NoteOn parameters: Tick ${tick}, Ch ${ch}, Note ${note}, Vel ${vel}`);
                }
            } catch (e) { console.warn(`Warning: Could not parse NoteOn line: ${trimmedLine}`); }
        } else if ((match = trimmedLine.match(noteOffRe))) {
             try {
                const [, tick, ch, note, vel] = match.map(Number);
                if (ch >= 0 && ch <= 15 && note >= 0 && note <= 127 && vel >= 0 && vel <= 127) {
                    parsedEvents.push({ type: 'off', tick, channel: ch, note });
                    highestTickEncountered = Math.max(highestTickEncountered, tick);
                } else {
                     console.warn(`Warning: Invalid NoteOff parameters: Tick ${tick}, Ch ${ch}, Note ${note}, Vel ${vel}`);
                }
            } catch (e) { console.warn(`Warning: Could not parse NoteOff line: ${trimmedLine}`); }
        } else if ((match = trimmedLine.match(endRe)) && endTick === null) {
            endTick = parseInt(match[1], 10);
             highestTickEncountered = Math.max(highestTickEncountered, endTick);
        }
    }

    tempoBpm = tempoBpm ?? DEFAULT_BPM;
    const currentResolution = (typeof parsedResolution === 'number' && parsedResolution > 0) ? parsedResolution : DEFAULT_RESOLUTION;

    let sequenceLengthTicks: number;
    if (endTick !== null) {
        sequenceLengthTicks = endTick;
    } else if (highestTickEncountered > 0) {
        sequenceLengthTicks = highestTickEncountered;
    } else {
        const ticksPerBar = currentResolution * 4;
        sequenceLengthTicks = ticksPerBar * 16;
    }

    parsedEvents.sort((a, b) => a.tick - b.tick);

    const activeNotes = new Map<string, ActiveNoteInfo>();
    const finalNotes: FinalNoteInfo[] = [];

    for (const event of parsedEvents) {
         if (event.tick > sequenceLengthTicks && event.type === 'on') {
            console.warn(`Warning: NoteOn event for Ch ${event.channel}, Note ${event.note} at tick ${event.tick} is beyond sequence end ${sequenceLengthTicks}. Ignoring.`);
            continue;
        }
         if (event.tick > sequenceLengthTicks && event.type === 'off') {
             event.tick = sequenceLengthTicks;
        }

        const key = `${event.channel}-${event.note}`;

        if (event.type === 'on' && event.velocity !== undefined && event.velocity > 0) {
            if (activeNotes.has(key)) {
                const previousNote = activeNotes.get(key)!;
                let durationTicks = event.tick - previousNote.startTick;
                if (durationTicks <= 0) durationTicks = MINIMAL_DURATION_TICKS;
                finalNotes.push({
                    channel: event.channel, pitch: event.note, velocity: previousNote.velocity / 127,
                    startTick: previousNote.startTick, durationTicks: durationTicks,
                 });
                 console.warn(`Warning: NoteOn for Ch ${event.channel}, Note ${event.note} at tick ${event.tick} received while note was already active. Closing previous instance.`);
            }
            activeNotes.set(key, { startTick: event.tick, velocity: event.velocity, channel: event.channel });
        } else if (event.type === 'off') {
            if (activeNotes.has(key)) {
                const noteOnInfo = activeNotes.get(key)!;
                activeNotes.delete(key);
                let durationTicks = event.tick - noteOnInfo.startTick;
                if (durationTicks <= 0) durationTicks = MINIMAL_DURATION_TICKS;
                 finalNotes.push({
                    channel: event.channel, pitch: event.note, velocity: noteOnInfo.velocity / 127,
                    startTick: noteOnInfo.startTick, durationTicks: durationTicks,
                 });
            } else {
                 console.warn(`Warning: NoteOff for Ch ${event.channel}, Note ${event.note} at tick ${event.tick} has no matching active NoteOn. Ignoring.`);
            }
        }
    }

    activeNotes.forEach((noteOnInfo, key) => {
        const [channelStr, noteStr] = key.split('-');
        const channel = parseInt(channelStr, 10);
        const note = parseInt(noteStr, 10);
        let durationTicks = sequenceLengthTicks - noteOnInfo.startTick;
        if (durationTicks <= 0) durationTicks = MINIMAL_DURATION_TICKS;
         finalNotes.push({
            channel: channel, pitch: note, velocity: noteOnInfo.velocity / 127,
            startTick: noteOnInfo.startTick, durationTicks: durationTicks,
         });
    });

    const midi = new Midi({ ppq: currentResolution });
    midi.header.setTempo(tempoBpm);

    const tracks: Map<number, ReturnType<typeof midi.addTrack>> = new Map();
    for (const note of finalNotes) {
        let track = tracks.get(note.channel);
        if (!track) {
            track = midi.addTrack();
            track.channel = note.channel;
            tracks.set(note.channel, track);
        }
        const ticksPerSecond = midi.header.ppq * (tempoBpm / 60);
        const startTimeSeconds = note.startTick / ticksPerSecond;
        const durationSeconds = note.durationTicks / ticksPerSecond;
        try {
             track.addNote({
                midi: note.pitch, time: startTimeSeconds, duration: durationSeconds, velocity: note.velocity
             });
        } catch (e: any) {
             console.error(`Error adding note to track ${note.channel}: Pitch ${note.pitch}, Start ${startTimeSeconds}s, Duration ${durationSeconds}s. Error: ${e.message}`);
        }
    }

    const totalDurationSeconds = sequenceLengthTicks / (midi.header.ppq * (tempoBpm / 60));
    midi.duration = totalDurationSeconds;

    const midiBytesArray = midi.toArray();
    return Buffer.from(midiBytesArray);
}