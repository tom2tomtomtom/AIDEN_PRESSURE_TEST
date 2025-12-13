/**
 * Claim Detector
 * Identifies marketing claim types in stimulus text
 */

export type ClaimType =
  | 'natural'
  | 'health'
  | 'clinical'
  | 'premium'
  | 'value'
  | 'convenience'
  | 'sustainability'
  | 'tradition'
  | 'innovation'
  | 'social_proof'
  | 'fear_appeal'
  | 'emotional'

export interface DetectedClaim {
  type: ClaimType
  confidence: number  // 0-1 confidence score
  evidence: string[]  // Phrases that triggered detection
}

// Claim patterns with associated phrases
const CLAIM_PATTERNS: Record<ClaimType, { phrases: string[], weight: number }> = {
  natural: {
    phrases: [
      'natural', 'real', 'pure', 'simple', 'clean',
      'no artificial', 'nothing artificial', 'made with real',
      'from nature', 'naturally', 'all natural',
      'no preservatives', 'no additives', 'clean label',
      'minimal ingredients', 'simple ingredients',
      'no chemicals', 'chemical-free', 'wholesome'
    ],
    weight: 1.0
  },
  health: {
    phrases: [
      'healthy', 'health', 'nutritious', 'vitamin', 'mineral',
      'protein', 'fiber', 'antioxidant', 'probiotic', 'prebiotic',
      'immune', 'energy', 'wellness', 'well-being', 'wholesome',
      'nourish', 'superfood', 'nutrient', 'balanced',
      'low sugar', 'no sugar', 'sugar-free', 'low calorie',
      'low fat', 'fat-free', 'low sodium', 'heart healthy',
      'good for you', 'better for you', 'guilt-free'
    ],
    weight: 1.0
  },
  clinical: {
    phrases: [
      'clinically', 'scientifically', 'proven', 'tested',
      'studies show', 'research', 'doctor', 'dermatologist',
      'recommended', 'approved', 'certified', 'verified',
      'laboratory', 'clinical trial', 'evidence', 'data',
      'expert', 'specialist', 'professional', 'medical'
    ],
    weight: 1.2
  },
  premium: {
    phrases: [
      'premium', 'luxury', 'finest', 'exceptional', 'superior',
      'exclusive', 'select', 'artisan', 'craft', 'handcrafted',
      'small batch', 'limited', 'rare', 'curated', 'bespoke',
      'gourmet', 'deluxe', 'world-class', 'best', 'top',
      'elevated', 'sophisticated', 'refined', 'distinguished',
      'prestige', 'elite', 'high-end', 'upscale'
    ],
    weight: 1.0
  },
  value: {
    phrases: [
      'value', 'savings', 'save', 'affordable', 'budget',
      'economical', 'deal', 'bargain', 'discount', 'low price',
      'best price', 'price match', 'cheaper', 'cost-effective',
      'bang for buck', 'worth', 'smart choice', 'family size',
      'bulk', 'multi-pack', 'bonus', 'free', 'extra'
    ],
    weight: 1.0
  },
  convenience: {
    phrases: [
      'convenient', 'easy', 'quick', 'fast', 'simple',
      'ready', 'instant', 'on-the-go', 'portable', 'grab and go',
      'no prep', 'hassle-free', 'effortless', 'time-saving',
      'microwave', 'heat and serve', 'ready to eat',
      'one step', 'just add', 'minutes', 'snap', 'squeeze'
    ],
    weight: 1.0
  },
  sustainability: {
    phrases: [
      'sustainable', 'eco', 'green', 'environmental', 'planet',
      'recyclable', 'recycled', 'biodegradable', 'compostable',
      'carbon', 'footprint', 'renewable', 'responsible',
      'ethical', 'fair trade', 'organic', 'local', 'farm',
      'ocean', 'forest', 'climate', 'future', 'generation',
      'plastic-free', 'zero waste', 'b corp'
    ],
    weight: 1.0
  },
  tradition: {
    phrases: [
      'traditional', 'heritage', 'classic', 'original',
      'authentic', 'time-tested', 'generations', 'years',
      'since', 'established', 'legacy', 'family',
      'recipe', 'old-fashioned', 'grandma', 'homemade',
      'trusted', 'reliable', 'consistent', 'unchanged'
    ],
    weight: 1.0
  },
  innovation: {
    phrases: [
      'new', 'innovative', 'breakthrough', 'revolutionary',
      'first', 'latest', 'advanced', 'cutting-edge',
      'patented', 'exclusive', 'unique', 'never before',
      'reimagined', 'reinvented', 'next generation',
      'improved', 'better', 'upgraded', 'enhanced'
    ],
    weight: 0.9
  },
  social_proof: {
    phrases: [
      '#1', 'number one', 'best selling', 'award', 'winner',
      'favorite', 'popular', 'loved', 'trusted by',
      'millions', 'customers', 'reviews', 'rated',
      'recommended', 'chosen', 'preferred', 'top rated',
      'viral', 'trending', 'everyone', 'people love'
    ],
    weight: 1.0
  },
  fear_appeal: {
    phrases: [
      'protect', 'safety', 'safe', 'risk', 'danger',
      'harmful', 'avoid', 'prevent', 'worry', 'concern',
      'toxic', 'contaminated', 'unsafe', 'threat',
      "don't miss", 'limited time', 'running out', 'last chance',
      'before it\'s too late', 'act now'
    ],
    weight: 1.1
  },
  emotional: {
    phrases: [
      'love', 'joy', 'happiness', 'comfort', 'indulge',
      'treat', 'deserve', 'reward', 'special', 'moment',
      'memories', 'family', 'together', 'share', 'enjoy',
      'feel', 'experience', 'discover', 'taste', 'savor',
      'bliss', 'paradise', 'heaven', 'delight', 'pleasure'
    ],
    weight: 0.9
  }
}

/**
 * Detect claim types in stimulus text
 */
export function detectClaims(text: string): DetectedClaim[] {
  const normalizedText = text.toLowerCase()
  const claims: DetectedClaim[] = []

  for (const [type, pattern] of Object.entries(CLAIM_PATTERNS)) {
    const evidence: string[] = []

    for (const phrase of pattern.phrases) {
      if (normalizedText.includes(phrase)) {
        evidence.push(phrase)
      }
    }

    if (evidence.length > 0) {
      // Calculate confidence based on number of matches and weight
      const baseConfidence = Math.min(evidence.length / 3, 1)
      const confidence = Math.min(baseConfidence * pattern.weight, 1)

      claims.push({
        type: type as ClaimType,
        confidence,
        evidence
      })
    }
  }

  // Sort by confidence
  claims.sort((a, b) => b.confidence - a.confidence)

  return claims
}

/**
 * Get the primary claim type (highest confidence)
 */
export function getPrimaryClaimType(text: string): ClaimType | null {
  const claims = detectClaims(text)
  const firstClaim = claims[0]
  return firstClaim ? firstClaim.type : null
}

/**
 * Map claim types to memory emotional triggers
 */
export function getClaimTriggerMapping(claimType: ClaimType): string[] {
  const mappings: Record<ClaimType, string[]> = {
    natural: ['natural', 'artificial', 'ingredients', 'clean', 'real', 'pure'],
    health: ['healthy', 'sugar', 'nutrition', 'health', 'diet', 'wellness'],
    clinical: ['clinically proven', 'study', 'research', 'science', 'doctor'],
    premium: ['premium', 'quality', 'luxury', 'artisan', 'craft', 'exclusive'],
    value: ['price', 'value', 'savings', 'deal', 'discount', 'cheap', 'expensive'],
    convenience: ['convenient', 'easy', 'quick', 'time', 'simple', 'hassle'],
    sustainability: ['sustainable', 'eco', 'green', 'environment', 'plastic', 'recycle'],
    tradition: ['traditional', 'heritage', 'family', 'generations', 'classic', 'trust'],
    innovation: ['new', 'innovative', 'improved', 'change', 'formula'],
    social_proof: ['popular', 'trending', 'viral', 'everyone', 'reviews'],
    fear_appeal: ['safe', 'protect', 'risk', 'worry', 'harmful'],
    emotional: ['love', 'family', 'happy', 'comfort', 'treat', 'enjoy']
  }

  return mappings[claimType] ?? []
}
