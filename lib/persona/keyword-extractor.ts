/**
 * Keyword Extractor
 * Extracts relevant keywords from stimulus text for memory matching
 */

// Common stop words to filter out
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
  'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought',
  'used', 'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
  'she', 'we', 'they', 'what', 'which', 'who', 'whom', 'whose', 'where',
  'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same',
  'so', 'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
  'then', 'once', 'our', 'your', 'their', 'my', 'his', 'her', 'up', 'out',
  'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below',
  'between', 'under', 'again', 'further', 'any', 'if', 'because', 'while',
  'get', 'new', 'make', 'made', 'like', 'even', 'way', 'use', 'uses'
])

// High-value FMCG keywords that should be boosted
const FMCG_KEYWORDS = new Set([
  // Product categories
  'cereal', 'yogurt', 'milk', 'cheese', 'bread', 'snack', 'chips', 'crackers',
  'juice', 'soda', 'water', 'coffee', 'tea', 'beer', 'wine', 'chocolate',
  'candy', 'cookies', 'ice cream', 'frozen', 'canned', 'soup', 'sauce',
  'pasta', 'rice', 'flour', 'sugar', 'oil', 'vinegar', 'condiment',
  'detergent', 'soap', 'shampoo', 'toothpaste', 'deodorant', 'lotion',
  'diapers', 'tissues', 'paper', 'cleaning', 'laundry',

  // Claims and attributes
  'natural', 'organic', 'healthy', 'fresh', 'premium', 'artisan', 'craft',
  'homemade', 'traditional', 'authentic', 'original', 'classic', 'new',
  'improved', 'reformulated', 'recipe', 'formula', 'ingredients',
  'sugar-free', 'fat-free', 'low-calorie', 'keto', 'vegan', 'gluten-free',
  'plant-based', 'whole grain', 'high protein', 'probiotic', 'vitamin',
  'fortified', 'enriched', 'superfood', 'antioxidant', 'immune',

  // Sustainability
  'sustainable', 'eco-friendly', 'recyclable', 'biodegradable', 'compostable',
  'carbon neutral', 'plastic-free', 'zero waste', 'renewable', 'green',
  'environmental', 'ethical', 'fair trade', 'local', 'farm',

  // Value/Price
  'value', 'savings', 'discount', 'deal', 'sale', 'coupon', 'bulk',
  'family size', 'economy', 'budget', 'affordable', 'premium', 'luxury',
  'exclusive', 'limited', 'special', 'offer',

  // Quality
  'quality', 'taste', 'flavor', 'texture', 'fresh', 'pure', 'real',
  'genuine', 'authentic', 'trusted', 'reliable', 'consistent',

  // Trust/Experience
  'trust', 'brand', 'loyalty', 'reputation', 'heritage', 'family',
  'generations', 'years', 'proven', 'tested', 'clinically', 'scientifically',
  'research', 'studies', 'experts', 'doctors', 'recommended',

  // Negative triggers
  'shrinkflation', 'misleading', 'fake', 'artificial', 'processed',
  'chemicals', 'additives', 'preservatives', 'hidden', 'deceptive',
  'greenwashing', 'overpriced', 'disappointing', 'changed', 'worse'
])

// Compound keywords that should be kept together
const COMPOUND_KEYWORDS = [
  'high fructose corn syrup', 'corn syrup', 'natural flavors', 'artificial flavors',
  'no added sugar', 'sugar free', 'fat free', 'gluten free', 'dairy free',
  'plant based', 'whole grain', 'high protein', 'low calorie', 'zero calorie',
  'clinically proven', 'scientifically tested', 'doctor recommended',
  'family owned', 'small batch', 'farm to table', 'locally sourced',
  'carbon neutral', 'carbon footprint', 'climate friendly', 'eco friendly',
  'fair trade', 'free range', 'cage free', 'grass fed', 'wild caught',
  'non gmo', 'certified organic', 'usda organic', 'b corp',
  'limited edition', 'limited time', 'special offer', 'family size',
  'store brand', 'private label', 'generic brand', 'name brand',
  'price increase', 'cost cutting', 'quality control'
]

export interface ExtractedKeywords {
  primary: string[]      // High-relevance keywords
  secondary: string[]    // Lower-relevance keywords
  compounds: string[]    // Multi-word phrases found
  all: string[]          // Combined unique keywords
}

/**
 * Extract keywords from stimulus text
 */
export function extractKeywords(text: string): ExtractedKeywords {
  const normalizedText = text.toLowerCase()

  // Find compound keywords first
  const compounds: string[] = []
  let processedText = normalizedText

  for (const compound of COMPOUND_KEYWORDS) {
    if (normalizedText.includes(compound)) {
      compounds.push(compound)
      // Replace with placeholder to avoid double-counting words
      processedText = processedText.replace(new RegExp(compound, 'g'), ' ')
    }
  }

  // Tokenize remaining text
  const words = processedText
    .replace(/[^\w\s-]/g, ' ')  // Remove punctuation except hyphens
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !STOP_WORDS.has(word))

  // Categorize keywords
  const primary: string[] = []
  const secondary: string[] = []

  for (const word of words) {
    if (FMCG_KEYWORDS.has(word)) {
      if (!primary.includes(word)) {
        primary.push(word)
      }
    } else if (word.length > 3) {
      if (!secondary.includes(word)) {
        secondary.push(word)
      }
    }
  }

  // Combine all unique keywords
  const all = [...new Set([...compounds, ...primary, ...secondary])]

  return {
    primary,
    secondary,
    compounds,
    all
  }
}

/**
 * Calculate keyword match score between extracted keywords and trigger keywords
 */
export function calculateKeywordScore(
  extracted: ExtractedKeywords,
  triggerKeywords: string[]
): number {
  let score = 0
  const triggers = triggerKeywords.map(k => k.toLowerCase())

  // Exact matches in primary keywords: +3
  for (const keyword of extracted.primary) {
    if (triggers.includes(keyword)) {
      score += 3
    }
  }

  // Exact matches in compound keywords: +4 (more specific)
  for (const compound of extracted.compounds) {
    if (triggers.some(t => compound.includes(t) || t.includes(compound))) {
      score += 4
    }
  }

  // Exact matches in secondary keywords: +2
  for (const keyword of extracted.secondary) {
    if (triggers.includes(keyword)) {
      score += 2
    }
  }

  // Partial matches: +1
  for (const keyword of extracted.all) {
    for (const trigger of triggers) {
      // Check for partial overlap (word stems)
      if (
        keyword !== trigger &&
        (keyword.startsWith(trigger.slice(0, 4)) || trigger.startsWith(keyword.slice(0, 4)))
      ) {
        score += 1
        break
      }
    }
  }

  return score
}
