import { Command } from './command.js'

class Daemon extends Command {
  run () {
    this.io.end()
  }
}

export default Daemon
