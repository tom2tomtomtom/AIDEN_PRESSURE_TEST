import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fonts, fontSize, spacing, safeText } from '../report-styles'

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.black,
    padding: 60,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  topSection: {
    marginTop: 80,
  },
  brandLabel: {
    fontSize: fontSize.small,
    color: colors.redHot,
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: spacing.section,
  },
  title: {
    fontSize: 42,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.item,
    lineHeight: 1.2,
  },
  subtitle: {
    fontSize: fontSize.h2,
    color: colors.whiteMuted,
    marginBottom: spacing.section * 2,
  },
  metaContainer: {
    marginTop: spacing.section,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: spacing.small,
  },
  metaLabel: {
    fontSize: fontSize.small,
    color: colors.whiteDim,
    width: 80,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: fontSize.small,
    color: colors.white,
  },
  bottomSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  aidenLogo: {
    fontSize: 28,
    fontFamily: fonts.heading,
    color: colors.redHot,
    letterSpacing: 6,
    marginBottom: spacing.small,
  },
  tagline: {
    fontSize: fontSize.small,
    color: colors.whiteDim,
    letterSpacing: 2,
  },
  decorativeLine: {
    width: 60,
    height: 3,
    backgroundColor: colors.redHot,
    marginVertical: spacing.section,
  },
})

interface CoverPageProps {
  testName: string
  projectName: string
  stimulusType: string
  createdAt: string
  completedAt?: string
}

export function CoverPage({ testName, projectName, stimulusType, createdAt, completedAt }: CoverPageProps) {
  const formattedDate = new Date(completedAt || createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Page size="A4" style={styles.page}>
      <View style={styles.topSection}>
        <Text style={styles.brandLabel}>Pressure Test Report</Text>
        <View style={styles.decorativeLine} />
        <Text style={styles.title}>{safeText(testName)}</Text>
        <Text style={styles.subtitle}>{safeText(projectName)}</Text>

        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaValue}>{safeText(stimulusType)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{safeText(formattedDate)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Text style={styles.aidenLogo}>AIDEN</Text>
        <Text style={styles.tagline}>SYNTHETIC QUALITATIVE RESEARCH</Text>
      </View>
    </Page>
  )
}
