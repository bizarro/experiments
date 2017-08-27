import Vector from './Vector'

import {
  TweenMax
} from 'gsap'

export default class Particle {
  constructor (x, y, radius) {
    this.fading = true
    this.opacity = Math.random()
    this.position = new Vector(x, y)
    this.radius = radius
    this.rotation = new Vector(Math.random(), Math.random())

    this.appear()
  }

  appear () {
    TweenMax.from(this, 0.5, {
      opacity: 0
    })
  }

  draw (context) {
    context.globalAlpha = this.opacity

    context.beginPath()
    context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI)
    context.closePath()

    context.fillStyle = '#00ff48'
    context.fill()

    context.globalAlpha = 1
  }
}
