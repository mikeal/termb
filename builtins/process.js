import { FS } from './fs.js'
import { PassThrough } from 'stream'

/* This is the primary interface CLI developers
 * interact with.
 */

const pass = () => new PassThrough({ objectMode: true })

class TerminalB {
  constructor (module, args, env) {
    this.appFS = new FS({})
    this.env = env
    this.args = args
  }

  log (...args) {
    this.write(args.join('\n') + '\n')
  }
}

class Process {
  constructor (module, args, env) {
    this.module = module
    this.env = env
    this.term = new TerminalB(module, args, env)
    this.io = pass()
    this._buffered = []
    this._pendingRead = false
  }

  async config (sender) {
    this.sender = await sender // load in order
    // proxy all output by default
    this.term.write = value => this.io.write(value)

    // set reader api on term, use closures for security
    this.term.reader = () => {
      if (this.sender) return this.sender.io.pipe(pass())
      else {
        const s = pass()
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
    if (!sender) {
      // console.log((await Promise.all([this, next].concat(lines))).map(x => x.name))
    }

    if (!next) {
      return this.run()
    }
    this.next = next
    return Promise.all([this.run(), next.shell(lines, this)])
  }
}

class Privileged extends Process {
  config (...args) {
    const ret = super.config(...args)
    this.term.env = this.env
    return ret
  }
}

export { Process, Privileged }
