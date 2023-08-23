<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { C1, PPQN } from './constants'
  import { Context } from './context'
  import { note, type Pattern } from './pattern'
  import { EventType } from './types'
  import { max, min } from './util'
  import interact from 'interactjs'

  export let pattern: Pattern
  export let trackId: number

  type CellItem = { velocity: number; id: number }
  let displayData: Array<Array<CellItem>>
  let displayLength

  const seqStore = Context.get().sequencer

  const updateInternals = () => {
    let noteRange = [min(pattern.events, 'note'), max(pattern.events, 'note')]
    if (!noteRange[0] && !noteRange[1]) {
      noteRange = [C1, C1 + 5]
    }

    const offsetRange = [0, pattern.length]

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
    const track = seqStore.tracks.find((x) => x.id === trackId)
    if (typeof displayData[j][i] === 'undefined') {
      track.pattern.addEvent(note(i, j))
    } else {
      track.pattern.removeEvent(displayData[j][i].id)
    }
    updateInternals()
  }

  const position = { x: 0, y: 0 }

  const resizeId = `resize-grid-${trackId}`
  const panId = `pan-grid-${trackId}`

  onDestroy(() => {
    interact(`#${resizeId}`).unset()
    interact(`#${panId}`).unset()
  })

  onMount(() => {
    setTimeout(() => {
      interact(`#${resizeId}`).resizable({
        edges: { bottom: true },
        listeners: {
          move: function (event) {
            let { x, y } = event.target.dataset

            x = (parseFloat(x) || 0) + event.deltaRect.left
            y = (parseFloat(y) || 0) + event.deltaRect.top

            Object.assign(event.target.style, {
              width: `${event.rect.width}px`,
              height: `${event.rect.height}px`,
              transform: `translate(${x}px, ${y}px)`,
            })

            Object.assign(event.target.dataset, { x, y })
          },
        },
      })

      interact(`#${panId}`).draggable({
        hold: 500,
        listeners: {
          move(event) {
            position.x += event.dx
            position.y += event.dy

            event.target.style.transform = `translate(${position.x}px, ${position.y}px)`
          },
        },
      })
    }, 100)
  })
</script>

<div class="grid-container" id={resizeId}>
  <div class="grid-pan-container" id={panId}>
    <div class="grid">
      {#each displayData as line, j}
        <div class="row">
          {#each line as cell, i}
            <div class="cell" on:click={() => handleClick(i, j)}>
              {cell?.velocity ? cell.velocity : ''}
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>
