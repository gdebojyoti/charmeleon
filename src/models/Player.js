class Player {
  constructor (data) {
    const { username, name } = data
    this.username = username
    this.name = name
    this.cards = []
    this.isBot = false
    this.canDraw = true
    this.canPass = false

    // TODO: temporary solution
    if (username === 'debojyoti') {
      this.borderId = 1
    }

    // client specific
    this.c_isHost = false
    this.c_isTurn = false
  }

  assignCards (cards) {
    this.cards = cards
  }

  removeCard (index) {
    this.cards.splice(index, 1)
  }

  addCard (card) {
    this.cards.push(card)
  }

  toggleDrawCard (state) {
    this.canDraw = state
  }

  togglePassTurn (state) {
    this.canPass = state
  }
}

export default Player
