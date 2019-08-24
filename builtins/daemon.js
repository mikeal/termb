import { Command } from './command.js'

class Daemon extends Command {
  get name () {
    return 'daemon'
  }
  run () {
    this.io.end()
  }
}

export default Daemon
