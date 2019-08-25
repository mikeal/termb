import { Process } from './process.js'

class After extends Process {
  get name () {
    return 'after'
  }

  run () {
    // noop
    this.io.end()
  }

  async shell (processes, sender) {
    if (!sender) throw new Error('Sender required')
    const generator = sender.io[Symbol.asyncIterator]()

    while (true) {
      const { done } = await generator.next()
      if (done) break
    }
    return super.shell(processes, this)
  }
}

export default After
