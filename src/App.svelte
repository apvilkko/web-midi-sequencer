<script lang="ts">
  import TrackDisplay from './lib/TrackDisplay.svelte'
  import { PPQN } from './lib/constants'
  import { Context } from './lib/context'
  import { init, store as midiStore } from './lib/midi'
  import { Pattern, note } from './lib/pattern'
  import {
    start,
    play as playS,
    setTracks,
    store as seqStore,
    addTrack,
  } from './lib/sequencer'
  import { signalStore } from './lib/signalStore'
  import { Track } from './lib/track'

  let inited = false

  Context.create(seqStore, midiStore)

  $: {
    if (inited) {
      const track = new Track()
      const pattern = new Pattern(PPQN * 4)
      for (let i = 0; i < 16; ++i) {
        if (i % 4 === 0) {
          pattern.addEvent(note(i, 0))
        }
        if (i % 8 === 4) {
          pattern.addEvent(note(i, 2))
        }
        if (i % 4 === 2) {
          pattern.addEvent(note(i, 8))
        } else {
          /*if (Math.random() > 0.5) {
        pattern.addEvent(note(i, 8))
      }*/
        }
      }
      track.pattern = pattern
      track.setOutChannel(9)
      track.setInChannel(9)
      if (import.meta.env.MODE == 'development') {
        track.setInput('input-1')
        track.setOutput('output-2')
      }
      setTracks([track])
    }
  }

  const play = () => {
    if (!inited) {
      init().then(() => {
        start()
        playS()
        inited = true
      })
    } else {
      playS()
    }
  }

  let tempo = seqStore.tempo
  const MAX_TEMPO = 300
  const MIN_TEMPO = 40

  const handleTempoChange = (e: Event) => {
    const val = Number((e.target as HTMLInputElement).value)
    seqStore.tempo =
      val > MAX_TEMPO ? MAX_TEMPO : val < MIN_TEMPO ? MIN_TEMPO : val
    tempo = seqStore.tempo
  }

  let changed = 0
  $: changed = $signalStore.portsChanged + $signalStore.tracksChanged
</script>

<main>
  <button type="button" on:click={play}>play/pause</button>
  <input
    type="number"
    min={MIN_TEMPO}
    max={MAX_TEMPO}
    value={tempo}
    on:change={handleTempoChange}
  />
  {#if inited}
    Signals: {changed}
    {#key changed}
      {#each Context.get().sequencer.tracks as track}
        <TrackDisplay {track} />
      {/each}
      <button type="button" on:click={addTrack}>Add track</button>
    {/key}
  {/if}
</main>
