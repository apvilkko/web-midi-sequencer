import { writable } from 'svelte/store'
import { NoteLength } from './types'

export type Settings = {
  record: {
    quantize: boolean
    resolution: NoteLength
    quantizeEnds: boolean
  }
}

export const settingsStore = writable<Settings>({
  record: {
    quantize: true,
    resolution: NoteLength.SIXTEENTH,
    quantizeEnds: false,
  },
})
