import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';

// Define styles for a professional look
const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 10,
    borderBottom: '1 solid #dcdcdc',
    paddingBottom: 5,
  },
  subsection: {
    marginBottom: 10,
  },
  score: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  feedback: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 5,
  },
  recommendation: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 5,
  },
  chartContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  overallText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 10,
  },
});

interface EvaluationResultsPDFProps {
  results: {
    overall: string;
    scores: Record<string, number>;
    feedback: Record<string, string>;
    recommendations: Record<string, string>;
  };
  chartImage: string;
}

const EvaluationResultsPDF = ({ results, chartImage }: EvaluationResultsPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <Text style={styles.header}>Evaluation Results</Text>
      <Text style={styles.overallText}>Overall Assessment: {results.overall || 'N/A'}</Text>

      {/* Radar Chart */}
      {chartImage && (
        <View style={styles.chartContainer}>
          <Image src={chartImage} style={{ width: 1600, height: 400 }} />
        </View>
      )}

      {/* Assess Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assess</Text>
        {['Market Research Quality', 'Consumer Segmentation', 'Competitive Analysis', 'Problem-Solution Fit'].map(
          (key) => (
            <View key={key} style={styles.subsection}>
              <Text style={styles.score}>{key}: {results.scores[key] || 'N/A'}/10</Text>
              <Text style={styles.feedback}>Feedback: {results.feedback[key] || 'N/A'}</Text>
              <Text style={styles.recommendation}>Recommendation: {results.recommendations[key] || 'N/A'}</Text>
            </View>
          )
        )}
      </View>

      {/* Implement Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Implement</Text>
        {['Brand Positioning', 'Product Development', 'Marketing Effectiveness', 'Customer Experience'].map((key) => (
          <View key={key} style={styles.subsection}>
            <Text style={styles.score}>{key}: {results.scores[key] || 'N/A'}/10</Text>
            <Text style={styles.feedback}>Feedback: {results.feedback[key] || 'N/A'}</Text>
            <Text style={styles.recommendation}>Recommendation: {results.recommendations[key] || 'N/A'}</Text>
          </View>
        ))}
      </View>

      {/* Monitor Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitor</Text>
        {['Performance Tracking', 'Consumer Sentiment'].map((key) => (
          <View key={key} style={styles.subsection}>
            <Text style={styles.score}>{key}: {results.scores[key] || 'N/A'}/10</Text>
            <Text style={styles.feedback}>Feedback: {results.feedback[key] || 'N/A'}</Text>
            <Text style={styles.recommendation}>Recommendation: {results.recommendations[key] || 'N/A'}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default EvaluationResultsPDF;