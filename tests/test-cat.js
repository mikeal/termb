
const fileToStdout = async test => {
  test.mockFS['test.text'] = 'testing cat'
  
  var { stdout } = await test.shell('cat test.text')
  test.same(stdout, 'testing cat')
}

export {
  fileToStdout 
}
