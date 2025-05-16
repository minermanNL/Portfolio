import { NextRequest, NextResponse } from 'next/server';
import MidiParser from 'midi-parser-js';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const midiFile = formData.get('midiFile');

    if (!midiFile || typeof midiFile === 'string' || !(midiFile instanceof Blob)) {
      return NextResponse.json({ error: 'No valid MIDI file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await midiFile.arrayBuffer();
    const byteArray = new Uint8Array(arrayBuffer);
    const midiData = MidiParser.parse(byteArray);

    // console.log('Successfully parsed MIDI data:', JSON.stringify(midiData, null, 2)); // Detailed log for debugging

    const textLines: string[] = [];
    let allNoteEvents: { tick: number; line: string }[] = [];
    let maxTick = 0;

    // Step 1: Extract Resolution
    const resolution = midiData.ticksPerBeat;
    if (resolution === undefined) {
      console.warn('MIDI file does not specify ticksPerBeat (Resolution). Using default 480.');
      textLines.push('Resolution: 480');
    } else {
      textLines.push(`Resolution: ${resolution}`);
    }

    // Step 2: Find the first Tempo event
    let tempoMicroseconds: number | null = null;
    for (const track of midiData.track) {
      if (track.event) {
        for (const event of track.event) {
          // Check for Set Tempo meta event (metaType 0x51)
          if (event.metaType === 0x51 && event.data && event.data.length === 3) {
            tempoMicroseconds = (event.data[0] << 16) + (event.data[1] << 8) + event.data[2];
            break; // Found the first tempo event
          }
        }
      }
      if (tempoMicroseconds !== null) break; // Stop searching if found
    }

    if (tempoMicroseconds === null) {
      console.warn('No Tempo event found in MIDI. Using default 120 BPM (500000 microseconds/quarter note).');
      tempoMicroseconds = 500000;
    }
    textLines.push(`Tempo: ${tempoMicroseconds}`);

    // Steps 3-5: Process tracks, calculate absolute ticks, identify and format NoteOn/NoteOff events
    for (const track of midiData.track) {
      let currentTick = 0;
      if (track.event) {
        for (const event of track.event) {
          currentTick += event.deltaTime;
          maxTick = Math.max(maxTick, currentTick);

          let channel = event.channel;
          if (typeof channel !== 'number') channel = 0; // Default channel if undefined

          // Note On event (type 9 for channel messages)
          if (event.type === 9 && event.data && event.data.length === 2) {
            const note = event.data[0];
            const velocity = event.data[1];
            if (velocity > 0) {
              allNoteEvents.push({ tick: currentTick, line: `Tick ${currentTick}: NoteOn Channel ${channel} Note ${note} Velocity ${velocity}` });
            } else {
              // Note On with velocity 0 is often treated as Note Off
              allNoteEvents.push({ tick: currentTick, line: `Tick ${currentTick}: NoteOff Channel ${channel} Note ${note} Velocity 0` });
            }
          }
          // Note Off event (type 8 for channel messages)
          else if (event.type === 8 && event.data && event.data.length === 2) {
            const note = event.data[0];
            const velocity = event.data[1]; // MIDI Note Off velocity
            allNoteEvents.push({ tick: currentTick, line: `Tick ${currentTick}: NoteOff Channel ${channel} Note ${note} Velocity ${velocity}` });
          }
        }
      }
    }

    // Step 6: Sort all collected note events by their absolute tick time
    allNoteEvents.sort((a, b) => a.tick - b.tick);

    // Add sorted event lines to the main textLines array
    textLines.push(...allNoteEvents.map(e => e.line));

    // Step 7: Determine the final End Tick (maxTick should already hold this, or the tick of the last note event if greater)
    // If there were no note events, maxTick might be from empty tracks. Use sorted events if available.
    if (allNoteEvents.length > 0) {
        maxTick = Math.max(maxTick, allNoteEvents[allNoteEvents.length -1].tick);
    }
    textLines.push(`End: ${maxTick}`);

    // Step 8: Assemble the final string
    const finalTextDescription = textLines.join('\n'); // Corrected line

    return NextResponse.json({ textDescription: finalTextDescription });

  } catch (error: any) {
    console.error('Error processing MIDI file:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during MIDI processing.';
    // Add stack trace for more detailed server-side debugging if needed
    // console.error(error.stack);
    return NextResponse.json({ error: 'Failed to process MIDI file.', details: errorMessage }, { status: 500 });
  }
}
