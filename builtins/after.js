import { Command } from './command.js'

class After extends Command {
  get name () {
    return 'after'
  }
  run () {
    // noop
    this.io.end()
  }
  async shell (...args) {
    if (!this.sender) throw new Error('Sender required')
    let generator = this.sender.io[Symbol.asyncIterator]()

    while (true) {
      const { done } = await generator.next()   
      if (done) break
    }
    return super.shell(...args)
  }
}

export default After
