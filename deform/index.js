/* global Audio, Power0, requestAnimationFrame, TweenLite, XMLHttpRequest */

require('gsap')

const THREE = require('three')
const dat = require('dat-gui')
const Stats = require('stats-js')

const Analyser = require('web-audio-analyser')
const OrbitControls = require('three-orbit-controls')(THREE)
const glslify = require('glslify')

const EffectComposer = require('three-effectcomposer')(THREE)
const VignetteShader = require('./shaders/vignetteShader')

class App {
  constructor () {
    this.uniforms = {
      background: '#FF7800',
      brightness: 1,
      color: '#FFFFFF',
      speed: 1
    }

    this.url = 'https://soundcloud.com/pallace/pallace-joy-pain'

    this.gui = null
    this.stats = null

    this.renderer = null
    this.scene = null
    this.camera = null
    this.composer = null
    this.controls = null
    this.clock = new THREE.Clock({ autoStart: true })

    this.loadSong()

    this.createRender()
    this.createScene()
    this.createGeometry()
    this.createShaders()

    this.startGUI()
    this.startStats()
    this.toggleDebug()

    this.update()
  }

  startGUI () {
    this.gui = new dat.GUI()

    this.gui.domElement.style.display = 'none'

    const _this = this

    this.gui.addColor(this.uniforms, 'background').onChange(function () {
      _this.mesh.material.uniforms.u_background.value = new THREE.Color(_this.uniforms.background)
    })

    this.gui.addColor(this.uniforms, 'color').onChange(function () {
      _this.mesh.material.uniforms.u_color.value = new THREE.Color(_this.uniforms.color)
    })

    this.gui.add(this.uniforms, 'speed', -1, 1).onChange(function () {
      _this.mesh.material.uniforms.u_speed.value = _this.uniforms.speed
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
      antialias: false,
      transparent: false
    })

    this.renderer.setClearColor(0x4C4C4C)
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    document.body.appendChild(this.renderer.domElement)
  }

  createScene () {
    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 4000)
    this.camera.position.set(0, 0, -100)
    this.camera.lookAt(new THREE.Vector3(1, 1, 100))

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableKeys = false
    this.controls.minDistance = 50
    this.controls.maxDistance = 75
    this.controls.autoRotate = false
  }

  createGeometry () {
    this.geometry = new THREE.IcosahedronGeometry(20, 4)

    this.material = new THREE.ShaderMaterial({
      vertexShader: glslify('./shaders/vertexShader.glsl'),
      fragmentShader: glslify('./shaders/fragmentShader.glsl'),
      uniforms: {
        u_time: { type: 'f', value: 1.0 },
        u_resolution: { type: 'v2', value: {
          x: 1,
          y: 1
        }},
        u_speed: { type: 'f', value: this.uniforms.speed },
        u_color: { type: 'c', value: new THREE.Color(this.uniforms.color) },
        u_background: { type: 'c', value: new THREE.Color(this.uniforms.background) },
        u_brightness: { type: 'f', value: this.uniforms.brightness }
      }
    })

    this.mesh = new THREE.Mesh(this.geometry, this.material)

    this.scene.add(this.mesh)
  }

  createShaders () {
    this.composer = new EffectComposer(this.renderer)
    this.composer.addPass(new EffectComposer.RenderPass(this.scene, this.camera))

    const vignetteShader = new EffectComposer.ShaderPass(VignetteShader)
    vignetteShader.uniforms['offset'].value = 0.95
    vignetteShader.uniforms['darkness'].value = 1.5
    vignetteShader.renderToScreen = true

    this.composer.addPass(vignetteShader)
  }

  loadSong () {
    const _this = this

    const request = new XMLHttpRequest()

    request.onreadystatechange = () => {
      if (request.readyState === 4 && request.status === 200) {
        const response = JSON.parse(request.responseText)

        _this.music = new Audio()
        _this.music.crossOrigin = 'anonymous'
        _this.music.src = `${response.stream_url}?client_id=78c6552c14b382e23be3bce2fc411a82`
        _this.music.play()

        _this.music.addEventListener('ended', () => {
          _this.music.play()
        })

        _this.analyser = Analyser(_this.music, new (window.AudioContext || window.webkitAudioContext)(), {
          audible: true,
          stereo: true
        })

        const div = document.createElement('a')
        const divImg = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-img">'

        div.className = 'soundcloud-link'
        div.setAttribute('href', response.permalink_url)
        div.innerHTML = `${divImg} ${response.title} - ${response.user.username}`

        document.body.appendChild(div)
      }
    }

    request.open('GET', `//api.soundcloud.com/resolve.json?url=${this.url}&client_id=78c6552c14b382e23be3bce2fc411a82`, true)

    request.send()
  }

  update () {
    this.stats.begin()

    this.controls.update()

    const array = this.analyser ? this.analyser.frequencies() : [1]
    let arrayAverage = array.reduce((p, c) => p + c, 0) / array.length

    arrayAverage = (arrayAverage < 60) ? 60 : arrayAverage

    const clockElapsedTime = this.clock.getElapsedTime()

    TweenLite.to(this.material.uniforms.u_brightness, 0.2, {
      value: arrayAverage / 50
    })

    TweenLite.to(this.material.uniforms.u_time, 0.2, {
      ease: Power0.easeNone,
      value: clockElapsedTime / 2
    })

    TweenLite.to(this.mesh.rotation, 0.2, {
      y: '+= 0.01'
    })

    this.stats.end()

    requestAnimationFrame(this.update.bind(this))

    this.renderer.render(this.scene, this.camera)

    this.composer.render()
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
