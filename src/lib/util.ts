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
