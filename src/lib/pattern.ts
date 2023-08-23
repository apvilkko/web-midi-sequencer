import { get } from 'svelte/store'
import { C1, NOTE_OFF, NOTE_ON, PPQN } from './constants'
import { Context } from './context'
import { getEventType } from './midi'
import { settingsStore } from './settingsStore'
import { EventType, type MusicalEvent } from './types'
import { noteLengthToTicks } from './util'
import { signalStore } from './signalStore'

let i = 1
const genId = () => {
  return i++
}

export const note = (i: number, note: number) => ({
  offset: (i * PPQN) / 4,
  type: EventType.NOTE_ON,
  note: C1 + note,
  velocity: 127,
})

const comparer = (a: MusicalEvent, b: MusicalEvent) => {
  if (a.offset < b.offset) return -1
  if (a.offset > b.offset) return 1
  return 0
}

export const off = (event: Partial<MusicalEvent>): MusicalEvent =>
  ({
    ...event,
    type: EventType.NOTE_OFF,
    offset: event.offset + PPQN / 32,
  } as MusicalEvent)

export class Pattern {
  events: MusicalEvent[] = []
  length: number = 0

  constructor(len?: number) {
    this.length = len
  }

  addEvent(e: Partial<MusicalEvent>, noAutoOff?: boolean) {
    //console.log("adding", e)
    const event = { ...e, id: genId() } as MusicalEvent
    this.events.push(event)
    if (event.type === EventType.NOTE_ON && !noAutoOff) {
      this.events.push(off(event))
    }
    this.events.sort(comparer)
  }

  removeEvent(id: number) {
    //console.log("removing", id, this.events.length)
    this.events = this.events.filter((x) => x.id !== id)
  }

  record(data: Uint8Array) {
    const type = getEventType(data[0])
    switch (type) {
      case EventType.NOTE_ON:
      case EventType.NOTE_OFF: {
        let offset = Context.get().sequencer.position % this.length
        const velocity = data[2]
        let eventType = type
        if (velocity === 0 && eventType === EventType.NOTE_ON) {
          // some machines send [note off] as [note on @ vel=0]
          eventType = EventType.NOTE_OFF
        }
        const settings = get(settingsStore).record
        if (
          settings.quantize &&
          (eventType === EventType.NOTE_ON || settings.quantizeEnds)
        ) {
          const noteLen = noteLengthToTicks(settings.resolution)
          const remainder = offset % noteLen
          if (remainder > noteLen / 2) {
            offset += noteLen
            offset = offset % this.length
          }
          offset = offset - remainder
          if (offset < 0) {
            offset += this.length
          }
        }
        this.addEvent(
          {
            offset,
            type: eventType,
            note: data[1],
            velocity,
          },
          true
        )
        signalStore.update((old) => ({ ...old, recorded: old.recorded + 1 }))
        break
      }
      default:
        break
    }
  }
}
