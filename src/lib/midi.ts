let output: MIDIOutput

const store: { midi: MIDIAccess; inputs: MIDIInput[]; outputs: MIDIOutput[] } =
  { midi: undefined, inputs: [], outputs: [] }

export const init = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const onMIDISuccess = (midiAccess: MIDIAccess) => {
      console.log("MIDI ready!")
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

export const getInputsAndOutputs = () => {
  store.inputs = []
  store.outputs = []
  for (const entry of store.midi.inputs) {
    store.inputs.push(entry[1])
  }
  for (const entry of store.midi.outputs) {
    if (!output) {
      output = entry[1]
    }
    store.outputs.push(entry[1])
  }
}

export const send = (
  event: number[],
  delta?: number,
  outputPort?: MIDIOutput
) => {
  const out = output ?? outputPort ?? store.outputs[0]
  //console.log("sending", event, "to", out.id, out.name)
  out.send(event, delta)
}
