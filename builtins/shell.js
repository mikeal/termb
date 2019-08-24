import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { Command, Privileged } from './command.js'
import After from './after.js'
import Stdout from './stdout.js'
import Daemon from './daemon.js'

const __filename = fileURLToPath(import.meta.url)
const __basedir = dirname(__filename)

/* There are a few layers of priviledges here.
 * - builtin = Command class implementation, can do literally anything.
 *   - example: pipe takes over output from console
 *   - these are how we instrument top level shell behavior, nothing else.
 *   - these are cached ahead of time and are not dynamically loaded.
 * - privileded = A command module that is instantiated with a priviledged
 *   Command instance. This gives the utility additional API, access to
 *   the local filesystem, etc.
 *   - still dynamically loaded like other commands, unlike builtins
 * - user = Fully sandboxed application.
 *   - no access to FS other than its application specific fs
 *   - can read input but only from the api instrumented by a pipe command
 */

const stdlib = new Set(['echo', 'ls', 'save', 'help'])
const helpers = new Set(['help', '-h', '--help'])

const load = async line => {
  if (!line) throw new Error('No command given to run')

  // standardized (forced) help forms
  if (helpers.has(line[1])) {
    return load(['help', line[0], ...line.slice(2)])
  }

  const [cmd, ...args] = line
  if (!cmd) throw new Error('line is missing command')
  const module = await import(__basedir + `/../stdlib/${cmd}.js`)
  const _Class = stdlib.has(cmd) ? Privileged : Command
  const command = new _Class(module, args)
  command.name = cmd
  return command
}

const separators = new Set(['&', '&&', '|', '>'])

const parse = string => {
  let line = []
  const lines = []
  let split = string.split(' ')

  const lc = (...args) => args.forEach(a => lines.push(a))

  while (split.length) {
    const part = split.shift()
    if (separators.has(part)) {
      if (line.length) {
        lines.push(load(line))
        line = []
      }
      // eslint-ignore-else
      if (part === '&') lc(new Stdout(), new Daemon())
      else if (part === '&&') lc(new Stdout(), new After())
      else if (part === '>') split = ['|', 'save'].concat(split)
      // note that we do nothing on pipe, the default behavior
      // is for one commands output to be sent to the next.
    } else {
      line.push(part)
    }
  }
  if (line.length) lc(new Stdout(), load(line))
  if (!(lines[lines.length - 1] instanceof Daemon)) lines.push(new Stdout())

  return lines
}

const shell = async string => {
  const commands = parse(string)
  let sender = null
  const first = await commands.shift()
  return first.shell(commands)
}

export default shell
