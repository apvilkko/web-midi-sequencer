import { C1, NOTE_OFF, NOTE_ON, PPQN } from './constants'
import { EventType, type MusicalEvent } from './types'

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

  addEvent(e: Partial<MusicalEvent>) {
    //console.log("adding", e)
    const event = { ...e, id: genId() } as MusicalEvent
    this.events.push(event)
    if (event.type === EventType.NOTE_ON) {
      this.events.push(off(event))
    }
  }

  removeEvent(id: number) {
    //console.log("removing", id, this.events.length)
    this.events = this.events.filter((x) => x.id !== id)
  }
}
