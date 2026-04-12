import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { Story } from '@/types/story';
import { BookPage } from './BookPreview';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica' },
    { src: 'Helvetica-Bold', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePage: {
    width: '100%',
    height: '100%',
  },
  content: {
    fontSize: 12,
    lineHeight: 1.5,
    textAlign: 'center',
  },
  paragraph: {
    marginBottom: 10,
  },
});

interface PrintableStoryPDFProps {
  story: Story & { arrangedPages?: BookPage[] };
}

export const PrintableStoryPDF = ({ story }: PrintableStoryPDFProps) => {
  const pages = story.arrangedPages?.map((page, index) => {
    if (page.type === 'text') {
      return (
        <Page key={`text-${index}`} size={[566, 425]} style={styles.page}>
          <View style={styles.content}>
            {page.content.split('\n\n').map((paragraph, pIndex) => (
              <Text key={pIndex} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
          </View>
        </Page>
      );
    } else {
      return (
        <Page key={`image-${index}`} size={[566, 425]}>
          <Image src={page.content} style={styles.imagePage} />
        </Page>
      );
    }
  });

  return (
    <Document>
      {pages}
    </Document>
  );
};