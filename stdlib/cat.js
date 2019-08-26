
const cli = async term => {
  if (!term.args.length) throw new Error('Unsupported: interactive mode has not been implemented')
  for (const filename of term.args) {
    const f = await term.env.userFS.get(filename)
    term.write(f)
  }
}

export { cli }
