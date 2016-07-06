/* global requestAnimationFrame */

const THREE = require('three')
const DatGUI = require('dat-gui')
const Stats = require('stats-js')

const OrbitControls = require('three-orbit-controls')(THREE)

class App {
  constructor () {
    this.gui = null
    this.stats = null

    this.renderer = null
    this.scene = null
    this.camera = null
    this.controls = null

    this.clock = new THREE.Clock({ autoStart: true })

    this.createRender()
    this.createScene()
    this.createLights()
    this.createGeometry()

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
    this.camera.position.z = 30

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
  }

  createLights () {
    this.light = new THREE.AmbientLight(0xFFFFFF)

    this.scene.add(this.light)
  }

  createGeometry () {
    const loader = new THREE.JSONLoader()

    loader.load('objects/fox.json', (geometry, materials) => {
      const mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({
          vertexColors: THREE.FaceColors,
          morphTargets: true
        })
      );
 
      mesh.scale.set(1.5, 1.5, 1.5)

      this.scene.add(mesh)

      const mixer = new THREE.AnimationMixer(mesh)
      const clip = THREE.AnimationClip.CreateFromMorphTargetSequence('run', geometry.morphTargets, 30)

      mixer.clipAction(clip).setDuration(1).play()
    })
  }

  update () {
    this.stats.begin()

    this.renderer.render(this.scene, this.camera)

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
