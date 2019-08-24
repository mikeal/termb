#!/bin/sh 
":" //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@" /* eslint-disable-line */

 /* Note that linting is disabled for this file because --fix
  * breaks the top line.
  */

import shell from './builtins/shell.js'
import * as env from './builtins/env.js'

const run = async () => {
  let args = process.argv.slice(2)
  if (args[0] === 'test') {
    let runner = (await import('./stdlib/test/runner.js')).default
    if (args[1] === '--all') {
      let modules = await import('./tests/all.js')
      await runner(modules, shell, env)
    } else {
      await runner(args, shell, env)
    }
  } else {
    await shell(args.join(' '), env)
  }
}
run()
