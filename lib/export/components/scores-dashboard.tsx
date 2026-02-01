import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fonts, fontSize, spacing, getScoreColor, safeText } from '../report-styles'

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.black,
    padding: spacing.page,
    fontFamily: fonts.body,
    color: colors.white,
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
  },
  scoreBarFill: {
    height: 4,
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
    { value: pressureScore, label: 'Pressure Score' },
    { value: gutAttractionIndex, label: 'Gut Attraction' },
    { value: credibilityScore, label: 'Credibility' },
  ]

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Scores Dashboard</Text>

      <View style={styles.scoresContainer}>
        {scores.map((score, index) => (
          <View key={index} style={styles.scoreCard}>
            <Text style={[styles.scoreValue, { color: getScoreColor(score.value || 0) }]}>
              {safeText(Math.round(score.value || 0))}
            </Text>
            <Text style={styles.scoreLabel}>{safeText(score.label)}</Text>
            <View style={styles.scoreBar}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${score.value || 0}%`,
                    backgroundColor: getScoreColor(score.value || 0),
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
              {safeText(purchaseIntentAvg.toFixed(1))} / 10
            </Text>
          </View>
          {purchaseIntentDistribution && (
            <>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>High Intent (8-10)</Text>
                <Text style={[styles.distributionValue, { color: colors.scoreHigh }]}>
                  {safeText(purchaseIntentDistribution.high)}%
                </Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>Medium Intent (5-7)</Text>
                <Text style={[styles.distributionValue, { color: colors.scoreMedium }]}>
                  {safeText(purchaseIntentDistribution.medium)}%
                </Text>
              </View>
              <View style={styles.distributionRow}>
                <Text style={styles.distributionLabel}>Low Intent (1-4)</Text>
                <Text style={[styles.distributionValue, { color: colors.scoreLow }]}>
                  {safeText(purchaseIntentDistribution.low)}%
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
