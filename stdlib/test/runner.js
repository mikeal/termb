class Test {
  constructor (shellModule) {
    this.shellModule = shellModule
  }
  ok (...args) {
    for (let bool of args) {
      if (!bool) throw new Error('Fail')
    }
  }
  _compare (x, y) {
    return x === y
  }
  compare (...args) {
    let x = args.shift()
    while (args.length) {
      let y = args.shift()
      if (!this._compare(x, y)) throw new Error('Fail')
      x = y
    }
  }
  same (...args) {
    if (!this.compare(...args)) throw new Error('Fail')
  }
  shell (...args) {
    return this.shellModule(...args)
  }
}

const run = async (testModules, shellModule, concurrency=10) => {
  let runs = []
  if (Array.isArray(testModules)) {
    throw new Error('Not implemented')
  }
  
  for (let [name, module] of Object.entries(testModules)) {
    for (let [key, test] of Object.entries(module)) {
      let t = new Test(shellModule)
      t.module = name
      t.name = key
      runs.push(() => test(t))
    }
  }
  let running = new Set() 
  let _run = () => {
    if (runs.length) {
      let p = runs.shift()()
      p.then(() => running.delete(p))
      running.add(p)
    }
  }

  for (let i = 0; i < concurrency; i++) {
    _run()  
  }
  while (running.size) {
    await Promise.race(Array.from(running))
    _run()
  }
}

export default run
