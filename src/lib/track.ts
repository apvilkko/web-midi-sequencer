import type { Pattern } from './pattern'
import { addRule, store as midiStore } from './midi'

let id = 1
const getId = () => id++

export class Track {
  id: number
  private outChannel: number = 0
  private inChannel: number = 0
  constructor(id?: number) {
    this.id = id ?? getId()
  }
  pattern: Pattern
  private output: MIDIOutput | undefined
  private input: MIDIInput | undefined

  updateRules() {
    addRule({
      sourceId: this.input?.id,
      sourceChannel: this.inChannel,
      targetId: this.output?.id,
      targetChannel: this.outChannel,
    })
  }

  setOutChannel(channel: number) {
    this.outChannel = channel
    this.updateRules()
  }

  setInChannel(channel: number) {
    this.inChannel = channel
    this.updateRules()
  }

  getOutChannel() {
    return this.outChannel
  }

  getInChannel() {
    return this.inChannel
  }

  setOutput(outputId: string) {
    const found = midiStore.outputs.find((x) => x.id === outputId)
    this.output = found
    this.updateRules()
  }

  getOutput() {
    return this.output
  }

  getInput() {
    return this.input
  }

  setInput(inputId: string) {
    const found = midiStore.inputs.find((x) => x.id === inputId)
    this.input = found
    this.updateRules()
  }
}
