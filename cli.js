#!/bin/sh 
":" //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@"
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { Command, Privileged } from './builtins/command.js'
import Pipe from './builtins/pipe.js'
import After from './builtins/after.js'
import Stdout from './builtins/stdout.js'
import Daemon from './builtins/daemon.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const builtin = async cmd => {
  const CommandClass = (await import(__dirname + `/stdlib/${cmd}.js`)).default
  return new CommandClass()
}

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

const stdlib = new Set([ 'echo', 'ls', 'save', 'help' ])
const helpers = new Set(['help', '-h', '--help'])

const load = async line => {
  if (!line) throw new Error('No command given to run')

  // standardized (forced) help forms
  if (helpers.has(line[1])) {
    return load(['help', line[0], ...line.slice(2)])
  }

  let [cmd, ...args] = line
  let module = await import(__dirname + `/stdlib/${cmd}.js`)
  let _Class = stdlib.has(cmd) ? Privileged : Command
  return new Command(module, args)
}

const separators = new Set(['&', '&&', '|', '>'])

const parse = string => {
  let line = []
  let lines = []
  let split = string.split(' ')
  
  const lc = (...args) => args.forEach(a => lines.push(a))
  
  while (split.length) {
    let part = split.shift()
    if (separators.has(part)) {
      if (line.length) {
        lines.push(load(line))
        line = []
      }
      // eslint-ignore-else 
      if (part === '&') lc(new Stdout(), new Daemon())
      else if (part === '&&') lc(new Stdout(), new After())
      else if (part === '|') lines.push(new Pipe())
      else if (part === '>') split = ['|', 'save'].concat(split)
    } else {
      line.push(part)
    }
  }
  if (line.length) lc(new Stdout(), load(line))
  if (!lines[lines.length-1] instanceof Daemon) lines.push(stdout)
  
  return lines
}

const run = async string => {
  const lines = parse(string)
  const first = await lines.shift()
  first.shell(lines)
}

run(process.argv.slice(2).join(' '))
