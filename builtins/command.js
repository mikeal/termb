import { FS, userFS } from './fs.js'

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
    this.finished = new Promise((resolve, reject) => {
      this._finished = [resolve, reject]
    })
  }
  config (next) {
    // proxy all output by default
    this.term.write = (...args) => this.write(...args)
  }
  write (...args) {
    this.next.write(...args)
  }
  run () {
    return this.module.cli(this.term)
  }
  async shell (lines) {
    const sep = lines.shift()
    const next = await lines.shift()
    
    if (!next) {
      this.run()
      return this.finished
    }
    this.next = next
    this.config(next)
    next.shell(lines)
    this.run()
  }
}

class Privileged extends Command {
  
}

export { Command, Privileged }
