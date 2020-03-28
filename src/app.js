import express from 'express'
import path from 'path'

import Socket from './services/Socket'
import Engine from './services/Engine'

(function () {
  'use strict'

  const PORT = process.env.PORT || 3333
  const INDEX = path.join(__dirname, 'index.html')

  const server = express()
    .use((req, res) => res.sendFile(INDEX))
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

  const socket = new Socket(server)
  const engine = new Engine(socket) // TODO: fix this warning
})()
