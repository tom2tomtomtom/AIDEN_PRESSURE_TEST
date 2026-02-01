import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fonts, fontSize, spacing, getScoreColor, getScoreVerdict } from '../report-styles'

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.black,
    padding: spacing.page,
    fontFamily: fonts.body,
    color: colors.white,
  },
  header: {
    marginBottom: spacing.section,
  },
  sectionTitle: {
    fontSize: fontSize.h1,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.section,
    borderBottomWidth: 2,
    borderBottomColor: colors.redHot,
    paddingBottom: spacing.small,
  },
  verdictContainer: {
    backgroundColor: colors.blackCard,
    padding: spacing.section,
    marginBottom: spacing.section,
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: fontSize.small,
    color: colors.whiteDim,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: spacing.small,
  },
  score: {
    fontSize: 72,
    fontFamily: fonts.heading,
    marginBottom: spacing.small,
  },
  verdictText: {
    fontSize: fontSize.h2,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.item,
  },
  verdictDescription: {
    fontSize: fontSize.body,
    color: colors.whiteMuted,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 1.5,
  },
  takeawaysSection: {
    marginTop: spacing.section,
  },
  takeawaysTitle: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.item,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  takeawayItem: {
    flexDirection: 'row',
    marginBottom: spacing.item,
    alignItems: 'flex-start',
  },
  takeawayNumber: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.redHot,
    width: 24,
  },
  takeawayContent: {
    flex: 1,
  },
  takeawayText: {
    fontSize: fontSize.body,
    color: colors.white,
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
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
})

interface ExecutiveSummaryProps {
  pressureScore: number
  oneLineVerdict?: string
  keyStrengths?: Array<{ point: string }>
  keyWeaknesses?: Array<{ point: string }>
  recommendations?: Array<{ recommendation: string; priority: string }>
}

export function ExecutiveSummary({
  pressureScore,
  oneLineVerdict,
  keyStrengths = [],
  keyWeaknesses = [],
  recommendations = [],
}: ExecutiveSummaryProps) {
  const scoreColor = getScoreColor(pressureScore)
  const verdict = getScoreVerdict(pressureScore)

  // Build key takeaways
  const takeaways: string[] = []

  // Top strength
  const topStrength = keyStrengths?.[0]
  if (topStrength) {
    takeaways.push(`Strength: ${topStrength.point}`)
  }

  // Top concern
  const topWeakness = keyWeaknesses?.[0]
  if (topWeakness) {
    takeaways.push(`Concern: ${topWeakness.point}`)
  }

  // Top must-fix recommendation
  const mustFix = recommendations?.find((r) => r.priority === 'must_fix')
  const topRecommendation = recommendations?.[0]
  if (mustFix) {
    takeaways.push(`Priority: ${mustFix.recommendation}`)
  } else if (topRecommendation) {
    takeaways.push(`Next step: ${topRecommendation.recommendation}`)
  }

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
      </View>

      <View style={styles.verdictContainer}>
        <Text style={styles.scoreLabel}>Pressure Score</Text>
        <Text style={[styles.score, { color: scoreColor }]}>{Math.round(pressureScore)}</Text>
        <Text style={styles.verdictText}>{verdict}</Text>
        {oneLineVerdict && <Text style={styles.verdictDescription}>{oneLineVerdict}</Text>}
      </View>

      {takeaways.length > 0 && (
        <View style={styles.takeawaysSection}>
          <Text style={styles.takeawaysTitle}>Key Takeaways</Text>
          {takeaways.map((takeaway, index) => (
            <View key={index} style={styles.takeawayItem}>
              <Text style={styles.takeawayNumber}>{index + 1}</Text>
              <View style={styles.takeawayContent}>
                <Text style={styles.takeawayText}>{takeaway}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>AIDEN Pressure Test</Text>
        <Text style={styles.footerText}>Page 2</Text>
      </View>
    </Page>
  )
}
