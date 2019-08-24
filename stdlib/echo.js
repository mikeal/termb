
const cli = async term => {
  return term.write(term.args.join(' '))
}

export { cli }
