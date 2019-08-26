import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __basedir = dirname(__filename)

/* There are a few layers of priviledges here.
 * - builtin = Process class implementation, can do literally anything.
 *   - example: pipe takes over output from console
 *   - these are how we instrument top level shell behavior, nothing else.
 *   - these are cached ahead of time and are not dynamically loaded.
 * - privileded = A process module that is instantiated with a priviledged
 *   Process instance. This gives the utility additional API, access to
 *   the local filesystem, etc.
 *   - still dynamically loaded like other processes, unlike builtins
 * - user = Fully sandboxed application.
 *   - no access to FS other than its application specific fs
 *   - can read input but only from the api instrumented by a pipe process
 */

const stdlib = new Set(['echo', 'cat', 'ls', 'save', 'help'])
const helpers = new Set(['help', '-h', '--help'])

const load = async (line, env) => {
  if (!line) throw new Error('No process given to run')

  // standardized (forced) help forms
  if (helpers.has(line[1])) {
    return load(['help', line[0], ...line.slice(2)])
  }

  const [cmd, ...args] = line
  if (!cmd) throw new Error('line is missing process')
  const module = await import(
    /* webpackIgnore: true */
    __basedir + `/../stdlib/${cmd}.js`
  )
  const _Class = stdlib.has(cmd) ? env.Privileged : env.Process
  const process = new _Class(module, args, env)
  process.name = cmd
  return process
}

const separators = new Set(['&', '&&', '|', '>'])

const shell = async (string, env) => {
  const defaults = [null, null, env]
  const parse = string => {
    let line = []
    const lines = []
    const split = string.split(' ')

    const lc = (...args) => args.forEach(a => lines.push(a))

    while (split.length) {
      const part = split.shift()
      if (separators.has(part)) {
        if (line.length) {
          lines.push(load(line, env))
          line = []
        }
        // eslint-ignore-else
        if (part === '&') lc(new env.Stdout(...defaults), new env.Daemon(...defaults))
        else if (part === '&&') lc(new env.Stdout(...defaults), new env.After(...defaults))
        else if (part === '>') { split.unshift('save') }
        // note that we do nothing on pipe, the default behavior
        // is for one processes output to be sent to the next.
      } else {
        line.push(part)
      }
    }
    if (line.length) {
      if (line[0] !== 'save') {
        lines.push(new env.Stdout())
      }
      lines.push(load(line, env))
    }
    if (!(lines[lines.length - 1] instanceof env.Daemon)) lines.push(new env.Stdout(...defaults))

    return lines
  }

  const processes = parse(string)
  const first = await processes.shift()
  return first.shell(processes)
}

export default shell
