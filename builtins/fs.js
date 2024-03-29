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

// temporary, for development only
const userFS = new FS({})

export { userFS, FS }
