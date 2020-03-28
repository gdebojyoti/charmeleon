import SocketIo from 'socket.io'

import Clients from '../models/Clients'
import Messenger from './Messenger'
import Engine from './Engine'

// const db = {
//   players: null,
//   matches: null,
//   currentMatches: null
// }

class Socket {
  constructor (server) {
    this.matches = [] // list of all matches - @TODO: this should be in DB

    this.clients = new Clients()

    this.io = SocketIo(server)
    this.io.on('connection', this._onConnection.bind(this))

    console.log('Socket opened. Listening...')
  }

  // core methods

  _onConnection (socket) {
    console.log('new connection...', socket.id, this.matches)

    const matchId = ''

    // when a player disconnects, inform others
    socket.on('disconnect', function () {
      console.log('player has disconnected')
      socket.in(matchId).emit('PLAYER_LEFT', {
        playerId: ''
      })
    })

    socket.on('HOST_MATCH', hostMatch)

    // when a new player joins, inform everyone
    socket.on('JOIN_MATCH', joinMatch)

    // when host clicks 'start match' button
    socket.on('START_MATCH', startMatch)

    function hostMatch (data) {
      console.log('hosting match...', data)
      const matchId = Engine.hostMatch(data)
      socket.emit('MATCH_HOSTED', { matchId })
      // Messenger.publish('HOST_MATCH', data)
    }

    function joinMatch (data) {
      console.log('joining match...', data)
      const match = Engine.joinMatch(data)
      if (!match) {
        socket.emit('MATCH_JOIN_FAILED')
      }

      socket.emit('MATCH_JOINED', match)
      // Messenger.publish('JOIN_MATCH', data)
    }

    function startMatch (data) {
      Messenger.publish('START_MATCH', data)
    }
  }

  // public methods

  triggerClientMessage (msg, data) {}
}

export default Socket
