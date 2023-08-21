export enum EventType {
  NOTE_ON,
  NOTE_OFF,
}

export type MusicalEvent = {
  offset: number
  note: number
  type: EventType
  velocity: number
  id: number
}
