import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function downloadCertificatePdf(elementId: string, fileName: string) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F8F4EB',
        logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [842, 595],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, 842, 595);
    pdf.save(fileName);
}
