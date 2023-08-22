<script lang="ts">
  import PatternDisplay from './PatternDisplay.svelte'
  import Select from './Select.svelte'
  import { store as midiStore } from './midi'
  import { store as seqStore } from './sequencer'
  import type { Track } from './track'

  export let track: Track

  const outputs = midiStore.outputs.map((output) => ({
    label: output.name,
    id: output.id,
  }))
  const inputs = midiStore.inputs.map((input) => ({
    label: input.name,
    id: input.id,
  }))
  const channels = Array.from({ length: 16 }).map((_, i) => ({
    id: i,
    label: String(i + 1),
  }))
</script>

<div>
  <Select
    id={`track-in-${track.id}`}
    options={inputs}
    label="in"
    handleChange={(e) => {
      track.setInput(e.target.value)
    }}
    value={track.getInput()?.id}
  />
  <Select
    id={`track-in-channel-${track.id}`}
    options={channels}
    label={'in ch.'}
    value={track.getInChannel()}
    handleChange={(e) => {
      track.setInChannel(Number(e.target.value))
    }}
  />
  <Select
    id={`track-out-${track.id}`}
    options={outputs}
    label="out"
    handleChange={(e) => {
      track.setOutput(e.target.value)
    }}
    value={track.getOutput()?.id}
  />
  <Select
    id={`track-out-channel-${track.id}`}
    options={channels}
    label={'out ch.'}
    value={track.getOutChannel()}
    handleChange={(e) => {
      track.setOutChannel(Number(e.target.value))
    }}
  />
  <PatternDisplay pattern={track.pattern} trackId={track.id} />
</div>
