import { PPQN } from './constants'
import { NoteLength } from './types'

export const min = <T>(arr: Array<T>, key: keyof T): number => {
  let m: number | undefined = undefined
  for (let i = 0; i < arr.length; ++i) {
    if (typeof m === 'undefined' || (arr[i][key] as number) < m) {
      m = arr[i][key] as number
    }
  }
  return m
}

export const max = <T>(arr: Array<T>, key: keyof T): number => {
  let m: number | undefined = undefined
  for (let i = 0; i < arr.length; ++i) {
    if (typeof m === 'undefined' || (arr[i][key] as number) > m) {
      m = arr[i][key] as number
    }
  }
  return m
}

export const noteLengthToTicks = (nl: NoteLength) => {
  switch (nl) {
    case NoteLength.SIXTEENTH:
      return PPQN / 4
    default:
      throw new Error('unhandled note length ' + nl)
  }
}
