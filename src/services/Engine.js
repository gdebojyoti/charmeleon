import Messenger from './Messenger'
import Match from '../models/Match'
import cards from '../data/cards'

const matches = [] // list of all matches played since server was started / restarted

class Engine {
  // constructor (socket) {
  //   this.socket = socket
  //   this._subscribeToMessages()
  //   this._initializeMessages()
  // }

  // core methods

  _subscribeToMessages () {
    const messages = ['HOST_MATCH', 'JOIN_MATCH', 'START_MATCH']
    messages.forEach(message => {
      Messenger.subscribe(
        message,
        data => {
          const method = this._messages[message]
          if (method) {
            // TODO: Do some reading on JS concepts such as "this", "call, bind, apply" & "scope"
            method.call(this, data)
          } else {
            console.warn('Unidentified message:', message)
          }
        }
      )
    })
  }

  _initializeMessages () {
    this._messages = {
      HOST_MATCH: this._hostGame,
      JOIN_MATCH: this._joinGame,
      START_MATCH: this._startMatch
    }
  }

  static hostMatch ({ username, name }) {
    // const matchId = new Date().getTime().toString().substr(-4)
    const matchId = 31291

    const match = new Match({
      id: matchId
    })

    match.addHost({ username, name })

    matches.push(match)

    console.log('hosting game directly')

    return matchId
  }

  static joinMatch ({ matchId, username, name }) {
    if (!matchId) {
      console.warn('Match ID is missing')
      return
    }

    const currentMatch = matches.find(match => match.id === matchId)
    if (!currentMatch) {
      console.warn(`No match found with specified ID: "${matchId}"`)
      return
    }

    currentMatch.addGuest({ username, name })

    return currentMatch
  }

  static _startMatch (data) {
    console.log('starting match via message...', data, this)
    const { matchId } = data

    const currentMatch = this._getCurrentMatch(matchId)
    if (!currentMatch) {
      this.socket.triggerClientMessage('MATCH_NOT_FOUND', { msg: 'Invalid or missing match ID' })
      return
    }

    // check if status is PREMATCH
    if (currentMatch.status !== 'PREMATCH') {
      console.warn('Match is not in PREMATCH state')
      return
    }

    // Temp: add 2 extra players
    this.joinGame(matchId, 'Ron')
    this.joinGame(matchId, 'Hermione')

    // check if host ID matches

    // check if at least 2 players are there
    if (currentMatch.players.length < 2) {
      console.warn('At least 2 players are needed')
      return
    }

    // assign cards to players
    // currentMatch.assignCards(shuffle(cards))
    currentMatch.assignCards(cards)

    // start match
    currentMatch.start()

    // trigger message to all clients
    return currentMatch
  }

  _getCurrentMatch (matchId) {
    // exit if match ID is missing
    if (!matchId) {
      console.warn('Match ID is missing')
      return
    }

    // exit if match ID is invalid
    const currentMatch = matches.find(match => match.id === matchId)
    if (!currentMatch) {
      console.warn(`No match found with specified ID: "${matchId}"`)
      return
    }

    return currentMatch
  }
}

export default Engine
