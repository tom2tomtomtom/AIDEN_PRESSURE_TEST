'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'

interface ClaimAnalysis {
  claim: string
  averageCredibility: number
  believers: Array<{
    archetypeName: string
    personaName: string
    credibility: number
    reason?: string
  }>
  doubters: Array<{
    archetypeName: string
    personaName: string
    credibility: number
    reason?: string
  }>
  suggestedProof?: string
}

interface ClaimBreakdownProps {
  claims: ClaimAnalysis[]
  stimulus: string
}

/**
 * Get color class based on credibility score
 */
function getCredibilityColor(score: number): string {
  if (score >= 7) return 'text-green-500'
  if (score >= 5) return 'text-yellow-electric'
  return 'text-red-hot'
}

/**
 * Get progress bar color
 */
function getProgressColor(score: number): string {
  if (score >= 7) return 'bg-green-500'
  if (score >= 5) return 'bg-yellow-electric'
  return 'bg-red-hot'
}

/**
 * Individual claim card
 */
function ClaimCard({ claim }: { claim: ClaimAnalysis }) {
  const credibilityPercentage = (claim.averageCredibility / 10) * 100
  const believerCount = claim.believers.length
  const doubterCount = claim.doubters.length
  const total = believerCount + doubterCount

  return (
    <div className="border border-border-subtle bg-black-deep p-4 space-y-4">
      {/* Claim text */}
      <div className="flex items-start gap-3">
        <FileText className="h-5 w-5 text-orange-accent flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-white-full font-medium">&ldquo;{claim.claim}&rdquo;</p>
        </div>
        <Badge
          className={`${
            claim.averageCredibility >= 7
              ? 'bg-green-500/20 text-green-500 border-green-500/50'
              : claim.averageCredibility >= 5
              ? 'bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50'
              : 'bg-red-hot/20 text-red-hot border-red-hot/50'
          }`}
        >
          {claim.averageCredibility.toFixed(1)}/10
        </Badge>
      </div>

      {/* Credibility bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-white-muted">
          <span>Credibility Score</span>
          <span className={getCredibilityColor(claim.averageCredibility)}>
            {claim.averageCredibility.toFixed(1)}/10
          </span>
        </div>
        <div className="h-2 bg-black-ink rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor(claim.averageCredibility)} transition-all`}
            style={{ width: `${credibilityPercentage}%` }}
          />
        </div>
      </div>

      {/* Believers vs Doubters split */}
      <div className="grid grid-cols-2 gap-4">
        {/* Believers */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ThumbsUp className="h-4 w-4 text-green-500" />
            <span className="text-green-500 font-bold">
              Believers ({believerCount})
            </span>
            {total > 0 && (
              <span className="text-white-muted text-xs">
                {Math.round((believerCount / total) * 100)}%
              </span>
            )}
          </div>
          <div className="space-y-1">
            {claim.believers.length > 0 ? (
              claim.believers.slice(0, 3).map((b, i) => (
                <div key={i} className="text-xs">
                  <span className="text-white-full">{b.personaName}</span>
                  <span className="text-white-muted"> ({b.archetypeName})</span>
                  <span className="text-green-500"> - {b.credibility}/10</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-white-muted italic">No believers</p>
            )}
            {claim.believers.length > 3 && (
              <p className="text-xs text-white-muted">
                +{claim.believers.length - 3} more
              </p>
            )}
          </div>
        </div>

        {/* Doubters */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <ThumbsDown className="h-4 w-4 text-red-hot" />
            <span className="text-red-hot font-bold">
              Doubters ({doubterCount})
            </span>
            {total > 0 && (
              <span className="text-white-muted text-xs">
                {Math.round((doubterCount / total) * 100)}%
              </span>
            )}
          </div>
          <div className="space-y-1">
            {claim.doubters.length > 0 ? (
              claim.doubters.slice(0, 3).map((d, i) => (
                <div key={i} className="text-xs">
                  <span className="text-white-full">{d.personaName}</span>
                  <span className="text-white-muted"> ({d.archetypeName})</span>
                  <span className="text-red-hot"> - {d.credibility}/10</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-white-muted italic">No doubters</p>
            )}
            {claim.doubters.length > 3 && (
              <p className="text-xs text-white-muted">
                +{claim.doubters.length - 3} more
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Suggested proof */}
      {claim.suggestedProof && (
        <div className="bg-yellow-electric/10 border border-yellow-electric/30 p-3 mt-2">
          <div className="flex items-center gap-2 text-xs text-yellow-electric font-bold mb-1">
            <AlertCircle className="h-3 w-3" />
            Suggested Proof Point
          </div>
          <p className="text-xs text-white-muted">{claim.suggestedProof}</p>
        </div>
      )}
    </div>
  )
}

/**
 * Extract claims from stimulus text (simple extraction)
 */
function extractClaimsFromStimulus(stimulus: string): string[] {
  // Look for common claim patterns
  const claimPatterns = [
    /(?:we|our|this|it)\s+(?:will|can|helps?|provides?|delivers?|offers?|gives?)\s+[^.!?]+/gi,
    /(?:proven|guaranteed|clinically|scientifically)\s+[^.!?]+/gi,
    /(?:\d+%|\d+x)\s+[^.!?]+/gi,
    /(?:best|only|first|unique|revolutionary)\s+[^.!?]+/gi
  ]

  const claims = new Set<string>()

  for (const pattern of claimPatterns) {
    const matches = stimulus.match(pattern)
    if (matches) {
      for (const match of matches) {
        const cleaned = match.trim()
        if (cleaned.length > 20 && cleaned.length < 200) {
          claims.add(cleaned)
        }
      }
    }
  }

  // If no patterns found, split by sentences and take key ones
  if (claims.size === 0) {
    const sentences = stimulus.split(/[.!?]+/).filter(s => s.trim().length > 20)
    sentences.slice(0, 3).forEach(s => claims.add(s.trim()))
  }

  return Array.from(claims).slice(0, 5)
}

/**
 * Main Claim Breakdown component
 */
export function ClaimBreakdown({ claims, stimulus }: ClaimBreakdownProps) {
  // If no claims provided, try to extract from stimulus
  const displayClaims = useMemo(() => {
    if (claims && claims.length > 0) return claims

    // Auto-extract claims if none provided
    const extractedClaims = extractClaimsFromStimulus(stimulus)
    return extractedClaims.map(claim => ({
      claim,
      averageCredibility: 5, // Default
      believers: [],
      doubters: []
    }))
  }, [claims, stimulus])

  // Calculate overall claim credibility
  const overallCredibility = useMemo(() => {
    if (displayClaims.length === 0) return 0
    return (
      displayClaims.reduce((sum, c) => sum + c.averageCredibility, 0) /
      displayClaims.length
    )
  }, [displayClaims])

  if (displayClaims.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-hot" />
          Claim-by-Claim Breakdown
        </CardTitle>
        <div className="flex items-center gap-4">
          <p className="text-sm text-white-muted">
            How believable is each claim to your audience?
          </p>
          <Badge
            className={`${
              overallCredibility >= 7
                ? 'bg-green-500/20 text-green-500 border-green-500/50'
                : overallCredibility >= 5
                ? 'bg-yellow-electric/20 text-yellow-electric border-yellow-electric/50'
                : 'bg-red-hot/20 text-red-hot border-red-hot/50'
            }`}
          >
            Overall: {overallCredibility.toFixed(1)}/10
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayClaims.map((claim, index) => (
          <ClaimCard key={index} claim={claim} />
        ))}

        {/* Summary insights */}
        <div className="border-t border-border-subtle pt-4 mt-4">
          <h4 className="text-sm font-bold text-white-full mb-2">Key Insights</h4>
          <ul className="text-sm text-white-muted space-y-1">
            {displayClaims.some(c => c.averageCredibility < 5) && (
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-hot rounded-full" />
                Some claims have low credibility - consider adding proof points
              </li>
            )}
            {displayClaims.some(c => c.doubters.length > c.believers.length) && (
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-electric rounded-full" />
                More doubters than believers on certain claims
              </li>
            )}
            {displayClaims.every(c => c.averageCredibility >= 6) && (
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                All claims have reasonable credibility
              </li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
