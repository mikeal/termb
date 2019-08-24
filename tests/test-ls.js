
const basics = async test => {
  const { stdout } = await test.shell('ls')
  test.same(stdout, 'test.text\n')
}

export {
  basics
}
