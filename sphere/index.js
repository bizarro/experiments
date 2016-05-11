/* global Audio TweenLite */

require('gsap')

const THREE = require('three')
const OrbitViewer = require('three-orbit-viewer')(THREE)

const Soundcloud = require('soundcloud-badge')
const Analyser = require('web-audio-analyser')
const AudioContext = window.AudioContext || window.webkitAudioContext

Soundcloud({
  client_id: '78c6552c14b382e23be3bce2fc411a82',
  song: 'https://soundcloud.com/adventureclub/fade',
  dark: false,
  getFonts: false
}, function (error, src, data, div) {
  if (error) throw error

  startAudio(src)
})

function startAudio (src) {
  const audio = new Audio()

  audio.crossOrigin = 'Anonymous'
  audio.src = src

  audio.addEventListener('canplay', function () {
    audio.play()

    startScene(audio)
  })
}

function startScene (audio) {
  const node = Analyser(audio, new AudioContext(), {
    audible: true,
    stereo: true
  })

  const app = OrbitViewer({
    clearColor: 0x000000,
    clearAlpha: 1,
    position: new THREE.Vector3()
  })

  app.controls.noPan = true
  app.controls.noZoom = true
  app.controls.noRotate = true
  app.scene.add(new THREE.AmbientLight(0x404040, 1))

  const meshGeometry = new THREE.SphereGeometry(15, 30, 30)
  const meshVertices = meshGeometry.vertices
  const meshVerticesLength = meshGeometry.vertices.length
  const meshVerticesValues = []

  for (var i = 0; i < meshVerticesLength; i++) {
    meshVerticesValues.push(meshVertices[i].z)
  }

  const meshMaterial = new THREE.MeshNormalMaterial({ wireframe: true })
  const mesh = new THREE.Mesh(meshGeometry, meshMaterial)

  app.camera.position.z = 0
  app.camera.lookAt(mesh)
  app.scene.add(mesh)

  app.on('tick', function () {
    const waveform = node.waveform()

    for (var i = 0; i < meshVerticesLength; i++) {
      TweenLite.to(meshVertices[i], 1, {
        z: meshVerticesValues[i] - (waveform[i] / 2.5)
      })
    }

    mesh.geometry.verticesNeedUpdate = true
  })
}
