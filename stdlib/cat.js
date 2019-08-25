
const cli = async term => {
  if (!term.args.length) throw new Error('Unsupported: interactive mode has not been implemented')
  for (let filename of term.args) {
    let f = await term.env.userFS.get(filename)
    term.write(f)
  }
}

export { cli }
