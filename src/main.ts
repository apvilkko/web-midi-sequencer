import './app.css'
import App from './App.svelte'

window.onerror = (msg, url, line, col, error) => {
  document.getElementById(
    'log'
  )!.innerHTML = `<p>error: ${msg} | ${url} | ${line} | ${col} | ${error}</p>`
}

window.onunhandledrejection = (event: PromiseRejectionEvent) => {
  document.getElementById(
    'log'
  )!.innerHTML = `<p>unhandled: ${event.reason}</p>`
}

const app = new App({
  target: document.getElementById('app'),
})

export default app
