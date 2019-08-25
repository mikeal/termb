import { Process } from './process.js'

class Daemon extends Process {
  get name () {
    return 'daemon'
  }

  run () {
    this.io.end()
  }
}

export default Daemon
