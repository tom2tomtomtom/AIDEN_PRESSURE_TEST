'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface TestCompleteModalProps {
  isOpen: boolean
  onClose: () => void
  pressureScore: number
  gutIndex: number
  credibilityScore: number
  verdict?: string
  onViewResults: () => void
}

function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
  const [style, setStyle] = useState({
    left: '0%',
    backgroundColor: color,
    animationDelay: `${delay}ms`,
    transform: 'rotate(0deg)',
  })

  useEffect(() => {
    setStyle({
      left: `${Math.random() * 100}%`,
      backgroundColor: color,
      animationDelay: `${delay}ms`,
      transform: `rotate(${Math.random() * 360}deg)`,
    })
  }, [delay, color])

  return (
    <div
      className="absolute w-2 h-2 animate-confetti"
      style={style}
    />
  )
}

function ScoreDisplay({ score, label }: { score: number; label: string }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1000
      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setAnimatedScore(Math.round(score * eased))
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }, 300)
    return () => clearTimeout(timer)
  }, [score])

  const getScoreColor = (s: number) => {
    if (s >= 70) return 'text-green-500'
    if (s >= 50) return 'text-yellow-electric'
    return 'text-red-hot'
  }

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{animatedScore}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  )
}

export function TestCompleteModal({
  isOpen,
  onClose,
  pressureScore,
  gutIndex,
  credibilityScore,
  verdict,
  onViewResults,
}: TestCompleteModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const confettiTimer = setTimeout(() => setShowConfetti(true), 100)
      const confettiEndTimer = setTimeout(() => setShowConfetti(false), 3000)
      return () => {
        clearTimeout(confettiTimer)
        clearTimeout(confettiEndTimer)
      }
    }
    setShowConfetti(false)
    return undefined
  }, [isOpen])

  const confettiColors = ['#ff2e2e', '#ff6b00', '#ffeb3b', '#ffffff']

  const getVerdict = (score: number) => {
    if (score >= 80) return 'Excellent performance across all metrics'
    if (score >= 70) return 'Strong concept with minor refinements needed'
    if (score >= 60) return 'Good foundation with improvement opportunities'
    if (score >= 50) return 'Moderate potential with notable concerns'
    return 'Significant revisions recommended'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-primary bg-black-deep">
        {/* Confetti container */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-50">
            {Array.from({ length: 40 }).map((_, i) => (
              <ConfettiParticle
                key={i}
                delay={i * 50}
                color={confettiColors[i % confettiColors.length]}
              />
            ))}
          </div>
        )}

        <div className="relative z-10">
          {/* Success icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-primary bg-primary/10 mb-4">
              <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <DialogTitle className="text-2xl font-bold uppercase tracking-tight">
              Test Complete
            </DialogTitle>
          </div>

          {/* Main score */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">{pressureScore}</div>
            <div className="text-sm uppercase tracking-wide text-muted-foreground">
              Pressure Score
            </div>
            <div className="mt-3 h-2 bg-black-card border border-border-subtle overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full bg-gradient-to-r from-primary to-orange-accent transition-all duration-1000 ease-out"
                style={{ width: `${pressureScore}%` }}
              />
            </div>
          </div>

          {/* Secondary scores */}
          <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-border-subtle">
            <ScoreDisplay score={gutIndex} label="Gut Index" />
            <ScoreDisplay score={credibilityScore} label="Credibility" />
          </div>

          {/* Verdict */}
          <div className="text-center mb-6">
            <p className="text-muted-foreground italic text-sm">
              "{verdict || getVerdict(pressureScore)}"
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={onViewResults}
              className="w-full"
              size="lg"
            >
              View Full Results
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>

        {/* Confetti animation styles */}
        <style jsx global>{`
          @keyframes confetti {
            0% {
              transform: translateY(-10vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(720deg);
              opacity: 0;
            }
          }
          .animate-confetti {
            animation: confetti 3s ease-out forwards;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  )
}
