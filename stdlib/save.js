const cli = async term => {
  let parts = []
  let reader = term.reader()
  for await (let chunk of reader) {
    parts.push(chunk)
  }
  return term.userFS.put(term.args[0], parts.join(''))
}

export { cli }
