import micro from 'micro'

const service = async req => {
  console.log(req)
}

export default async (req, res) => {
  console.log('asdf')
  await service(req)
}
