import type { Pattern } from './pattern'
import { addRule, getChannel } from './midi'
import { Context } from './context'

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
  armed: boolean = false

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
    const found = Context.get().midi.outputs.find((x) => x.id === outputId)
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
    const found = Context.get().midi.inputs.find((x) => x.id === inputId)
    this.input = found
    this.updateRules()
  }

  record(data: Uint8Array) {
    const channel = getChannel(data[0])
    if (this.inChannel === channel) {
      this.pattern.record(data)
    }
  }
}
