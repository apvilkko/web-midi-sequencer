<script lang="ts">
  import PatternDisplay from "./lib/PatternDisplay.svelte"
  import { PPQN } from "./lib/constants"
  import { init } from "./lib/midi"
  import { Pattern, note } from "./lib/pattern"
  import { start, play as playS, setPattern } from "./lib/sequencer"

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
    }
  }
  setPattern(pattern)

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
</script>

<main>
  <button on:click={play}>play/pause</button>
  <PatternDisplay {pattern} />
</main>
