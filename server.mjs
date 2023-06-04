import geckos, { iceServers } from '@geckos.io/server'
import { readFile } from 'fs/promises'
import { createServer } from 'http'

const indexHtml = await readFile('index.html', { encoding: 'utf-8' })
const geckosJs = await readFile('./geckos.io-client.2.1.2.min.js', {
  encoding: 'utf-8',
})

const requestListener = async (req, res) => {
  if (req.url === '/')
    return res.writeHead(200, { 'Content-Type': 'text/html' }).end(indexHtml)

  if (req.url === './geckos.io-client.2.1.2.min.js')
    return res
      .writeHead(200, { 'Content-Type': 'application/javascript' })
      .end(geckosJs)

  return res.writeHead(404).end()
}

const server = createServer(requestListener)

const io = geckos({
  iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
})

io.addServer(server)

server.listen(process.env.PORT, () => {
  console.log('server running')
})

io.onConnection((channel) => {
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`)
  })

  channel.emit('chat message', `Welcome to the chat ${channel.id}!`)

  channel.on('chat message', (data) => {
    channel.room.emit('chat message', data)
  })
})
