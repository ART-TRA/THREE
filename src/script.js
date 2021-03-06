import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { Clock } from 'three'
import * as dat from 'dat.gui'

import vertexShader from './shaders/test/vertex.glsl'
import fragmentShader from './shaders/test/fragment.glsl'

let mouse = new THREE.Vector2(0, 0)
const clock = new Clock()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.01, 1000)
camera.position.set(0, 1, 7)
scene.add(camera)
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true //плавность вращения камеры

const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) //ограничение кол-ва рендеров в завис-ти от плотности пикселей
renderer.setClearColor('#1f1f25', 1)
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;

window.addEventListener('resize', () => {
  //update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  //update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  //update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('mousemove', (event) => {
  mouse = {
    x: event.clientX / window.innerWidth - 0.5,
    y: event.clientY / window.innerHeight - 0.5,
  }
})

//------------------------------------------------------------------------------------------------------

const geometry = new THREE.SphereBufferGeometry(1, 32, 32)
const material = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  transparent: true,
  // depthWrite: false,
  // blending: THREE.AdditiveBlending,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: {value: 0},
    uMouse: {value: new THREE.Vector2(mouse.x, mouse.y)},
    playhead: {value: 0},
    offset: {value: Math.random()},
    color: {value: new THREE.Color('#ffffff')}
  }
})
const material2 = new THREE.ShaderMaterial({
  side: THREE.BackSide,
  transparent: true,
  // depthWrite: false,
  // blending: THREE.AdditiveBlending,
  vertexShader: vertexShader,
  fragmentShader: fragmentShader,
  uniforms: {
    uTime: {value: 0},
    uMouse: {value: new THREE.Vector2(mouse.x, mouse.y)},
    playhead: {value: 0},
    offset: {value: Math.random()},
    color: {value: new THREE.Color('#000000')}
  }
})
const particle = new THREE.Points(geometry, material)
// scene.add(particle)

const objectsNumber = 250

const params = {
  scale: 4,
  extrusionSegments: 400,
  radiusSegments: 16,
  closed: false
}

const setRange = (min, max) => {
  return Math.random() * (max - min) + min
}
scene.rotation.z = Math.PI * 0.2
let circle, circle2

for (let i = 0; i < objectsNumber; ++i) {
  let spline = []
  const precision = 100 //точность
  let angle = setRange(0, 2 * Math.PI)
  let width = Math.random() * 0.5 + 0.5
  let level = setRange(-300, 300)
  const levelRandomRatio = level / 300
  let offset = Math.abs(levelRandomRatio)
  let randomValue = Math.random()
  const radius = 80 * levelRandomRatio * levelRandomRatio + Math.random() * 10

  for (let j = 0; j <= precision * width; ++j) {
    let x = radius * Math.sin(2 * Math.PI * j / precision)
    let z = radius * Math.cos(2 * Math.PI * j / precision)

    spline.push(new THREE.Vector3(x, level, z))
  }

  let sampleClosedSpline = new THREE.CatmullRomCurve3(spline)

  const tubeGeometry = new THREE.TubeBufferGeometry(
    sampleClosedSpline,
    params.extrusionSegments,
    0.5,
    params.radiusSegments,
    false
  )

  const tubeGeometry2 = new THREE.TubeBufferGeometry(
    sampleClosedSpline,
    params.extrusionSegments,
    0.5 + 0.5,
    params.radiusSegments,
    false
  )

  circle = new THREE.Mesh(tubeGeometry, new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    // depthWrite: false,
    // blending: THREE.AdditiveBlending,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: {value: 0},
      uMouse: {value: new THREE.Vector2(mouse.x, mouse.y)},
      playhead: {value: randomValue},
      offset: {value: offset},
      color: {value: new THREE.Color('#ffffff')}
    }
  }))
  circle2 = new THREE.Mesh(tubeGeometry2, new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    // depthWrite: false,
    // blending: THREE.AdditiveBlending,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uTime: {value: 0},
      uMouse: {value: new THREE.Vector2(mouse.x, mouse.y)},
      playhead: {value: randomValue},
      offset: {value: offset},
      color: {value: new THREE.Color('#000000')}
    }
  }))

  circle.scale.set(0.02, 0.02, 0.02)
  circle2.scale.set(0.02, 0.02, 0.02)
  circle.rotation.y = circle2.rotation.y = angle

  scene.add(circle)
  scene.add(circle2)
}

//---------------------------------------------------------------------------------------------------------

console.log(scene)
const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  for (let i = 1; i < scene.children.length; ++i) {
    scene.children[i].material.uniforms.uTime.value = elapsedTime
  }

  //Update controls
  controls.update() //если включён Damping для камеры необходимо её обновлять в каждом кадре

  renderer.render(scene, camera)
  window.requestAnimationFrame(tick)
}

tick()