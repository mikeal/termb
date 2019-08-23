class FS {
  constructor (db) {
    this.db = db
  }

  async get (path) {
    return this.db[path]
  }

  async ls (path) {
    return Object.keys(this.db)
  }

  async put (path, value) {
    this.db[path] = value
  }
}

const userFS = new FS({ 'test.text': 'hello world' })

export { userFS, FS }
