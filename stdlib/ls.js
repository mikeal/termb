const cli = async term => {
  term.log((await term.env.userFS.ls()).join('\n'))
}

export { cli }
