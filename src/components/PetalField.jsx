import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { wind } from '../lib/wind'
import useReducedMotion from '../hooks/useReducedMotion'

const VERT = /* glsl */ `
attribute float aSize;
attribute float aAngle;
attribute float aFlip;
attribute vec3 aColor;
uniform float uScale;
varying float vAngle;
varying float vFlip;
varying vec3 vColor;
void main() {
  vAngle = aAngle; vFlip = aFlip; vColor = aColor;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uScale;
}`

// The petal is drawn procedurally in the fragment shader, so no textures are needed.
const FRAG = /* glsl */ `
precision mediump float;
uniform float uOpacity;
varying float vAngle;
varying float vFlip;
varying vec3 vColor;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float c = cos(vAngle), s = sin(vAngle);
  p = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
  p.x /= max(abs(vFlip), 0.25);
  float w = 0.34 * (1.0 - smoothstep(-0.5, 0.5, p.y) * 0.55);
  float d = length(vec2(p.x / w, p.y / 0.46));
  float a = 1.0 - smoothstep(0.85, 1.0, d);
  if (p.y > 0.3) a *= mix(0.6, 1.0, smoothstep(0.0, 0.05, abs(p.x)));
  if (a < 0.01) discard;
  gl_FragColor = vec4(vColor, a * uOpacity);
}`

const COLORS = ['#F7B6C8', '#F4A3BA', '#FBCFDB', '#F9C1D1', '#FFE3EA']

// layer="back" sits behind the hero text, layer="front" in front (larger, softer, faster).
export default function PetalField({ layer = 'back', count = 36, className = '' }) {
  const mountRef = useRef(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const el = mountRef.current
    if (!el) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' })
    } catch {
      return // no WebGL: the page still works without petals
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block'
    el.appendChild(renderer.domElement)

    let n = count
    if (window.innerWidth < 768) n = Math.round(n * 0.5)
    if ((navigator.hardwareConcurrency || 8) <= 2) n = Math.round(n * 0.5)
    n = Math.max(n, 4)

    const front = layer === 'front'
    const sizeMin = front ? 30 : 12
    const sizeMax = front ? 52 : 28

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -10, 10)
    const pos = new Float32Array(n * 3)
    const size = new Float32Array(n)
    const angle = new Float32Array(n)
    const flip = new Float32Array(n)
    const color = new Float32Array(n * 3)
    const phase = new Float32Array(n)
    const fall = new Float32Array(n)
    const spin = new Float32Array(n)
    const flipSpeed = new Float32Array(n)
    const depth = new Float32Array(n)
    const tmp = new THREE.Color()

    let w = 1, h = 1
    const spawn = (i, anywhere) => {
      pos[i * 3] = anywhere ? Math.random() * w : -Math.random() * w * 0.2
      pos[i * 3 + 1] = anywhere ? Math.random() * h : h * (0.35 + Math.random() * 0.7)
    }

    const resize = () => {
      w = Math.max(el.clientWidth, 1)
      h = Math.max(el.clientHeight, 1)
      renderer.setSize(w, h, false)
      camera.right = w
      camera.top = h
      camera.updateProjectionMatrix()
    }
    resize()

    for (let i = 0; i < n; i++) {
      depth[i] = Math.random()
      size[i] = sizeMin + Math.random() * (sizeMax - sizeMin)
      angle[i] = Math.random() * Math.PI * 2
      phase[i] = Math.random() * Math.PI * 2
      fall[i] = (front ? 40 : 22) + Math.random() * (front ? 50 : 34)
      spin[i] = (Math.random() - 0.5) * 2.2
      flipSpeed[i] = 0.8 + Math.random() * 1.6
      tmp.set(COLORS[(Math.random() * COLORS.length) | 0])
      color.set([tmp.r, tmp.g, tmp.b], i * 3)
      spawn(i, true)
    }

    const geometry = new THREE.BufferGeometry()
    const posAttr = new THREE.BufferAttribute(pos, 3)
    const angleAttr = new THREE.BufferAttribute(angle, 1)
    const flipAttr = new THREE.BufferAttribute(flip, 1)
    posAttr.setUsage(THREE.DynamicDrawUsage)
    angleAttr.setUsage(THREE.DynamicDrawUsage)
    flipAttr.setUsage(THREE.DynamicDrawUsage)
    geometry.setAttribute('position', posAttr)
    geometry.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    geometry.setAttribute('aAngle', angleAttr)
    geometry.setAttribute('aFlip', flipAttr)
    geometry.setAttribute('aColor', new THREE.BufferAttribute(color, 3))

    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: { uScale: { value: dpr }, uOpacity: { value: front ? 0.75 : 0.9 } },
    })
    const points = new THREE.Points(geometry, material)
    points.frustumCulled = false
    scene.add(points)

    let raf = 0
    let running = true
    let visible = true
    let t = 0
    let prev = performance.now()

    const frame = (now) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min((now - prev) / 1000, 0.05)
      prev = now
      if (!running || !visible) return
      t += dt
      const wv = wind(t)
      for (let i = 0; i < n; i++) {
        const k = 0.6 + depth[i]
        pos[i * 3] += (wv * 55 * k + Math.sin(t * 0.9 + phase[i]) * 18) * dt
        pos[i * 3 + 1] -= (fall[i] + Math.cos(t * 0.7 + phase[i] * 1.3) * 10) * dt
        angle[i] += spin[i] * dt * (0.5 + wv)
        flip[i] = Math.sin(t * flipSpeed[i] + phase[i])
        if (pos[i * 3 + 1] < -40) spawn(i, false)
        else if (pos[i * 3] > w + 40) {
          pos[i * 3] = -30
          pos[i * 3 + 1] = Math.random() * h
        }
      }
      posAttr.needsUpdate = true
      angleAttr.needsUpdate = true
      flipAttr.needsUpdate = true
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(frame)

    const ro = new ResizeObserver(resize)
    ro.observe(el)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(el)
    const onVis = () => { running = !document.hidden }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [reduced, layer, count])

  return <div ref={mountRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`} />
}
