class Test {
  constructor (shellModule, env) {
    this.shellModule = shellModule
    this.env = () => Object.assign({}, env, this._env(env))
    this.mockFS = {}
  }

  _env (env) {
    let stdout = ''
    const userFS = new env.FS(this.mockFS)
    class Stdout extends env.Stdout {
      get output () {
        return {
          write: value => {
            stdout += value.toString()
          }
        }
      }
    }
    const results = () => ({ stdout })
    return { Stdout, results, userFS }
  }

  ok (...args) {
    for (const bool of args) {
      if (!bool) throw new Error('Fail')
    }
  }

  _compare (x, y) {
    return x === y
  }

  compare (...args) {
    let x = args.shift()
    while (args.length) {
      const y = args.shift()
      if (!this._compare(x, y)) return false 
      x = y
    }
    return true
  }

  same (...args) {
    if (!this.compare(...args)) throw new Error('Fail')
  }

  async shell (string, env) {
    env = Object.assign({}, this.env(), env)
    await this.shellModule(string, env)
    return env.results()
  }
}

const run = async (testModules, shellModule, env, concurrency = 10) => {
  const runs = []
  if (Array.isArray(testModules)) {
    throw new Error('Not implemented')
  }

  for (const [name, module] of Object.entries(testModules)) {
    for (const [key, test] of Object.entries(module)) {
      const t = new Test(shellModule, env)
      t.module = name
      t.name = key
      runs.push(async () => {
        await test(t)
        return t
      })
    }
  }
  const running = new Set()
  const _run = () => {
    if (runs.length) {
      const p = runs.shift()()
      p.then(() => running.delete(p))
      running.add(p)
    }
  }

  for (let i = 0; i < concurrency; i++) {
    _run()
  }
  while (running.size) {
    let test = await Promise.race(Array.from(running))
    console.log('* test:passed', test.module + '/' + test.name)
    _run()
  }
}

export default run
