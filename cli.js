#!/bin/sh 
":" //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@"
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

class FS {
  constructor (db) {
    this.db = db
  }
  async get (path) {
    return this.db[path]
  }
  async ls (path) {
    return Object.keys(this.db)
  }
  async put (path, value) {
    this.db[path] = value
  }
}

const userFS = new FS({test: 'hello'})

class Pipe {
}

class Terminal {
  constructor (command) {
    this.command = command
    this.appFS = new FS({})
    this.userFS = userFS // only for stdlib
  }
  async run (command) {
    let result = await command.cli(this)
    console.log('run done')
  }
  log (output) {
    console.log(output)
  }
}

const load = async line => {
  if (!line) throw new Error('No command given to run')
  let split = line.split(' ')
  let [cmd, ...args] = line.split(' ')
  let c = await import(__dirname + `/stdlib/${cmd}.js`)
  return new Terminal(c)
}

const parse = async string => {
  let line = []
  let lines = []
  let split = string.split()
  while (split.length) {
    let part = split.shift()
    if (part === '&' ||
        part === '&&' ||
        part === '|' ||
        part === '>'
    ) {
      if (line.length) {
        lines.push(line)
        line = []
      }
      lines.push(part)
    } else {
      line.push(part)
    }
  }
  if (line.length) lines.push(line)
  console.log(lines)
}

run(process.argv.slice(2).join(' '))
