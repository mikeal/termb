const cli = async term => {
  term.log((await term.userFS.ls()).join('\n'))
}

export { cli }
