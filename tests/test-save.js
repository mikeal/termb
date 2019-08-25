const echoToFile = async test => {
  var { stdout } = await test.shell('echo world > test.text')
  test.same(stdout, '')

  test.same(test.mockFS['test.text'], 'world')
}

export {
  echoToFile
}
