// AIDEN PDF Report Styling Tokens
import { StyleSheet } from '@react-pdf/renderer'

// AIDEN Brand Colors
export const colors = {
  // Primary
  black: '#050505',
  blackDeep: '#0a0a0a',
  blackCard: '#0f0f0f',

  // Accents
  redHot: '#ff2e2e',
  redDim: '#cc2525',
  orange: '#ff6b00',

  // Text
  white: '#ffffff',
  whiteMuted: '#999999',
  whiteDim: '#666666',

  // Scores
  scoreHigh: '#22c55e',
  scoreMedium: '#eab308',
  scoreLow: '#ef4444',

  // Sections
  strengthBg: '#052e16',
  strengthBorder: '#22c55e',
  weaknessBg: '#450a0a',
  weaknessBorder: '#ef4444',
  recommendationBg: '#1e1b4b',
  recommendationBorder: '#6366f1',
}

// Typography
export const fonts = {
  heading: 'Helvetica-Bold',
  body: 'Helvetica',
  mono: 'Courier',
}

// Font sizes
export const fontSize = {
  title: 32,
  h1: 24,
  h2: 18,
  h3: 14,
  body: 11,
  small: 9,
  tiny: 8,
}

// Spacing
export const spacing = {
  page: 40,
  section: 24,
  item: 12,
  small: 8,
  tiny: 4,
}

// Shared styles for PDF components
export const baseStyles = StyleSheet.create({
  page: {
    backgroundColor: colors.black,
    padding: spacing.page,
    fontFamily: fonts.body,
    color: colors.white,
  },

  // Cover page
  coverPage: {
    backgroundColor: colors.black,
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  coverTitle: {
    fontSize: fontSize.title,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.small,
  },
  coverSubtitle: {
    fontSize: fontSize.h2,
    color: colors.whiteMuted,
    marginBottom: spacing.section,
  },
  coverMeta: {
    fontSize: fontSize.body,
    color: colors.whiteDim,
  },
  coverBrand: {
    fontSize: fontSize.h2,
    fontFamily: fonts.heading,
    color: colors.redHot,
  },

  // Section headers
  sectionTitle: {
    fontSize: fontSize.h1,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.section,
    borderBottomWidth: 2,
    borderBottomColor: colors.redHot,
    paddingBottom: spacing.small,
  },
  subsectionTitle: {
    fontSize: fontSize.h2,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.item,
  },

  // Cards
  card: {
    backgroundColor: colors.blackCard,
    padding: spacing.item,
    marginBottom: spacing.item,
    borderLeftWidth: 3,
  },
  cardStrength: {
    borderLeftColor: colors.strengthBorder,
    backgroundColor: colors.strengthBg,
  },
  cardWeakness: {
    borderLeftColor: colors.weaknessBorder,
    backgroundColor: colors.weaknessBg,
  },
  cardRecommendation: {
    borderLeftColor: colors.recommendationBorder,
    backgroundColor: colors.recommendationBg,
  },

  // Text styles
  bodyText: {
    fontSize: fontSize.body,
    color: colors.white,
    lineHeight: 1.5,
    marginBottom: spacing.small,
  },
  mutedText: {
    fontSize: fontSize.small,
    color: colors.whiteMuted,
    marginTop: spacing.tiny,
  },
  label: {
    fontSize: fontSize.small,
    color: colors.whiteDim,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    marginBottom: spacing.tiny,
  },

  // Scores
  scoreContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.section,
  },
  scoreItem: {
    alignItems: 'center',
    textAlign: 'center',
  },
  scoreValue: {
    fontSize: 36,
    fontFamily: fonts.heading,
  },
  scoreLabel: {
    fontSize: fontSize.small,
    color: colors.whiteMuted,
    marginTop: spacing.tiny,
  },

  // Quotes
  quote: {
    fontSize: fontSize.body,
    fontStyle: 'italic',
    color: colors.white,
    marginBottom: spacing.tiny,
    paddingLeft: spacing.item,
    borderLeftWidth: 2,
    borderLeftColor: colors.whiteDim,
  },
  quoteAttribution: {
    fontSize: fontSize.small,
    color: colors.whiteMuted,
    paddingLeft: spacing.item,
  },

  // Lists
  listItem: {
    flexDirection: 'row',
    marginBottom: spacing.small,
  },
  listBullet: {
    width: 12,
    fontSize: fontSize.body,
    color: colors.redHot,
  },
  listContent: {
    flex: 1,
  },

  // Badges
  badge: {
    fontSize: fontSize.tiny,
    paddingHorizontal: 6,
    paddingVertical: 2,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  badgeCritical: {
    backgroundColor: colors.redHot,
    color: colors.white,
  },
  badgeMajor: {
    backgroundColor: colors.orange,
    color: colors.white,
  },
  badgeMinor: {
    backgroundColor: colors.whiteDim,
    color: colors.white,
  },
  badgeMustFix: {
    backgroundColor: colors.redHot,
    color: colors.white,
  },
  badgeShouldImprove: {
    backgroundColor: colors.orange,
    color: colors.white,
  },
  badgeNiceToHave: {
    backgroundColor: '#3b82f6',
    color: colors.white,
  },

  // Footer
  footer: {
    position: 'absolute' as const,
    bottom: 30,
    left: spacing.page,
    right: spacing.page,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.whiteDim,
    paddingTop: spacing.small,
  },
  footerText: {
    fontSize: fontSize.tiny,
    color: colors.whiteDim,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.whiteDim,
    marginVertical: spacing.section,
  },

  // Two-column layout
  row: {
    flexDirection: 'row',
    gap: spacing.item,
  },
  col: {
    flex: 1,
  },
})

// Helper to get score color
export function getScoreColor(score: number): string {
  if (score >= 70) return colors.scoreHigh
  if (score >= 50) return colors.scoreMedium
  return colors.scoreLow
}

// Helper to get score verdict
export function getScoreVerdict(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 70) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 40) return 'Needs Work'
  if (score >= 30) return 'Weak'
  return 'Critical'
}

// Helper to safely convert any value to a string for PDF rendering
// This prevents React error #31 when database returns objects instead of strings
export function safeText(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  if (typeof value === 'object') {
    // Handle arrays
    if (Array.isArray(value)) {
      return value.map(v => safeText(v)).join(', ')
    }
    // Handle objects - try to stringify
    try {
      return JSON.stringify(value)
    } catch {
      return '[Object]'
    }
  }
  return String(value)
}
