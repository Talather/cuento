import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PrinterIcon } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { PrintableStoryPDF } from './PrintableStoryPDF';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import { BookPreview, BookPage } from './BookPreview';

interface PrintStoryButtonProps {
  storyId: string;
}

export const PrintStoryButton = ({ storyId }: PrintStoryButtonProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  const { data: story } = useQuery({
    queryKey: ['story', storyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
  });

  const generatePDF = async (pages: BookPage[]) => {
    if (!story) {
      toast({
        title: "Error",
        description: "No se pudo encontrar la historia",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      console.log('Starting PDF generation for story:', story.title);

      // Load the base PDF (tapa.pdf)
      const baseResponse = await fetch('/tapa.pdf');
      const baseArrayBuffer = await baseResponse.arrayBuffer();
      const basePdfDoc = await PDFDocument.load(baseArrayBuffer);

      // Get the first page of the base PDF
      const firstPage = basePdfDoc.getPages()[0];

      // Add title to the cover page
      const { width, height } = firstPage.getSize();
      firstPage.drawText(story.title, {
        x: width / 2,
        y: height / 2,
        size: 24,
        font: await basePdfDoc.embedFont('Helvetica-Bold'),
        color: rgb(0, 0, 0),
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0)
      });

      // Generate story content PDF with the arranged pages
      const storyWithArrangedPages = {
        ...story,
        arrangedPages: pages
      };

      let storyPdfDoc;
      try {
        console.log('Generating story PDF content...');
        const storyBlob = await pdf(<PrintableStoryPDF story={storyWithArrangedPages} />).toBlob();
        const storyArrayBuffer = await storyBlob.arrayBuffer();
        storyPdfDoc = await PDFDocument.load(storyArrayBuffer);
      } catch (error) {
        console.error('Error generating story PDF:', error);
        throw new Error('Error generating story PDF');
      }

      // Copy pages from story PDF to base PDF
      const storyPages = await basePdfDoc.copyPages(storyPdfDoc, storyPdfDoc.getPageIndices());
      storyPages.forEach((page) => {
        basePdfDoc.addPage(page);
      });

      // Save the final PDF
      const pdfBytes = await basePdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // Open PDF in new tab
      window.open(url, '_blank');

      toast({
        title: "¡Listo!",
        description: "Tu PDF se ha generado correctamente",
      });
    } catch (error) {
      console.error('Error in PDF generation:', error);
      toast({
        title: "Error",
        description: "Hubo un error generando el PDF",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setShowPreview(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPreview(true)}
        disabled={isGenerating || !story}
      >
        <PrinterIcon className="w-4 h-4 mr-2" />
        {isGenerating ? 'Generando...' : 'Imprimir'}
      </Button>

      {showPreview && story && (
        <BookPreview
          story={story}
          onClose={() => setShowPreview(false)}
          onConfirm={generatePDF}
        />
      )}
    </>
  );
};