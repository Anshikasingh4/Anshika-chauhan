import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { gsap } from '../lib/gsap'
import { wind } from '../lib/wind'
import useReducedMotion from '../hooks/useReducedMotion'

// The hero artwork (public/images/hero.jpg) is drawn on one full-screen quad.
// A fragment shader warps the image's own pixels with layered, wind-driven noise:
//  - a slow wave moves the whole canopy,
//  - a mid wave moves individual branches,
//  - a fine flutter shivers the blossom clusters.
// The warp is weighted by distance from the trunk base, so the trunk stays planted
// while branch tips move most, and the empty sky on the right stays still.
const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uMap;
uniform float uTime;
uniform float uWind;
uniform vec2 uRes;
uniform float uImgAspect;
uniform vec2 uFocus;
varying vec2 vUv;

void main() {
  // "object-fit: cover" mapping from screen uv to image uv
  float rA = uRes.x / uRes.y;
  vec2 vis = rA > uImgAspect ? vec2(1.0, uImgAspect / rA) : vec2(rA / uImgAspect, 1.0);
  vec2 p = (1.0 - vis) * uFocus + vUv * vis;

  // sway weight: 0 at the trunk base, 1 at the branch tips
  vec2 q = vec2(p.x * uImgAspect, p.y);
  float dist = distance(q, vec2(0.05 * uImgAspect, 0.0));
  float w = smoothstep(0.35, 1.3, dist);
  w *= smoothstep(0.25, 0.6, p.y);            // ground and lower trunk stay put
  w *= 1.0 - smoothstep(0.55, 0.8, p.x);      // open sky on the right stays put

  float t = uTime;
  float slow = sin(t * 0.85 + p.x * 5.0 + p.y * 3.0);
  float mid  = sin(t * 1.9 + p.x * 13.0 - p.y * 9.0) * 0.35;
  vec2 d = vec2(slow + mid, 0.45 * cos(t * 0.7 + p.x * 4.0) + 0.3 * mid) * 0.0055;
  float flutter = sin(t * 3.1 + p.x * 45.0) * sin(t * 2.3 + p.y * 38.0);
  d += vec2(flutter, sin(t * 2.7 + p.y * 41.0) * 0.8) * 0.0012;
  d *= w * uWind;

  gl_FragColor = vec4(texture2D(uMap, clamp(p + d, 0.001, 0.999)).rgb, 1.0);
}`

const FOCUS = new THREE.Vector2(0.12, 0.5) // keep the tree in view on narrow screens

export default function CherryBlossomScene({ src = '/images/hero.jpg', alt = '' }) {
  const mountRef = useRef(null)
  const imgRef = useRef(null)
  const reduced = useReducedMotion()
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    if (reduced) return // static image only
    const el = mountRef.current
    if (!el) return

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'low-power' })
    } catch {
      setFallback(true)
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(dpr)
    renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block'
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const geometry = new THREE.PlaneGeometry(2, 2)
    const material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uMap: { value: null },
        uTime: { value: 0 },
        uWind: { value: 1 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uImgAspect: { value: 1.78 },
        uFocus: { value: FOCUS },
      },
    })
    const mesh = new THREE.Mesh(geometry, material)
    mesh.frustumCulled = false
    scene.add(mesh)

    let disposed = false
    let ready = false
    let visible = true
    let running = true
    let raf = 0
    let texture = null

    const resize = () => {
      const w = Math.max(el.clientWidth, 1)
      const h = Math.max(el.clientHeight, 1)
      renderer.setSize(w, h, false)
      material.uniforms.uRes.value.set(w, h)
      if (ready) renderer.render(scene, camera)
    }
    resize()

    new THREE.TextureLoader().load(
      src,
      (tex) => {
        if (disposed) { tex.dispose(); return }
        // Left in the default colour space on purpose: the shader writes raw sRGB values.
        tex.minFilter = THREE.LinearFilter
        tex.generateMipmaps = false
        texture = tex
        material.uniforms.uMap.value = tex
        material.uniforms.uImgAspect.value = tex.image.width / tex.image.height
        ready = true
        renderer.render(scene, camera)
      },
      undefined,
      () => { if (!disposed) setFallback(true) }
    )

    const start = performance.now()
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!ready || !visible || !running) return
      const t = (performance.now() - start) / 1000
      material.uniforms.uTime.value = t
      material.uniforms.uWind.value = wind(t)
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
      disposed = true
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
      if (texture) texture.dispose()
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
    }
  }, [reduced, src])

  // If WebGL is unavailable, the plain image gets a slow, gentle sway instead.
  useLayoutEffect(() => {
    if (!fallback || reduced || !imgRef.current) return
    const ctx = gsap.context(() => {
      gsap.to(imgRef.current, {
        rotation: 0.6, scale: 1.03, transformOrigin: '10% 100%',
        duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1,
      })
    })
    return () => ctx.revert()
  }, [fallback, reduced])

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Same artwork underneath: visible while the texture loads, and for reduced motion. */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: '12% 50%' }}
        fetchpriority="high"
      />
      <div ref={mountRef} aria-hidden="true" className="absolute inset-0" />
    </div>
  )
}
