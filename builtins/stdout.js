import { Process } from './process.js'

class Stdout extends Process {
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
