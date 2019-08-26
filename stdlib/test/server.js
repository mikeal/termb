import micro from 'micro'

const service = async req => {
  let file = req.env.registryFS.get(req.path)
  return file
}

const router = async (env, req, res) => {
  res.setHeader('content-type', 'text/javascript')
  let f = await service({
   path: req.url.slice('/_registry/'.length),
   env
  })
  res.end(f)
}

export default async (env, req, res) => {
  if (req.url === '/') return env.index.toString()
  if (req.url.startsWith('/_')) {
    return router(env, req, res)
  }
  let f = env.getFile(req.url.slice(1))
  if (req.url.endsWith('.js')) {
    res.setHeader('content-type', 'text/javascript')
    res.end(f)
  }
}
