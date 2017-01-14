/* global requestAnimationFrame */

require('gsap')

const THREE = require('three')
const dat = require('dat-gui')
const Stats = require('stats-js')

const glslify = require('glslify')

const OrbitControls = require('three-orbit-controls')(THREE)

class App {
  constructor () {
    this.uniforms = {
      alpha: 0.1,
      color: '#2c00ff'
    }

    this.gui = null
    this.stats = null

    this.renderer = null
    this.scene = null
    this.camera = null
    this.controls = null

    this.clock = new THREE.Clock({ autoStart: true })

    this.createRender()
    this.createScene()
    this.createGeometry()

    this.startGUI()
    this.startStats()
    this.toggleDebug()

    this.update()
  }

  startGUI () {
    this.gui = new dat.GUI()

    this.gui.domElement.style.display = 'none'

    const _this = this

    this.gui.add(this.uniforms, 'alpha', 0, 1).onChange(function () {
      _this.galaxy.material.uniforms.alpha.value = _this.uniforms.alpha
    })

    this.gui.addColor(this.uniforms, 'color').onChange(function () {
      _this.galaxy.material.uniforms.color.value = new THREE.Color(_this.uniforms.color)
    })
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

  createRender () {
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      transparent: true
    })

    this.renderer.setClearColor(0x000000)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(this.renderer.domElement)
  }

  createScene () {
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 1000)
    this.camera.position.z = 12.5

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  createGeometry () {
    this.group = new THREE.Object3D()

    const galaxyMaterial = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      transparent: true,
      uniforms: {
        alpha: { type: 'f', value: this.uniforms.alpha },
        color: { type: 'c', value: new THREE.Color(this.uniforms.color) },
        time: { type: 'f', value: 0 }
      },
      fragmentShader: glslify('./shaders/particleFrag.glsl'),
      vertexShader: glslify('./shaders/particleVert.glsl')
    })

    this.material = galaxyMaterial

    const galaxyGeometry = new THREE.SphereGeometry(1, 500, 500)

    this.geometry = galaxyGeometry

    this.galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial)

    this.scene.add(this.galaxy)
  }

  update () {
    this.stats.begin()

    this.renderer.render(this.scene, this.camera)

    this.galaxy.material.uniforms.time.value = this.clock.getElapsedTime() * 0.025
    this.group.rotation.y += 0.01

    this.controls.update()

    this.stats.end()

    requestAnimationFrame(this.update.bind(this))
  }

  resize () {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }
}

const app = new App()

window.addEventListener('resize', () => {
  app.resize()
})
