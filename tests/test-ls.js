
const basics = async test => {
  var { stdout } = await test.shell('ls')
  test.same(stdout, '\n')

  test.mockFS['test.text'] = 'hello world'

  var { stdout } = await test.shell('ls')
  test.same(stdout, 'test.text\n')
}

export {
  basics
}
