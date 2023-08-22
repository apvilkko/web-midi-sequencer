let output: MIDIOutput

export type RoutingRule = {
  sourceId: string
  sourceChannel: number
  targetId: string
  targetChannel: number
}

export const store: {
  midi: MIDIAccess
  inputs: MIDIInput[]
  outputs: MIDIOutput[]
  routing: RoutingRule[]
} = { midi: undefined, inputs: [], outputs: [], routing: [] }

export const init = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const onMIDISuccess = (midiAccess: MIDIAccess) => {
      console.log('MIDI ready!')
      store.midi = midiAccess

      getInputsAndOutputs()
      resolve()
    }

    const onMIDIFailure = (msg) => {
      console.error(`Failed to get MIDI access - ${msg}`)
      reject()
    }

    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure)
  })

export const addRule = (rule: RoutingRule) => {
  // remove old rules
  store.routing = store.routing.filter((x) => x.sourceId !== rule.sourceId)
  store.routing = store.routing.filter((x) => x.targetId !== rule.targetId)
  if (rule.sourceId && rule.targetId) {
    store.routing.push(rule)
  }
}

const onMIDIMessage = (portId) => (event) => {
  store.routing.forEach((rule) => {
    const inChannel = event.data[0] & 0xf
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
}

export const send = (
  event: number[],
  delta?: number,
  outputPort?: MIDIOutput
) => {
  const out = output ?? outputPort ?? store.outputs[0]
  //console.log('sending', event, 'to', out.id, out.name)
  out.send(event, delta)
}
