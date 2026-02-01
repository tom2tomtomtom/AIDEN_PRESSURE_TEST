import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fonts, fontSize, spacing, baseStyles, getScoreColor } from '../report-styles'

const styles = StyleSheet.create({
  page: {
    ...baseStyles.page,
  },
  sectionTitle: {
    ...baseStyles.sectionTitle,
  },
  scoresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.section,
    marginBottom: spacing.section,
  },
  scoreCard: {
    alignItems: 'center',
    width: 140,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: fonts.heading,
    marginBottom: spacing.tiny,
  },
  scoreLabel: {
    fontSize: fontSize.small,
    color: colors.whiteMuted,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.blackCard,
    marginTop: spacing.small,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
  },
  distributionSection: {
    marginTop: spacing.section * 2,
    backgroundColor: colors.blackCard,
    padding: spacing.section,
  },
  distributionTitle: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.item,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  distributionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  distributionLabel: {
    fontSize: fontSize.body,
    color: colors.whiteMuted,
  },
  distributionValue: {
    fontSize: fontSize.body,
    fontFamily: fonts.heading,
    color: colors.white,
  },
  footer: {
    ...baseStyles.footer,
  },
  footerText: {
    ...baseStyles.footerText,
  },
})

interface ScoresDashboardProps {
  pressureScore: number
  gutAttractionIndex: number
  credibilityScore: number
  purchaseIntentAvg?: number
  purchaseIntentDistribution?: {
    high: number
    medium: number
    low: number
  }
}

export function ScoresDashboard({
  pressureScore,
  gutAttractionIndex,
  credibilityScore,
  purchaseIntentAvg,
  purchaseIntentDistribution,
}: ScoresDashboardProps) {
  const scores = [
    { value: pressureScore, label: 'Pressure Score', description: 'Overall strength' },
    { value: gutAttractionIndex, label: 'Gut Attraction', description: 'Immediate appeal' },
    { value: credibilityScore, label: 'Credibility', description: 'Trust & belief' },
  ]

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Scores Dashboard</Text>

      <View style={styles.scoresContainer}>
        {scores.map((score, index) => (
          <View key={index} style={styles.scoreCard}>
            <Text style={[styles.scoreValue, { color: getScoreColor(score.value) }]}>
              {Math.round(score.value)}
            </Text>
            <Text style={styles.scoreLabel}>{score.label}</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${score.value}%`,
                    backgroundColor: getScoreColor(score.value),
                  },
                ]}
              />
            </View>
          </View>
        ))}
      </View>

      {purchaseIntentAvg !== undefined && (
        <View style={styles.distributionSection}>
          <Text style={styles.distributionTitle}>Purchase Intent</Text>
          <View style={styles.distributionRow}>
            <Text style={styles.distributionLabel}>Average Score</Text>
            <Text style={styles.distributionValue}>
              {purchaseIntentAvg.toFixed(1)} / 10
            </Text>
          </View>
          {purchaseIntentDistribution && (
            <>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>High Intent (8-10)</Text>
                <Text style={[styles.distributionValue, { color: colors.scoreHigh }]}>
                  {purchaseIntentDistribution.high}%
                </Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>Medium Intent (5-7)</Text>
                <Text style={[styles.distributionValue, { color: colors.scoreMedium }]}>
                  {purchaseIntentDistribution.medium}%
                </Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>Low Intent (1-4)</Text>
                <Text style={[styles.distributionValue, { color: colors.scoreLow }]}>
                  {purchaseIntentDistribution.low}%
                </Text>
              </View>
            </>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>AIDEN Pressure Test</Text>
        <Text style={styles.footerText}>Page 3</Text>
      </View>
    </Page>
  )
}
