import type { MidiStore } from './midi'
import type { Sequencer } from './sequencer'

let instance: Context

export class Context {
  sequencer: Sequencer
  midi: MidiStore

  static create(seq: Sequencer, midi: MidiStore) {
    instance = new Context()
    instance.midi = midi
    instance.sequencer = seq
  }

  static get() {
    return instance
  }
}
