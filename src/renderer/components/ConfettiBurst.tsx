import React, { useEffect, useRef } from 'react'

interface Props {
  active: boolean
  onDone: () => void
}

const COLORS = ['#7ec0f8', '#7de8a8', '#f8907e', '#ffe07a', '#c0a8ff', '#ffffff', '#a0c8ff']

export default function ConfettiBurst({ active, onDone }: Props): React.JSX.Element | null {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDoneRef = useRef(onDone)

  useEffect(() => { onDoneRef.current = onDone }, [onDone])

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height * 0.45

    const particles = Array.from({ length: 32 }, () => ({
      x: cx + (Math.random() - 0.5) * 220,
      y: cy + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 7,
      vy: -(Math.random() * 6 + 2),
      gravity: 0.14,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      w: Math.random() * 6 + 3,
      h: Math.random() * 4 + 2,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.18,
      alpha: 1,
      decay: Math.random() * 0.013 + 0.010,
    }))

    let raf = 0
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        if (p.alpha <= 0) continue
        alive = true
        p.vy += p.gravity
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotSpeed
        p.alpha -= p.decay
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.alpha)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
      }
      if (alive) {
        raf = requestAnimationFrame(animate)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        onDoneRef.current()
      }
    }
    raf = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(raf)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }, [active])

  if (!active) return null
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
