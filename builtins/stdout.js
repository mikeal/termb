import { Command } from './command.js'

class Stdout extends Command {
  get name () {
    return 'stdout'
  }
  async run () {
    let reader = this.term.reader()
    for await (const value of reader) {
      process.stdout.write(value)
    }
    this.io.end()
  }
}

export default Stdout
