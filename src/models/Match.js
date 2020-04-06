import Player from '../models/Player'

import { checkCard } from '../utilities/card'

const statusMap = {
  PREMATCH: 'PREMATCH',
  LIVE: 'LIVE',
  COMPLETED: 'COMPLETED',
  ABANDONED: 'ABANDONED'
}

class Match {
  constructor (data) {
    const { id, code } = data
    this.id = id
    this.code = code
    this.status = statusMap.PREMATCH
    this.players = []
    this.currentTurn = 0 // ID of player whose turn it currently is
    this.host = null // ID of host player
    this.discardPile = []
    this.order = [] // list of player IDs specifying the order in which players have their turns
    this.isReversed = false // set to true, if turn is going anti-clockwise
    this.lastCardData = null

    // server specific
    this.s_drawPile = []
  }

  addHost ({ username, name }) {
    const host = new Player({ username, name })

    this.players.push(host)
    this.host = username
    this.order.push(username)
  }

  addGuest ({ username, name }) {
    const guest = new Player({ username, name })

    this.players.push(guest)
    this.order.push(username)
  }

  // create draw pile and assign cards to players
  assignCards (cards) {
    // initialize draw pile from cards supplied
    this.s_drawPile = [...cards]

    // assign 7 cards to each player
    const cardsForEach = 7 // number of cards for each player
    this.players.forEach((player, index) => {
      // player.assignCards(this.s_drawPile.splice(0, cardsForEach))
      player.assignCards(this.s_drawPile.splice(-cardsForEach))
    })
  }

  start () {
    if (this.status !== statusMap.PREMATCH) {
      console.warn('Cannot start match; status is not PREMATCH')
      return
    }

    // initialize discard pile
    this.discardPile = this.s_drawPile.splice(0, 1)
    this.lastCardData = checkCard(this.discardPile[0])

    // host will have first turn
    this.currentTurn = this.host

    // set match status to LIVE
    this.status = statusMap.LIVE
  }

  cardPlayed (index, playerOptions = {}) {
    const player = this._getCurrentPlayer()
    if (!player) {
      return
    }

    // check if card exists
    if (player.cards.length <= index) {
      console.warn('Card not found')
    }

    // check if card matches last card (by color, number or type)
    const playedCard = player.cards[index]
    if (!this._checkCardMatch(playedCard)) {
      console.warn('Invalid card. Please play a matching one')
      return
    }

    // remove card from player
    player.removeCard(index)

    // add card to discard pile
    this.discardPile.push(playedCard)

    // allow player to draw card
    player.toggleDrawCard(true)

    // stop player from passing their turn
    player.togglePassTurn(false)

    this.lastCardData = checkCard(playedCard, playerOptions)

    // process last card data (skip others' turns; make other players draw cards; etc)
    this._processLastCard()

    return true
  }

  isGameOver () {
    return this._checkForWinnerByNoCards()
  }

  drawCard () {
    const player = this._getCurrentPlayer()
    if (!player) {
      return
    }

    // check if player can draw card
    if (!player.canDraw) {
      console.warn('Cannot draw card')
      return
    }

    // withdraw the first card from draw pile
    const card = this.s_drawPile.splice(0, 1)[0]
    player.addCard(card)

    // disable player from drawing card
    player.toggleDrawCard(false)

    // enable player to pass their turn
    player.togglePassTurn(true)
  }

  passTurn () {
    const player = this._getCurrentPlayer()
    if (!player) {
      return
    }

    // check if player can pass turn
    if (!player.canPass) {
      console.warn('Cannot pass turn')
      return
    }

    // enable player to draw card
    player.toggleDrawCard(true)

    // disable player from passing their turn
    player.togglePassTurn(false)

    // update current turn
    this._updateTurn()
  }

  // TODO: Find a better owner of this method; remove cards from players; create new field (match.cards) for player's cards only
  getPublicFields () {
    return {
      id: this.id,
      code: this.code,
      status: this.status,
      players: this.players,
      currentTurn: this.currentTurn,
      host: this.host,
      discardPile: this.discardPile,
      order: this.order,
      isReversed: this.isReversed,
      lastCardData: this.lastCardData
    }
  }

  // private methods

  // detect player whose turn it is
  _getCurrentPlayer () {
    // TODO: Check if correct player took the turn
    return this.players.find(player => player.username === this.currentTurn)
  }

  _updateTurn () {
    console.log('order', this.order)
    const index = this.order.indexOf(this.currentTurn)

    if (this.isReversed) {
      this.currentTurn = index > 0 ? this.order[index - 1] : this.order.slice(-1)[0]
    } else {
      this.currentTurn = index >= this.order.length - 1 ? this.order[0] : this.order[index + 1]
    }
  }

  // check if card matches last card (by color, number or type)
  _checkCardMatch (playedCard) {
    let isValid = false

    if (this.lastCardData.color === playedCard.color) {
      isValid = true
    } else if (this.lastCardData.name === playedCard.name) {
      isValid = true
    } else if (['WILD_DRAW_FOUR', 'WILD'].indexOf(playedCard.name) > -1) {
      isValid = true
    }

    return isValid
  }

  _processLastCard () {
    let { opponentSkips } = this.lastCardData
    const { name, drawsForNextPlayer } = this.lastCardData

    if (name === 'REVERSE') {
      this.isReversed = !this.isReversed
    }

    // update current turn (i.e., go to next player)
    this._updateTurn()

    // add cards to players
    if (drawsForNextPlayer) {
      const nextPlayer = this._getCurrentPlayer()
      if (!nextPlayer) {
        return
      }
      // withdraw the first card from draw pile
      const cards = this.s_drawPile.splice(0, drawsForNextPlayer)
      cards.forEach(card => nextPlayer.addCard(card))
    }

    // skip players turns
    while (opponentSkips > 0) {
      this._updateTurn()
      opponentSkips--
    }
  }

  // return true if a player with no cards is found
  _checkForWinnerByNoCards (player) {
    const winner = this.players.find(player => player.cards.length === 0)
    if (winner) {
      this.status = statusMap.COMPLETED // update status
      this.code = '' // reset match code
      return true
    }

    return false
  }
}

export default Match
