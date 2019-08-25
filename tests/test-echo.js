
const printText = async test => {
  var { stdout } = await test.shell('echo testing')
  test.same(stdout, 'testing')
}

export {
  printText 
}
