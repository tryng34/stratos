"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WebGLShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sceneRef = useRef<{
    scene: THREE.Scene | null
    camera: THREE.OrthographicCamera | null
    renderer: THREE.WebGLRenderer | null
    mesh: THREE.Mesh | null
    uniforms: any
    animationId: number | null
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const { current: refs } = sceneRef

    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;

      // Pseudo-random hash
      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      // 2D Noise for nebula
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      // Fractal Brownian Motion for nebula clouds
      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        vec2 shift = vec2(100.0);
        mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
        for (int i = 0; i < 4; ++i) {
          v += a * noise(p);
          p = rot * p * 2.0 + shift;
          a *= 0.5;
        }
        return v;
      }

      // Cosine palette for RGB waves / rainbow
      vec3 cosPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
        return a + b * cos(6.28318 * (c * t + d));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution;
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
        
        // 1. Nebula clouds (slow shifting color noise)
        vec2 nebulaCoord = p * 0.7 + vec2(time * 0.015, time * 0.008);
        float n = fbm(nebulaCoord);
        vec3 nebulaColor = vec3(0.04, 0.01, 0.08) * n; // deep violet/blue
        
        // Add a secondary shifting nebula layer in deep cyan/teal
        float n2 = fbm(nebulaCoord * 1.3 - vec2(time * 0.01));
        nebulaColor += vec3(0.01, 0.04, 0.06) * n2;

        // 2. Twinkling Stars
        // Scale coordinate space to create a dense grid
        vec2 starCoord = gl_FragCoord.xy * 0.18;
        vec2 gridId = floor(starCoord);
        vec2 gridFract = fract(starCoord);
        
        float starNoise = hash(gridId);
        float starIntensity = 0.0;
        
        // Only draw stars for cells exceeding a threshold (density control)
        if (starNoise > 0.985) {
          // Calculate center of grid cell
          vec2 center = vec2(0.5) + 0.3 * sin(gridId + time * 0.4); // wobble position slightly
          float distToCenter = length(gridFract - center);
          
          // Twinkle frequency and phase
          float twinkle = sin(time * (1.5 + starNoise * 3.0) + starNoise * 10.0) * 0.5 + 0.5;
          
          // Tiny sharp point
          starIntensity = smoothstep(0.06, 0.0, distToCenter) * twinkle * (0.2 + 0.8 * starNoise);
        }
        vec3 starColor = vec3(starIntensity * 0.8);

        // 3. Waving RGB Waves (Chromatic aberration sine waves)
        float waveVal = sin(p.x * xScale + time * 1.2) * yScale;
        
        // Compute 3 channels slightly offset for chromatic aberration
        float d = distortion;
        float waveR = sin(p.x * xScale + time * 1.2) * (yScale + d * 0.1);
        float waveG = waveVal;
        float waveB = sin(p.x * xScale + time * 1.2) * (yScale - d * 0.1);

        float thickness = 0.012;
        float rIntensity = thickness / (abs(p.y - waveR) + 0.012);
        float gIntensity = thickness / (abs(p.y - waveG) + 0.012);
        float bIntensity = thickness / (abs(p.y - waveB) + 0.012);

        vec3 waveColor = vec3(rIntensity, gIntensity * 0.3, bIntensity * 0.2);
        waveColor.g += gIntensity * 0.7;
        waveColor.b += bIntensity * 0.8;
        
        // Make the waves shift colors dynamically like a 7-color rainbow
        vec3 paletteA = vec3(0.5, 0.5, 0.5);
        vec3 paletteB = vec3(0.5, 0.5, 0.5);
        vec3 paletteC = vec3(1.0, 1.0, 1.0);
        vec3 paletteD = vec3(0.0, 0.33, 0.67);
        vec3 wavePalette = cosPalette(p.x * 0.2 + time * 0.04, paletteA, paletteB, paletteC, paletteD);
        waveColor *= wavePalette;

        // 4. Combine all layers
        vec3 finalColor = nebulaColor + starColor + waveColor * 1.8;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `

    const initScene = () => {
      refs.scene = new THREE.Scene()
      refs.renderer = new THREE.WebGLRenderer({ canvas })
      refs.renderer.setPixelRatio(window.devicePixelRatio)
      refs.renderer.setClearColor(new THREE.Color(0x000000))

      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      refs.uniforms = {
        resolution: { value: [window.innerWidth, window.innerHeight] },
        time: { value: 0.0 },
        xScale: { value: 1.0 },
        yScale: { value: 0.35 },
        distortion: { value: 0.08 },
      }

      const position = [
        -1.0, -1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0, -1.0, 0.0,
        -1.0,  1.0, 0.0,
         1.0,  1.0, 0.0,
      ]

      const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,
      })

      refs.mesh = new THREE.Mesh(geometry, material)
      refs.scene.add(refs.mesh)

      handleResize()
    }

    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += 0.01
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return
      const width = window.innerWidth
      const height = window.innerHeight
      refs.renderer.setSize(width, height, false)
      refs.uniforms.resolution.value = [width, height]
    }

    initScene()
    animate()
    window.addEventListener("resize", handleResize)

    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)
      window.removeEventListener("resize", handleResize)
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh)
        refs.mesh.geometry.dispose()
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose()
        }
      }
      refs.renderer?.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full block z-0 pointer-events-none"
    />
  )
}
