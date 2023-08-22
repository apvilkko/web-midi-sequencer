export const startWorker = (fn: () => void) => {
  const inlined =
    "self.addEventListener('message', function() {setInterval(function() {self.postMessage(true)}, 25)});"
  const url = window.URL || window.webkitURL
  const blobUrl = url.createObjectURL(new Blob([inlined]))
  const worker = new Worker(blobUrl)
  worker.postMessage('start')
  worker.addEventListener('message', () => fn())
  ;(window as unknown as { worker: Worker }).worker = worker
}
