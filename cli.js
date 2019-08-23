#!/bin/sh 
":" //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@" /* eslint-disable-line */

 /* Note that linting is disabled for this file because --fix
  * breaks the top line.
  */

import shell from './builtins/shell.js'
const run = async () => {
  await shell(process.argv.slice(2).join(' '))
}
run()
