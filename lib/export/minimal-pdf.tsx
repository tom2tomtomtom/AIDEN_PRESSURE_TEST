import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#000000',
    padding: 40
  },
  text: {
    color: '#ffffff',
    fontSize: 24
  }
})

interface MinimalPDFProps {
  testName: string
}

export function MinimalPDF({ testName }: MinimalPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <Text style={styles.text}>Test Report: {testName}</Text>
        </View>
      </Page>
    </Document>
  )
}
