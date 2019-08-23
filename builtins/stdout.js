import { Command } from './command.js'

class Stdout extends Command {
  config (next) {
    
  }
  write (arg) {
    process.stdout.write(arg)
  }
  run () {

  }
}

export default Stdout
