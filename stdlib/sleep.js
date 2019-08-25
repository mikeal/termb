const sleep = ms => new Promise(resolve => {
  setTimeout(() => resolve(true), ms)
})

const cli = async term => {
  if (term.args.length !== 1) throw new Error('Sleep only accepts a single argument.')
  await sleep(term.args[0])
}

export { cli, sleep }
