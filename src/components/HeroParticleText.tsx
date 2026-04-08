import { useEffect, useMemo, useRef, useState } from 'react'

type Particle = {
  sx: number
  sy: number
  sz: number
  tx: number
  ty: number
  tz: number
  delayMs: number
  size: number
  seed: number
  rot: number
}

export interface HeroParticleTextProps {
  text: string
  start: boolean
  active: boolean
  onFormed?: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export default function HeroParticleText({
  text,
  start,
  active,
  onFormed,
}: HeroParticleTextProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const formedRef = useRef(false)
  const startAtRef = useRef<number | null>(null)
  const particlesRef = useRef<Particle[]>([])
  const totalFormMsRef = useRef(0)
  const [layoutTick, setLayoutTick] = useState(0)

  const chars = useMemo(() => Array.from(text), [text])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.max(1, Math.floor(rect.width))
      const h = Math.max(1, Math.floor(rect.height))
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      particlesRef.current = []
      formedRef.current = false
      startAtRef.current = null
      setLayoutTick((t) => t + 1)
    }

    resize()
    const ro = new ResizeObserver(() => resize())
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (!start) return
    if (particlesRef.current.length > 0) return

    const rect = canvas.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    const fontSize = clamp(Math.min(width, height) * 0.14, 44, 92)
    const spacing = fontSize * 0.06
    const baseY = height * 0.48

    const measureCtx = document.createElement('canvas').getContext('2d')
    if (!measureCtx) return
    measureCtx.font = `700 ${fontSize}px ui-serif, Georgia, Cambria, serif`
    const widths = chars.map((c) => measureCtx.measureText(c).width)
    const totalWidth =
      widths.reduce((sum, w) => sum + w, 0) + spacing * (chars.length - 1)
    const startX = (width - totalWidth) / 2

    const off = document.createElement('canvas')
    const offCtx = off.getContext('2d')
    if (!offCtx) return

    const dirs = [
      { x: -1, y: 0, z: -1 },
      { x: 1, y: 0, z: 1 },
      { x: 0, y: -1, z: 1 },
      { x: 0, y: 1, z: -1 },
      { x: -0.8, y: -0.55, z: 1 },
      { x: 0.8, y: -0.55, z: -1 },
      { x: -0.65, y: 1, z: 1 },
      { x: 0.65, y: 1, z: -1 },
    ]

    const particles: Particle[] = []
    let maxDelay = 0
    let cursorX = startX

    const step = Math.max(2, Math.floor(fontSize / 20))
    for (let i = 0; i < chars.length; i += 1) {
      const ch = chars[i]!
      const w = widths[i]!
      if (ch.trim().length === 0) {
        cursorX += w + spacing
        continue
      }

      const dir = dirs[i % dirs.length]!
      const pad = Math.ceil(fontSize * 0.55)
      off.width = Math.ceil(w + pad * 2)
      off.height = Math.ceil(fontSize * 1.6)
      offCtx.clearRect(0, 0, off.width, off.height)
      offCtx.font = `700 ${fontSize}px ui-serif, Georgia, Cambria, serif`
      offCtx.textAlign = 'left'
      offCtx.textBaseline = 'middle'
      offCtx.fillStyle = '#fff'
      offCtx.fillText(ch, pad, off.height / 2)

      const img = offCtx.getImageData(0, 0, off.width, off.height)
      const charDelay = i * 190
      for (let y = 0; y < img.height; y += step) {
        for (let x = 0; x < img.width; x += step) {
          const a = img.data[(y * img.width + x) * 4 + 3]
          if (a === undefined || a < 34) continue

          const tx = cursorX + (x - pad)
          const ty = baseY + (y - img.height / 2)
          const delayMs = charDelay + rand(0, 240)

          maxDelay = Math.max(maxDelay, delayMs)

          const drift = rand(220, 540)
          const driftY = rand(160, 440)
          const driftZ = rand(200, 520)
          particles.push({
            tx,
            ty,
            tz: rand(-24, 18),
            sx: tx + dir.x * drift + rand(-64, 64),
            sy: ty + dir.y * driftY + rand(-64, 64),
            sz: dir.z * driftZ + rand(-90, 90),
            delayMs,
            size: rand(1.0, 2.2),
            seed: Math.random() * 1000,
            rot: rand(-0.26, 0.26) * (dir.x === 0 ? (Math.random() > 0.5 ? 1 : -1) : dir.x),
          })
        }
      }

      cursorX += w + spacing
    }

    particlesRef.current = particles
    totalFormMsRef.current = maxDelay + 1600
    startAtRef.current = performance.now()
    formedRef.current = false
  }, [chars, layoutTick, start])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = (now: number) => {
      rafRef.current = window.requestAnimationFrame(draw)

      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      const particles = particlesRef.current
      if (!startAtRef.current || particles.length === 0) return

      const t = now - startAtRef.current
      const formTotal = totalFormMsRef.current
      const formed = t >= formTotal

      if (formed && !formedRef.current) {
        formedRef.current = true
        onFormed?.()
      }

      const globalProgress = clamp(t / formTotal, 0, 1)
      const camera = 0.92 + 0.08 * easeOutCubic(globalProgress)
      const cx = w / 2
      const cy = h / 2

      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      for (const p of particles) {
        const localT = t - p.delayMs
        const progress = clamp(localT / 1500, 0, 1)
        if (progress <= 0) continue

        const eased = easeOutCubic(progress)
        const z = lerp(p.sz, p.tz, eased)
        const zScale = 1 + z / 860

        let x = lerp(p.sx, p.tx, eased)
        let y = lerp(p.sy, p.ty, eased)

        if (progress < 1) {
          const rot = p.rot * (1 - eased)
          const dx = x - cx
          const dy = y - cy
          const cos = Math.cos(rot)
          const sin = Math.sin(rot)
          x = cx + dx * cos - dy * sin
          y = cy + dx * sin + dy * cos
        }

        if (progress >= 1) {
          const drift = 0.55
          x += Math.sin(now * 0.0012 + p.seed) * drift
          y += Math.cos(now * 0.0010 + p.seed) * drift
        }

        const px = (x - cx) * camera * zScale + cx
        const py = (y - cy) * camera * zScale + cy

        const twinkle = 0.5 + 0.5 * Math.sin(now * 0.002 + p.seed)
        const a = (0.12 + 0.7 * progress) * (0.55 + 0.45 * twinkle)

        ctx.fillStyle = `rgba(216,180,107,${a})`
        ctx.beginPath()
        ctx.arc(px, py, p.size * (0.9 + 0.3 * twinkle), 0, Math.PI * 2)
        ctx.fill()

        if (twinkle > 0.86) {
          ctx.fillStyle = `rgba(247,246,242,${a * 0.55})`
          ctx.beginPath()
          ctx.arc(px, py, p.size * 0.7, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
    }

    if (!active) return
    rafRef.current = window.requestAnimationFrame(draw)
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [active, onFormed])

  return <canvas ref={canvasRef} className="heroParticles" />
}
