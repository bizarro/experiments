import {
  TweenMax
} from 'gsap'

import Line from './classes/Line'
import Particle from './classes/Particle'

import {
  randomArbitrary,
  randomNormalized
} from './classes/Random'

class Experiment {
  constructor () {
    this.createCanvas()
    this.createOutline()
    this.createIris()
    this.createConnections()

    this.render()

    window.addEventListener('resize', this.resize.bind(this))
  }

  createCanvas () {
    this.canvas = document.createElement('canvas')

    this.height = window.innerHeight
    this.width = window.innerWidth

    this.radius = (this.height < this.width) ? this.height * 0.75 : this.width * 0.75

    this.canvas.height = this.radius
    this.canvas.width = this.radius

    this.context = this.canvas.getContext('2d')

    this.context.fillStyle = '#050505'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    document.body.appendChild(this.canvas)
  }

  createOutline () {
    this.particlesBorder = []
    this.particlesBorderLength = 400

    for (let i = 0; i < this.particlesBorderLength; i++) {
      const center = this.radius / 2 - 10

      const height = this.canvas.height / 2
      const width = this.canvas.width / 2

      const t = (Math.PI * 2) * (i / this.particlesBorderLength)
      const x = Math.cos(t) * center + height + randomArbitrary(-2, 2)
      const y = Math.sin(t) * center + width + randomArbitrary(-2, 2)

      const particle = new Particle(x, y, 1)

      this.particlesBorder.push(particle)
    }
  }

  createIris () {
    this.particlesBorderInside = []
    this.particlesBorderInsideLength = 400

    for (let i = 0; i < this.particlesBorderInsideLength; i++) {
      const center = this.radius * 0.05 + Math.abs(randomNormalized() * 30)

      const height = this.canvas.height / 2
      const width = this.canvas.width / 2

      const t = (Math.PI * 2) * (i / this.particlesBorderInsideLength)
      const x = Math.cos(t) * center + width + randomArbitrary(-10, 10)
      const y = Math.sin(t) * center + height + randomArbitrary(-10, 10)

      const particle = new Particle(x, y, 0.5)

      this.particlesBorderInside.push(particle)
    }
  }

  createConnections () {
    this.lines = []

    this.particlesBorderInside.forEach((particle, index) => {
      const start = particle.position
      const end = this.particlesBorder[index].position

      const line = new Line(start.x, start.y, end.x, end.y)

      this.lines.push(line)
    })
  }

  render () {
    this.context.fillStyle = '#000'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.context.globalCompositeOperator = 'overlay'

    this.particlesBorder.forEach(particle => {
      particle.draw(this.context)
    })

    this.particlesBorderInside.forEach(particle => {
      particle.draw(this.context)
    })

    this.lines.forEach(line => {
      line.draw(this.context)
    })

    this.frame = window.requestAnimationFrame(this.render.bind(this))
  }

  resize () {
    this.height = window.innerHeight
    this.width = window.innerWidth

    this.radius = (this.height < this.width) ? this.height * 0.75 : this.width * 0.75

    TweenMax.set(this.canvas, {
      height: this.radius,
      width: this.radius
    })
  }
}

new Experiment()
