/* global Audio, requestAnimationFrame, THREE, TweenLite, XMLHttpRequest */

(function () {
  function randomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

  var mouseX = 0

  var isClicked = false

  var audio
  var audioContext
  var audioAnalyser
  var audioSource
  var audioFrequency
  var audioRequest

  function initAudio () {
    audio = new Audio()
    audio.crossOrigin = 'anonymous'

    audioContext = new (window.AudioContext || window.webkitAudioContext)()

    audioSource = audioContext.createMediaElementSource(audio)
    audioSource.connect(audioContext.destination)

    audioAnalyser = audioContext.createAnalyser()
    audioAnalyser.smoothingTimeConstant = 0.1
    audioAnalyser.fftSize = 512 * 4

    audioSource.connect(audioAnalyser)

    audioRequest = new XMLHttpRequest()

    audioRequest.open('GET', '//api.soundcloud.com/resolve.json?url=https://soundcloud.com/warnerbrosrecords/the-black-keys-gold-on-the&client_id=d764995c8ec4e9f30f85b3bd8396312c', true)

    audioRequest.onreadystatechange = function () {
      if (audioRequest.readyState === 4 && audioRequest.status === 200) {
        var information = JSON.parse(audioRequest.responseText)

        audio.src = information.stream_url + '?client_id=d764995c8ec4e9f30f85b3bd8396312c'
        audio.play()

        audio.addEventListener('ended', function () {
          audio.play()
        })

        var music = document.createElement('a')
        music.className = 'soundcloud-link'

        music.setAttribute('href', information.permalink_url)
        music.innerHTML = '<img src="https://developers.soundcloud.com/assets/logo_white.png" class="soundcloud-img">' + information.title + ' - ' + information.user.username

        document.body.appendChild(music)
      }
    }

    audioRequest.send()

    audioAnalyser.connect(audioContext.destination)

    audioFrequency = new Uint8Array(audioAnalyser.frequencyBinCount)
  }

  initAudio()

  var scene
  var camera
  var renderer
  var light
  var composer

  var circle = new THREE.Object3D()

  var triangle = []
  var triangleGeometry = new THREE.TetrahedronGeometry(45, 0)
  var triangleMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFFFF })
  var triangleSleeve = []
  var triangleLength = 100

  var effectOne
  var effectTwo

  function initScene () {
    scene = new THREE.Scene()

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 250

    scene.add(camera)

    renderer = new THREE.WebGLRenderer({alpha: true})

    renderer.setClearColor(0xFFFFFF, 0)
    renderer.setSize(window.innerWidth, window.innerHeight)

    light = new THREE.DirectionalLight(0xFFFFFF, 1)
    light.position.set(1, 1, 1)

    scene.add(light)

    light = new THREE.DirectionalLight(0xFFFFFF, 1)
    light.position.set(-1, -1, 1)

    scene.add(light)

    for (var i = 0; i < triangleLength; i++) {
      triangle[i] = new THREE.Mesh(triangleGeometry, triangleMaterial)

      triangle[i].position.y = 100

      triangleSleeve[i] = new THREE.Object3D()
      triangleSleeve[i].add(triangle[i])
      triangleSleeve[i].rotation.z = i * (360 / triangleLength) * Math.PI / 180

      circle.add(triangleSleeve[i])
    }

    scene.add(circle)

    composer = new THREE.EffectComposer(renderer)
    composer.addPass(new THREE.RenderPass(scene, camera))

    effectOne = new THREE.ShaderPass(THREE.DotScreenShader)
    effectOne.uniforms['scale'].value = 5
    composer.addPass(effectOne)

    effectTwo = new THREE.ShaderPass(THREE.RGBShiftShader)
    effectTwo.uniforms['amount'].value = 0.005
    effectTwo.renderToScreen = true
    composer.addPass(effectTwo)

    renderer.render(scene, camera)

    document.body.appendChild(renderer.domElement)
  }

  initScene()

  function render () {
    requestAnimationFrame(render)

    for (var i = 0; i < triangleLength; i++) {
      var value = ((audioFrequency[i] / 256) * 2.5) + 0.01

      if (isClicked) {
        TweenLite.to(triangle[i].scale, 0.1, {
          x: value,
          y: value,
          z: value
        })

        TweenLite.to(triangle[i].rotation, 0.1, {
          z: (i % 2 === 0) ? '+= 0.1' : '-= 0.1'
        })

        TweenLite.to(effectTwo.uniforms['amount'], 1, {
          value: 0.005
        })
      } else {
        TweenLite.to(triangle[i].scale, 0.1, {
          z: value
        })

        TweenLite.to(effectTwo.uniforms['amount'], 1, {
          value: mouseX / window.innerWidth
        })
      }
    }

    circle.rotation.z += 0.01

    audioAnalyser.getByteFrequencyData(audioFrequency)
    renderer.render(scene, camera)
    composer.render()
  }

  window.addEventListener('click', function () {
    if (isClicked) {
      for (var i = 0; i < triangleLength; i++) {
        TweenLite.to(triangle[i].scale, 1, {
          x: 1,
          y: 1,
          z: 1
        })

        TweenLite.to(triangle[i].rotation, 1, {
          x: 0,
          y: 0,
          z: 0
        })

        TweenLite.to(triangle[i].position, 1, {
          x: 0,
          y: 100,
          z: 0
        })
      }

      effectOne.uniforms.scale.value = 5

      triangleMaterial.wireframe = false

      isClicked = false
    } else {
      for (var j = 0; j < triangleLength; j++) {
        TweenLite.to(triangle[j].rotation, 1, {
          x: randomInt(0, Math.PI),
          y: randomInt(0, Math.PI),
          z: randomInt(0, Math.PI)
        })

        TweenLite.to(triangle[j].position, 1, {
          x: '+= ' + randomInt(-1000, 1000),
          y: '+= ' + randomInt(-1000, 1000),
          z: '+= ' + randomInt(-500, -250)
        })
      }

      effectOne.uniforms.scale.value = 0

      triangleMaterial.wireframe = true

      isClicked = true
    }
  })

  render()

  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  })

  window.addEventListener('mousewheel', function (e) {
    var volume = Math.round(audio.volume * 100) / 100

    if (e.wheelDelta < 0 && volume - 0.05 >= 0) {
      volume = Math.abs(volume - 0.05)
    } else if (e.wheelDelta > 0 && volume + 0.05 <= 1) {
      volume = Math.abs(volume + 0.05)
    }

    audio.volume = volume
  })

  window.addEventListener('mousemove', function (e) {
    mouseX = e.clientX - window.innerWidth / 2
  })
})()
