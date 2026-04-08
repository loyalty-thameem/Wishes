import { useEffect, useRef } from 'react'

type Star = {
  x: number
  y: number
  z: number
  r: number
  vx: number
  vy: number
  seed: number
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const starsRef = useRef<Star[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0
    let h = 0
    let last = performance.now()

    const rebuild = () => {
      const nw = Math.max(1, Math.floor(window.innerWidth))
      const nh = Math.max(1, Math.floor(window.innerHeight))
      w = nw
      h = nh

      canvas.width = Math.floor(nw * dpr)
      canvas.height = Math.floor(nh * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const density = Math.min(150, Math.max(70, Math.round((nw * nh) / 11000)))
      const stars: Star[] = []
      for (let i = 0; i < density; i += 1) {
        const z = rand(0.25, 1.0)
        stars.push({
          x: rand(0, nw),
          y: rand(0, nh),
          z,
          r: rand(0.4, 1.4) * (0.4 + z),
          vx: rand(-0.12, 0.12) * (0.3 + z),
          vy: rand(-0.22, -0.06) * (0.35 + z),
          seed: Math.random() * 1000,
        })
      }
      starsRef.current = stars
    }

    const onResize = () => rebuild()
    rebuild()
    window.addEventListener('resize', onResize)

    const draw = (now: number) => {
      rafRef.current = window.requestAnimationFrame(draw)
      const dt = Math.min(32, now - last)
      last = now

      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      const stars = starsRef.current
      for (const s of stars) {
        s.x += s.vx * dt
        s.y += s.vy * dt

        if (s.y < -10) {
          s.y = h + 10
          s.x = rand(0, w)
        }
        if (s.x < -10) s.x = w + 10
        if (s.x > w + 10) s.x = -10

        const tw = 0.5 + 0.5 * Math.sin(now * 0.0012 + s.seed)
        const a = (0.08 + 0.26 * s.z) * (0.6 + 0.4 * tw)

        ctx.fillStyle = `rgba(247,246,242,${a})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fill()

        if (tw > 0.84) {
          ctx.fillStyle = `rgba(216,180,107,${a * 0.55})`
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r * 1.55, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      ctx.restore()
    }

    rafRef.current = window.requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', onResize)
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return <canvas ref={canvasRef} className="bgParticles" aria-hidden="true" />
}

