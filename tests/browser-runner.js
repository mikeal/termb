import testServer from '../stdlib/test/server.js'
import micro from 'micro'
import fs from 'fs'
import puppeteer from 'puppeteer'
import { sleep } from '../stdlib/sleep.js'

import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __basedir = dirname(__filename)

const runner = async args => {
  const env = { 
    index: fs.readFileSync(__basedir + '/browser-runner.html'),
    getFile: filename => {
      if (!filename) throw new Error('here')
      return fs.readFileSync(__basedir + '/../' + filename)
    },
    registryFS: {
      get: path => {
        return env.getFile('stdlib/' + path)
      }
    }
  }
  const s = micro((req, res) => testServer(env, req, res))
  await s.listen(80)
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  await page.evaluate(() => console.log(`url is ${location.href}`))
  await page.goto('http://localhost')
  await page.evaluate(() => console.log(`url is ${location.href}`))
  // await s.close()
}

export default runner
