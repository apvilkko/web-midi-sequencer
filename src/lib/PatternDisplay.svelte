<script lang="ts">
  import { PPQN } from "./constants"
  import { note, type Pattern } from "./pattern"
  import { store as seqStore } from "./sequencer"
  import { EventType } from "./types"
  import { max, min } from "./util"

  export let pattern: Pattern

  type CellItem = { velocity: number; id: number }
  let displayData: Array<Array<CellItem>>
  let displayLength

  const updateInternals = () => {
    const noteRange = [min(pattern.events, "note"), max(pattern.events, "note")]

    const offsetRange = [min(pattern.events, "offset"), pattern.length]

    displayLength = Math.floor(pattern.length / (PPQN / 4))

    displayData = Array.from({
      length: noteRange[1] - noteRange[0] + 1,
    }).map((_, j) =>
      Array.from({ length: displayLength }).map((_, i) => undefined)
    )

    const od = offsetRange[1] - offsetRange[0]

    pattern.events.forEach((e) => {
      if (e.type === EventType.NOTE_ON) {
        const scaledOffset = Math.floor(
          ((e.offset - offsetRange[0]) / od) * displayLength
        )
        const scaledNote = e.note - noteRange[0]

        displayData[scaledNote][scaledOffset] = {
          velocity: e.velocity,
          id: e.id,
        }
      }
    })
  }

  $: {
    updateInternals()
  }

  const handleClick = (i, j) => {
    if (typeof displayData[j][i] === "undefined") {
      seqStore.pattern.addEvent(note(i, j))
    } else {
      seqStore.pattern.removeEvent(displayData[j][i].id)
    }
    updateInternals()
  }
</script>

<table class="grid">
  {#each displayData as line, j}
    <tr>
      {#each line as cell, i}
        <td on:click={() => handleClick(i, j)}
          >{cell?.velocity ? cell.velocity : ""}</td
        >
      {/each}
    </tr>
  {/each}
</table>
