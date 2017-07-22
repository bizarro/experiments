import Vector from './Vector'

import {
  TweenMax
} from 'gsap'

import {
  randomArbitrary,
  randomInteger
} from './Random'

import {
  constrain
} from './Math'

export default class Line {
  constructor (startX, startY, endX, endY) {
    this.start = new Vector(startX, startY)
    this.end = new Vector(endX, endY)

    this.first = new Vector(randomInteger(this.start.x, this.end.x), randomInteger(this.start.y, this.end.y))
    this.second = new Vector(randomInteger(this.start.x, this.end.x), randomInteger(this.start.y, this.end.y))

    this.opacity = randomArbitrary(0, 0.2)

    this.appear()
  }

  appear () {
    TweenMax.from(this, 0.5, {
      opacity: 0
    })
  }

  update () {
    if (this.fading) {
      this.opacity = constrain(this.opacity - 0.0025, 0, 1)
    } else {
      this.opacity = constrain(this.opacity + 0.0025, 0, 1)
    }

    if (this.opacity >= 0.2) {
      this.fading = true
    } else if (this.opacity <= 0.05) {
      this.fading = false
    }
  }

  draw (context) {
    this.update()

    context.strokeWidth = 1
    context.strokeStyle = '#f10071'
    context.globalAlpha = this.opacity

    context.beginPath()

    context.moveTo(this.start.x, this.start.y)

    context.bezierCurveTo(
      this.first.x, this.first.y,
      this.second.x, this.second.y,
      this.end.x, this.end.y
    )

    context.stroke()

    context.globalAlpha = 1
  }
}
