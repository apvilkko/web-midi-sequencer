import { get } from 'svelte/store'
import { NOTE_OFF, NOTE_ON, PPQN, SCHEDULER_LOOKAHEAD } from './constants'
import { send } from './midi'
import { Pattern } from './pattern'
import { signalStore } from './signalStore'
import { Track } from './track'
import { EventType, type MusicalEvent } from './types'
import { startWorker } from './worker'

export type Sequencer = {
  playing: boolean
  context: AudioContext
  tempo: number
  position: number
  tracks: Track[]
}

export const store: Sequencer = {
  playing: false,
  context: undefined,
  tempo: 120,
  position: 0,
  tracks: [],
}

let lastScheduleTime

export const play = () => {
  if (!store.playing) {
    store.playing = true
    store.context.resume()
  } else {
    store.playing = false
  }
  console.log('playing', store.playing)
}

export const addTrack = () => {
  console.log('addTrack')
  const track = new Track()
  const pattern = new Pattern(
    store.tracks[store.tracks.length - 1]?.pattern?.length ?? PPQN * 4
  )
  track.pattern = pattern
  store.tracks.push(track)
  signalStore.update((old) => ({
    ...old,
    tracksChanged: old.tracksChanged + 1,
  }))
}

export const setTracks = (tracks: Track[]) => {
  store.tracks = tracks
}

export const setTempo = (tempo: number) => {
  store.tempo = tempo
}

const queue: Array<{ time: number; event: MusicalEvent; trackId: number }> = []

const secsToTicks = (seconds: number, tempo: number) => {
  const secsPerBeat = 60.0 / tempo
  const tickTime = secsPerBeat / PPQN
  return seconds / tickTime
}

const ticksToSecs = (ticks: number, tempo: number) => {
  const secsPerBeat = 60.0 / tempo
  const tickTime = secsPerBeat / PPQN
  return ticks * tickTime
}

const outputMap = {}
const channelMap = {}

const scheduler = () => {
  const currentTime = store.context.currentTime
  if (!store.playing) {
    return
  }

  const deltaTicks = secsToTicks(currentTime - lastScheduleTime, store.tempo)

  for (let i = 0; i < store.tracks.length; ++i) {
    const track = store.tracks[i]
    outputMap[track.id] = track.getOutput()
    channelMap[track.id] = track.getOutChannel()
    const pattern = track.pattern

    if (pattern) {
      const start = store.position % pattern.length
      const end =
        (store.position + secsToTicks(SCHEDULER_LOOKAHEAD, store.tempo)) %
        pattern.length
      const events = pattern.events.filter((x) => {
        if (end > start) {
          return x.offset >= start && x.offset < end
        } else {
          return x.offset >= start || x.offset < end
        }
      })
      events.forEach((item) => {
        const ticks =
          item.offset >= start
            ? item.offset - start
            : item.offset - start + pattern.length
        const time = currentTime + ticksToSecs(ticks, store.tempo)

        const found = queue.find(
          (x) => x.event.type === item.type && x.event.id === item.id
        )
        if (!found) {
          queue.push({
            event: item,
            time,
            trackId: track.id,
          })
        }
      })
    }
  }

  store.position = store.position + deltaTicks
  lastScheduleTime = store.context.currentTime
}

const tick = () => {
  const currentTime = store.context.currentTime

  while (queue.length && queue[0].time < currentTime) {
    const item = queue[0].event
    send(
      [
        (item.type === EventType.NOTE_ON ? NOTE_ON : NOTE_OFF) +
          channelMap[queue[0].trackId],
        item.note,
        item.velocity,
      ],
      queue[0].time - currentTime,
      outputMap[queue[0].trackId]
    )
    queue.splice(0, 1)
  }

  requestAnimationFrame(tick)
}

export const start = () => {
  if (!store.context) {
    store.context = new AudioContext()
    lastScheduleTime = store.context.currentTime
    startWorker(scheduler)
  }

  requestAnimationFrame(tick)
}
