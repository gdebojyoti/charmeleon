// import { cardTypes } from 'constants'

// check card for special properties (eg: SKIP, WILD_CARD)
export function checkCard (card, playerOptions = {}) {
  const { type, name, color, ...rest } = card

  const response = {
    // selfSkip: false, // if true, skip player's next turn
    opponentSkips: 0, // number of opponents whose turn is to be skipped; -1 for all
    color, // color for next turn
    // TODO: consider adding another prop for 'color' if card & effective colors are different - may be the case in a future ACTION card
    name,
    type,
    drawsForNextPlayer: 0,
    ...rest
  }

  if ((['WILD_DRAW_FOUR', 'WILD'].indexOf(name) > -1) && playerOptions.color) {
    response.color = playerOptions.color
  }

  switch (name) {
    case 'WILD_DRAW_FOUR': {
      response.opponentSkips = 1
      response.drawsForNextPlayer = 4
      break
    }
    case 'DRAW_TWO': {
      response.opponentSkips = 1
      response.drawsForNextPlayer = 2
      break
    }
    case 'SKIP': {
      response.opponentSkips = 1
      break
    }
  }

  return response
}
