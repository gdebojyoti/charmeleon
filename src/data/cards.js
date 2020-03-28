// generates an array of 56 cards (4 colors * (10 number cards + 4 action cards))

import { cardTypes } from '../constants'

const cards = []

const colors = [
  'RED', 'BLUE', 'YELLOW', 'GREEN'
  // 'RED', 'BLUE', 'YELLOW', 'GREEN', 'PURPLE', 'ORANGE'
]

const actionNames = [
  'WILD_DRAW_FOUR', 'WILD', 'DRAW_TWO', 'SKIP', 'REVERSE'
  // 'WILD_DRAW_FOUR', 'WILD', 'DRAW_TWO', 'SKIP', 'REVERSE', 'MEGA_BLOCK'
]

for (let i = 0; i < 10; i++) {
  colors.forEach(color => {
    cards.push({
      type: cardTypes.NUMBER,
      name: i,
      value: i,
      color
    })
  })
}

actionNames.forEach(name => {
  colors.forEach(color => {
    cards.push({
      type: cardTypes.ACTION,
      name,
      value: 20,
      color
    })
  })
})

export default cards
