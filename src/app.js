import express from 'express'
import path from 'path'

import Socket from './services/Socket'
import Routes from './routes'

(function () {
  'use strict'

  const PORT = process.env.PORT || 3333
  const INDEX = path.join(__dirname, 'index.html')

  const server = express()

  const socketHook = server.listen(PORT, () => console.log(`Listening on ${PORT}`))

  const socket = new Socket(socketHook)

  const routes = new Routes(socket)
  server.get('/', routes.getDefault)
  server.get('/matches', (req, res) => routes.getActiveMatches(req, res))
  server.get('/findMatchIdByCode/:code', (req, res) => routes.getMatchIdByCode(req, res))

  server.use((req, res) => res.sendFile(INDEX))
})()
