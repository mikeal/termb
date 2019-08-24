import { FS, userFS } from './fs.js'
import { PassThrough } from 'stream'

/* This is the primary interface CLI developers
 * interact with.
 */

class TerminalB {
  constructor (module, args) {
    this.appFS = new FS({})
    this.userFS = userFS // only for stdlib
    this.args = args
  }

  log (...args) {
    this.write(args.join('\n') + '\n')
  }
}

class Command {
  constructor (module, args) {
    this.module = module
    this.term = new TerminalB(module, args)
    this.io = new PassThrough()
    this._buffered = []
    this._pendingRead = false
  }

  async config (sender) {
    this.sender = sender
    this.sender = await this.sender // load in order
    // proxy all output by default
    this.term.write = value => this.io.write(value)

    // set reader api on term, use closures for security
    this.term.reader = () => {
      if (this.sender) return this.sender.io.pipe(new PassThrough())
      else {
        const s = new PassThrough()
        s.end()
        return s
      }
    }
  }

  async run () {
    const ret = await this.module.cli(this.term)
    this.io.end()
    return ret
  }

  async shell (lines, sender) {
    const next = await lines.shift()
    await this.config(sender)

    if (!next) {
      return this.run()
    }
    this.next = next
    return Promise.all([this.run(), next.shell(lines, this)])
  }
}

class Privileged extends Command {

}

export { Command, Privileged }
