/* global requestAnimationFrame, PIXI */

require('pixi.js')
require('pixi-particles')

const DatGUI = require('dat-gui')
const Stats = require('stats-js')

class App {
  constructor () {
    this.gui = null
    this.stats = null

    this.stage = null
    this.renderer = null

    this.createContainer()
    this.createRenderer()
    this.createSprite()

    this.startGUI()
    this.startStats()
    this.toggleDebug()

    this.update()
  }

  startGUI () {
    this.gui = new DatGUI.GUI()

    this.gui.domElement.style.display = 'none'
  }

  startStats () {
    this.stats = new Stats()

    this.stats.domElement.style.display = 'none'
    this.stats.domElement.style.left = 0
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.top = 0
    this.stats.domElement.style.zIndex = 50

    document.body.appendChild(this.stats.domElement)
  }

  toggleDebug () {
    window.addEventListener('keydown', (e) => {
      switch (e.keyCode) {
        case 68:
          this.stats.domElement.style.display = (this.stats.domElement.style.display === 'block') ? 'none' : 'block'
          this.gui.domElement.style.display = (this.gui.domElement.style.display === 'block') ? 'none' : 'block'
          break
      }
    })
  }

  createContainer () {
    this.container = new PIXI.Container()
  }

  createRenderer () {
    this.renderer = new PIXI.WebGLRenderer(window.innerWidth, window.innerHeight)

    document.body.appendChild(this.renderer.view)
  }

  createSprite () {

  }

  update () {
    this.stats.begin()

    this.renderer.render(this.container)

    this.stats.end()

    requestAnimationFrame(this.update.bind(this))
  }

  resize () {
    this.renderer.view.style.width = window.innerWidth + 'px'
    this.renderer.view.style.height = window.innerHeight + 'px'

    this.renderer.resize(window.innerWidth, window.innerHeight)
  }
}

const app = new App()

window.addEventListener('resize', () => {
  app.resize()
})
