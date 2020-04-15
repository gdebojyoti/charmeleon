import Match from '../models/Match'
import cards from '../data/cards'

import { shuffle } from '../utilities/general'

const matches = [] // list of all matches played since server was started / restarted

class Engine {
  static hostMatch ({ username, name, matchId: matchIdProp = '', debug = false }) {
    const matchId = matchIdProp || `t-${new Date().getTime().toString().substr(0, 10)}`

    // code is '31291' if debug=true in client URL; else generate random code
    const code = debug ? '31291' : new Date().getTime().toString().substr(-6)

    const match = new Match({
      id: matchId,
      code
    })

    match.addHost({ username, name })

    matches.push(match)

    return match
  }

  static joinMatch ({ code, username, name }) {
    if (!code) {
      console.warn('Match code is missing')
      return
    }

    const currentMatch = matches.find(match => match.code === code)
    if (!currentMatch) {
      console.warn(`No match found with specified code: "${code}"`)
      return
    }

    currentMatch.addGuest({ username, name })

    return currentMatch
  }

  static startMatch (data, username) {
    const { matchId, debug = false } = data

    const currentMatch = this._getCurrentMatch(matchId)
    if (!currentMatch) {
      return 'Match not found. Invalid or missing match ID'
    }

    // check if status is PREMATCH
    if (currentMatch.status !== 'PREMATCH') {
      console.warn('Match is not in PREMATCH state')
      return 'Match is not in PREMATCH state'
    }

    // // Fake bot
    // this.joinMatch({ code: 31291, username: 'ron', name: 'Ron' })

    // check if host ID matches
    if (currentMatch.host !== username) {
      console.warn('Only host can start match')
      return 'Only host can start match'
    }

    // check if at least 2 players are there
    if (currentMatch.players.length < 2) {
      console.warn('At least 2 players are needed')
      return 'At least 2 players are needed'
    }

    // shuffle cards & assign them to players
    if (debug) {
      // do not shuffle cards if debug=true in client URL
      console.warn('Assigning non-shuffled cards (developer mode)')
      currentMatch.assignCards(cards)
    } else {
      currentMatch.assignCards(shuffle(cards))
    }

    // start match
    currentMatch.start()

    // trigger message to all clients
    return currentMatch
  }

  static getRestartMatchDetails (matchId) {
    const parts = matchId.split('__')

    let nextMatchId = ''

    if (!parts[1]) {
      nextMatchId = `${matchId}__1`
    } else {
      nextMatchId = `${parts[0]}__${parseInt(parts[1]) + 1}`
    }

    return {
      nextMatchId,
      match: matches.find(match => match.id === nextMatchId)
    }
  }

  // check if it is correct player's turn; then attempt to play card
  static cardPlayed ({ username, matchId, id, options }) {
    const currentMatch = this._getCurrentMatch(matchId)
    if (!currentMatch) {
      return 'Match not found'
    }

    if (currentMatch.currentTurn !== username) {
      return 'Not your turn bitch!'
    }

    const isPlayed = currentMatch.cardPlayed(id, options)
    if (!isPlayed) {
      return 'Not a valid choice'
    }

    return currentMatch
  }

  static isGameOver (match) {
    return match.isGameOver()
  }

  // check if it is correct player's turn; then attempt to draw card
  static drawCard ({ username, matchId }) {
    const currentMatch = this._getCurrentMatch(matchId)
    if (!currentMatch) {
      return 'Match not found'
    }

    if (currentMatch.currentTurn !== username) {
      return 'Not your turn bitch!'
    }

    currentMatch.drawCard()

    return currentMatch
  }

  // check if it is correct player's turn; then attempt to pass turn
  static passTurn ({ username, matchId }) {
    const currentMatch = this._getCurrentMatch(matchId)
    if (!currentMatch) {
      return 'Match not found'
    }

    if (currentMatch.currentTurn !== username) {
      return 'Not your turn bitch!'
    }

    currentMatch.passTurn()

    return currentMatch
  }

  static getMatchDetails (matchId, username) {
    const match = matches.find(match => match.id === matchId)
    if (!match) {
      return
    }

    const player = match.players.find(player => player.username === username)
    if (!player) {
      return
    }

    return match.getPublicFields()
  }

  static removePlayer (matchId, username) {
    const match = matches.find(match => match.id === matchId)
    if (!match) {
      return
    }

    // remove player details from: players, order, currentTurn
    return match.removePlayer(username)
  }

  static __fetchAllMatches () {
    return matches
  }

  // private methods

  static _getCurrentMatch (matchId) {
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
