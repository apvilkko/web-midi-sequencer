import { writable } from 'svelte/store'

type Signals = {
  recorded: number
  portsChanged: number
  tracksChanged: number
}

export const signalStore = writable<Signals>({
  recorded: 0,
  portsChanged: 0,
  tracksChanged: 0,
})
