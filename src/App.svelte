<script lang="ts">
  import TrackDisplay from './lib/TrackDisplay.svelte'
  import { PPQN } from './lib/constants'
  import { init } from './lib/midi'
  import { Pattern, note } from './lib/pattern'
  import {
    start,
    play as playS,
    setTracks,
    store as seqStore,
  } from './lib/sequencer'
  import { Track } from './lib/track'

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
  setTracks([track])

  let inited = false
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
</script>

<main>
  <button on:click={play}>play/pause</button>
  <input
    type="number"
    min={MIN_TEMPO}
    max={MAX_TEMPO}
    value={tempo}
    on:change={handleTempoChange}
  />
  {#if inited}
    <TrackDisplay {track} />
  {/if}
</main>
