import SocketIo from 'socket.io'

import Clients from '../models/Clients'
import Engine from './Engine'

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

    let matchId = null
    let roomId = null

    // when a player disconnects, inform others
    socket.on('disconnect', function () {
      console.log('player has disconnected')
      socket.in(matchId).emit('PLAYER_LEFT', {
        playerId: ''
      })

      // // leave room
      // socket.leave(roomId)
    })

    socket.on('HOST_MATCH', hostMatch.bind(this))

    // when a new player joins, inform everyone
    socket.on('JOIN_MATCH', joinMatch.bind(this))

    // when an existing player tries to rejoin
    socket.on('REJOIN_MATCH', rejoinMatch.bind(this))

    // when host clicks 'start match' button
    socket.on('START_MATCH', startMatch.bind(this))

    function hostMatch (data) { // data = { matchId, username }
      console.log('hosting match...', data)

      // update match & room ID if player is hosting match
      matchId = Engine.hostMatch(data)
      roomId = `room-${matchId}`

      // add player to room
      socket.join(roomId)

      // update client list
      this.clients.update(data.username, socket.id)

      // send message to socket client
      socket.emit('MATCH_HOSTED', matchId)
    }

    function joinMatch (data) { // data = { matchId, username }
      const match = Engine.joinMatch(data)
      if (!match) {
        socket.emit('MATCH_JOIN_FAILED')
        return
      }

      // update match & room ID if player is joining match
      matchId = data.matchId
      roomId = `room-${matchId}`

      // add player to room
      socket.join(roomId)

      // update client list
      this.clients.update(data.username, socket.id)

      console.log('match joined...')

      // send message to socket client
      socket.emit('MATCH_JOINED', match)
      // send message to other players
      socket.to(roomId).emit('PLAYER_JOINED', match) // TODO: send new player data only
    }

    function rejoinMatch (data) {
      const { username, matchId } = data
      const match = Engine.getMatchDetails(matchId, username)

      if (!match) {
        // console.log('all matches', Engine.__fetchAllMatches())
        socket.emit('MATCH_REJOIN_FAILED')
      } else {
        socket.emit('MATCH_REJOINED', match)
      }
    }

    function startMatch (data) {
      const match = Engine.startMatch(data)
      if (typeof match === 'string') {
        socket.emit('MATCH_START_FAILED', match)
        return
      }

      this.io.in(roomId).emit('MATCH_STARTED', match)
    }
  }

  // public methods

  triggerClientMessage (msg, data) {}
}

export default Socket
