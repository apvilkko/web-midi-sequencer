import { NOTE_OFF, NOTE_ON } from './constants'
import { Context } from './context'
import { signalStore } from './signalStore'
import { EventType } from './types'

export type RoutingRule = {
  sourceId: string
  sourceChannel: number
  targetId: string
  targetChannel: number
}

export type MidiStore = {
  midi: MIDIAccess
  inputs: MIDIInput[]
  outputs: MIDIOutput[]
  routing: RoutingRule[]
  armed: Record<number, boolean>
}

export const store: MidiStore = {
  midi: undefined,
  inputs: [],
  outputs: [],
  routing: [],
  armed: {},
}

export const getChannel = (midiByte: number) => midiByte & 0xf

export const getEventType = (midiByte: number): EventType | undefined => {
  const command = midiByte & 0xf0
  switch (command) {
    case NOTE_ON:
      return EventType.NOTE_ON
    case NOTE_OFF:
      return EventType.NOTE_OFF
    default:
      return undefined
  }
}

export const init = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const onMIDISuccess = (midiAccess: MIDIAccess) => {
      console.log('MIDI ready!')
      store.midi = midiAccess

      store.midi.onstatechange = () => {
        getInputsAndOutputs()
        cleanupRules()
      }

      getInputsAndOutputs()
      resolve()
    }

    const onMIDIFailure = (msg) => {
      console.error(`Failed to get MIDI access - ${msg}`)
      reject()
    }

    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
  })

const cleanupRules = () => {
  const inputIds = store.inputs.map((x) => x.id)
  const outputIds = store.outputs.map((x) => x.id)
  store.routing = store.routing.filter(
    (x) => inputIds.includes(x.sourceId) && outputIds.includes(x.targetId)
  )
}

export const addRule = (rule: RoutingRule) => {
  // remove old rules
  store.routing = store.routing.filter((x) => x.sourceId !== rule.sourceId)
  store.routing = store.routing.filter((x) => x.targetId !== rule.targetId)
  if (rule.sourceId && rule.targetId) {
    store.routing.push(rule)
  }
}

const onMIDIMessage = (portId) => (event) => {
  Object.keys(store.armed).forEach((trackId) => {
    if (store.armed[trackId]) {
      const track = Context.get().sequencer.tracks.find(
        (x) => x.id === Number(trackId)
      )
      if (track) {
        track.record(event.data as Uint8Array)
      }
    }
  })

  store.routing.forEach((rule) => {
    const inChannel = getChannel(event.data[0])
    if (rule.sourceId === portId && inChannel === rule.sourceChannel) {
      const output = store.outputs.find((x) => x.id === rule.targetId)
      send(
        [(event.data[0] & 0xf0) + rule.targetChannel, ...event.data.slice(1)],
        0,
        output
      )
    }
  })
}

export const getInputsAndOutputs = () => {
  store.inputs = []
  store.outputs = []
  for (const entry of store.midi.inputs) {
    store.inputs.push(entry[1])
    entry[1].onmidimessage = onMIDIMessage(entry[1].id)
  }
  for (const entry of store.midi.outputs) {
    store.outputs.push(entry[1])
  }
  signalStore.update((old) => ({ ...old, portsChanged: old.portsChanged + 1 }))
}

export const send = (
  event: number[],
  delta?: number,
  outputPort?: MIDIOutput
) => {
  const out = outputPort ?? store.outputs[0]
  //console.log('sending', event, 'to', out.id, out.name)
  out.send(event, delta)
}
