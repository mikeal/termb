
const cli = async term => {
  console.log('writing', term.args)
  return term.write(term.args.join(' '))
}

export { cli }
