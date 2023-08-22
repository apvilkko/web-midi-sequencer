import { NOTE_OFF, NOTE_ON, PPQN } from './constants'
import { send } from './midi'
import type { Pattern } from './pattern'
import { EventType } from './types'

export const store: {
  playing: boolean
  context: AudioContext
  tempo: number
  position: number
  pattern: Pattern
} = {
  playing: false,
  context: undefined,
  tempo: 140,
  position: 0,
  pattern: undefined,
}

let lastTickTime
let lastPosition

export const play = () => {
  if (!store.playing) {
    store.playing = true
    store.context.resume()
  } else {
    store.playing = false
  }
  console.log('playing', store.playing)
}

export const setPattern = (pattern: Pattern) => {
  store.pattern = pattern
}

export const setTempo = (tempo: number) => {
  store.tempo = tempo
}

const tick = () => {
  const currentTime = store.context.currentTime

  if (store.playing) {
    const secsPerBeat = 60.0 / store.tempo
    const tickTime = secsPerBeat / PPQN
    const delta = currentTime - lastTickTime
    const deltaTicks = delta / tickTime

    store.position = store.position + deltaTicks

    const posDelta = store.position - lastPosition
    if (!Number.isNaN(posDelta) && posDelta > 0) {
      if (store.pattern) {
        const start = lastPosition % store.pattern.length
        const end = store.position % store.pattern.length
        const events = store.pattern.events.filter((x) => {
          if (end > start) {
            return x.offset >= start && x.offset < end
          } else {
            return x.offset >= start || x.offset < end
          }
        })
        events.forEach((item) => {
          send(
            [
              item.type === EventType.NOTE_ON ? NOTE_ON : NOTE_OFF,
              item.note,
              item.velocity,
            ],
            end - item.offset
          )
        })
      }
    }
    lastPosition = store.position
  }

  lastTickTime = store.context.currentTime
  requestAnimationFrame(tick)
}

export const start = () => {
  if (!store.context) {
    store.context = new AudioContext()
    lastTickTime = store.context.currentTime
  }

  requestAnimationFrame(tick)
}
