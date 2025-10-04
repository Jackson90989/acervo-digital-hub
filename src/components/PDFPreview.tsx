import { useEffect, useRef } from "react";
import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";


GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;


interface PDFPreviewProps {
  url: string;
}

export function PDFPreview({ url }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const renderPDF = async () => {
      const pdf = await getDocument(url).promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context!, viewport }).promise;
    };

    renderPDF();
  }, [url]);

  return <canvas ref={canvasRef} className="w-full h-auto rounded-t-lg" />;
}
