// generates an array of 60 cards (4 colors * (10 number cards + 5 action cards))

import { cardTypes } from '../constants'

const cards = []
let index = 0

const colors = [
  'RED', 'BLUE', 'YELLOW', 'GREEN'
]

const colorActionNames = [
  'REVERSE', 'SKIP', 'DRAW_TWO'
  // 'REVERSE', 'SKIP', 'DRAW_TWO', 'MEGA_BLOCK'
]

const wildActionNames = [
  'WILD', 'WILD_DRAW_FOUR'
]

// for each color
colors.forEach(color => {
  // generate cards from 0 to 9
  for (let i = 0; i < 10; i++) {
    cards.push({
      id: ++index,
      type: cardTypes.NUMBER,
      name: i,
      value: i,
      color
    })
  }

  // generate colored action cards (like 'REVERSE')
  colorActionNames.forEach(name => {
    cards.push({
      id: ++index,
      type: cardTypes.ACTION,
      name,
      value: 20,
      color
    })
  })
})

// generate wild action cards (number of copies of each action card = number of colors)
wildActionNames.forEach(name => {
  colors.forEach(color => {
    cards.push({
      id: ++index,
      type: cardTypes.ACTION,
      name,
      value: 20
    })
  })
})

export default cards
