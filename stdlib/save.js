const cli = async term => {
  const parts = []
  const reader = term.reader()
  for await (const chunk of reader) {
    parts.push(chunk)
  }
  return term.env.userFS.put(term.args[0], parts.join(''))
}

export { cli }
