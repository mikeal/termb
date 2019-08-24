import { Command } from './command.js'

class Stdout extends Command {
  get output () {
    return process.stdout
  }

  get name () {
    return 'stdout'
  }

  async run () {
    const reader = this.term.reader()
    for await (const value of reader) {
      this.output.write(value)
    }
    this.io.end()
  }
}

export default Stdout
