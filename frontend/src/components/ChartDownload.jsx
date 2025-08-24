import React from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ChartDownload = ({ chartRef, chartType, chartData }) => {
  const downloadAsPNG = async () => {
    try {
      console.log('Starting 2D PNG download process...');
      
      if (!chartRef.current) {
        console.error('No chart reference found for download');
        return;
      }

      console.log('Capturing chart with html2canvas...');
      const canvas = await html2canvas(chartRef.current);
      console.log('Chart captured successfully:', !!canvas);

      const dataURL = canvas.toDataURL('image/png');
      console.log('Data URL generated:', dataURL.substring(0, 50) + '...');

      const link = document.createElement('a');
      link.download = `chart-${chartType}-${new Date().getTime()}.png`;
      link.href = dataURL;
      link.click();
      
      console.log('PNG download initiated successfully');
    } catch (error) {
      console.error('Error downloading PNG:', error);
    }
  };

  const downloadAsPDF = async () => {
    try {
      console.log('Starting 2D PDF download process...');
      
      if (!chartRef.current) {
        console.error('No chart reference found for download');
        return;
      }

      console.log('Capturing chart with html2canvas...');
      const canvas = await html2canvas(chartRef.current);
      console.log('Chart captured successfully:', !!canvas);

      const imgData = canvas.toDataURL('image/png');
      console.log('Image data generated:', imgData.substring(0, 50) + '...');

      const pdf = new jsPDF();
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('Adding image to PDF...');
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.save(`chart-${chartType}-${new Date().getTime()}.pdf`);
      
      console.log('PDF download initiated successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <button
        onClick={downloadAsPNG}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        title="Download as PNG"
      >
        📥 PNG
      </button>
      <button
        onClick={downloadAsPDF}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        title="Download as PDF"
      >
        📥 PDF
      </button>
    </div>
  );
};

export default ChartDownload;
