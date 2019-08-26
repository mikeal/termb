import testServer from '../stdlib/test/server.js'
import micro from 'micro'
import puppeteer from 'puppeteer'
import { sleep } from '../stdlib/sleep.js'

const runner = async args => {
  const s = micro(testServer)
  await s.listen(80)
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  const page = await browser.newPage()
  await page.goto('http://localhost')
  await s.close()
}

export default runner
