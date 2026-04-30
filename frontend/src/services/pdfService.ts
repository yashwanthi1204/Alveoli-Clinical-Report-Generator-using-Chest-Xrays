import jsPDF from 'jspdf';
import type { AnalysisReport } from '../types';


const DISEASE_COLORS: Record<string, string> = {
    covid: '#ef4444',
    normal: '#22c55e',
    pneumonia: '#f59e0b',
    tuberculosis: '#8b5cf6',
};

const DISEASE_LABELS: Record<string, string> = {
    covid: 'COVID-19',
    normal: 'Normal',
    pneumonia: 'Pneumonia',
    tuberculosis: 'Tuberculosis',
};

export async function generatePDFReport(report: AnalysisReport): Promise<Blob> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPos = margin;

    // Helper function to add text
    const addText = (text: string, x: number, y: number, options?: { fontSize?: number; fontStyle?: string; color?: string }) => {
        if (options?.fontSize) pdf.setFontSize(options.fontSize);
        if (options?.fontStyle) pdf.setFont('helvetica', options.fontStyle);
        if (options?.color) pdf.setTextColor(options.color);
        pdf.text(text, x, y);
        pdf.setTextColor('#000000');
        pdf.setFont('helvetica', 'normal');
    };

    // Header with gradient background
    pdf.setFillColor(30, 64, 175); // primary-800
    pdf.rect(0, 0, pageWidth, 40, 'F');

    pdf.setTextColor('#ffffff');
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ALVEOLI', margin, 20);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Chest X-Ray Analysis Report', margin, 28);
    pdf.text(`Report ID: ${report.id}`, pageWidth - margin - 50, 20);
    pdf.text(`Date: ${new Date(report.createdAt).toLocaleDateString()}`, pageWidth - margin - 50, 28);

    yPos = 55;
    pdf.setTextColor('#000000');

    // Patient Information Section
    pdf.setFillColor(241, 245, 249); // slate-100
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 35, 'F');

    addText('PATIENT INFORMATION', margin + 5, yPos, { fontSize: 12, fontStyle: 'bold' });
    yPos += 8;

    const patientInfo = [
        [`Name: ${report.userInfo.name}`, `Age: ${report.userInfo.age} years`],
        [`Gender: ${report.userInfo.gender.charAt(0).toUpperCase() + report.userInfo.gender.slice(1)}`, `Email: ${report.userInfo.email}`],
        [report.userInfo.phone ? `Phone: ${report.userInfo.phone}` : '', ''],
    ];

    patientInfo.forEach(row => {
        addText(row[0], margin + 5, yPos, { fontSize: 10 });
        addText(row[1], pageWidth / 2, yPos, { fontSize: 10 });
        yPos += 6;
    });
    yPos += 5;

    // Biological Markers Section
    pdf.setFillColor(241, 245, 249);
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 45, 'F');

    addText('BIOLOGICAL MARKERS', margin + 5, yPos, { fontSize: 12, fontStyle: 'bold' });
    yPos += 8;

    const markers = report.biologicalMarkers;
    const markerData = [
        [`Blood Pressure: ${markers.bloodPressure || 'N/A'}`, `O2 Saturation: ${markers.oxygenSaturation || 'N/A'}%`],
        [`Heart Rate: ${markers.heartRate || 'N/A'} bpm`, `Temperature: ${markers.temperature || 'N/A'}°C`],
        [`Respiratory Rate: ${markers.respiratoryRate || 'N/A'}/min`, `Weight: ${markers.weight || 'N/A'} kg`],
        [`Height: ${markers.height || 'N/A'} cm`, `Smoking: ${markers.smokingStatus || 'N/A'}`],
    ];

    markerData.forEach(row => {
        addText(row[0], margin + 5, yPos, { fontSize: 10 });
        addText(row[1], pageWidth / 2, yPos, { fontSize: 10 });
        yPos += 6;
    });

    if (markers.symptoms && markers.symptoms.length > 0) {
        addText(`Symptoms: ${markers.symptoms.join(', ')}`, margin + 5, yPos, { fontSize: 10 });
        yPos += 6;
    }
    yPos += 10;

    // Prediction Result Section
    const resultColor = DISEASE_COLORS[report.prediction.classification];
    pdf.setDrawColor(resultColor);
    pdf.setLineWidth(2);
    pdf.rect(margin, yPos - 5, pageWidth - 2 * margin, 30, 'S');

    addText('DIAGNOSIS RESULT', margin + 5, yPos, { fontSize: 12, fontStyle: 'bold' });
    yPos += 10;

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(resultColor);
    pdf.text(DISEASE_LABELS[report.prediction.classification], margin + 5, yPos);
    pdf.setTextColor('#000000');

    addText(`Confidence: ${(report.prediction.confidence * 100).toFixed(1)}%`, pageWidth / 2, yPos, { fontSize: 12 });
    yPos += 8;
    addText(`Inference Time: ${report.prediction.inferenceTimeMs}ms`, margin + 5, yPos - 2, { fontSize: 9 });
    yPos += 15;

    // Probability Distribution
    addText('Classification Probabilities:', margin + 5, yPos, { fontSize: 10, fontStyle: 'bold' });
    yPos += 8;

    const probs = report.prediction.probabilities;
    Object.entries(probs).forEach(([disease, prob]) => {
        const barWidth = (pageWidth - 2 * margin - 50) * prob;
        pdf.setFillColor(DISEASE_COLORS[disease]);
        pdf.rect(margin + 40, yPos - 4, barWidth, 5, 'F');
        addText(`${DISEASE_LABELS[disease]}:`, margin + 5, yPos, { fontSize: 9 });
        addText(`${(prob * 100).toFixed(1)}%`, margin + 40 + barWidth + 5, yPos, { fontSize: 9 });
        yPos += 8;
    });
    yPos += 10;

    // AI Analysis Section (if available)
    if (report.aiAnalysis && typeof report.aiAnalysis !== 'string') {
        const ai = report.aiAnalysis;

        // Ensure new page for detailed analysis
        pdf.addPage();
        yPos = margin;

        // Header for AI Section
        pdf.setFillColor(241, 245, 249); // slate-100
        pdf.rect(0, 0, pageWidth, 30, 'F');

        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(30, 64, 175); // primary-800
        pdf.text('AI MEDICAL ANALYSIS', margin, 20);
        yPos = 40;

        pdf.setTextColor('#000000');

        // Risk Badge
        const riskColors: Record<string, string> = {
            'Low': '#22c55e',
            'Moderate': '#f59e0b',
            'High': '#f97316',
            'Critical': '#ef4444'
        };
        const riskColor = riskColors[ai.riskLevel] || '#64748b';

        addText(`Risk Level: ${ai.riskLevel}`, pageWidth - margin - 50, 20, {
            fontSize: 12,
            fontStyle: 'bold',
            color: riskColor
        });

        // 1. Clinical Summary
        addText('CLINICAL SUMMARY', margin, yPos, { fontSize: 11, fontStyle: 'bold', color: '#334155' });
        yPos += 7;
        const summaryLines = pdf.splitTextToSize(ai.summary, pageWidth - 2 * margin);
        pdf.text(summaryLines, margin, yPos);
        yPos += (summaryLines.length * 5) + 10;

        // 2. Clinical Correlation
        pdf.setFillColor(248, 250, 252);
        pdf.rect(margin - 2, yPos - 2, pageWidth - 2 * margin + 4, 25, 'F'); // Approximate height, adjust dynamically if needed
        addText('VITALS & SYMPTOMS CORRELATION', margin, yPos + 3, { fontSize: 11, fontStyle: 'bold', color: '#334155' });
        yPos += 10;

        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        const correlationLines = pdf.splitTextToSize(ai.clinicalCorrelation, pageWidth - 2 * margin - 10);
        pdf.text(correlationLines, margin + 5, yPos);
        pdf.setFont('helvetica', 'normal');
        yPos += (correlationLines.length * 5) + 15;

        // 3. Key Findings & Recommendations (Grid Layout)
        const colWidth = (pageWidth - 3 * margin) / 2;

        // Findings Column
        let leftY = yPos;
        addText('KEY FINDINGS', margin, leftY, { fontSize: 11, fontStyle: 'bold', color: '#334155' });
        leftY += 7;
        ai.findings.forEach(finding => {
            pdf.setFillColor('#f59e0b');
            pdf.circle(margin + 2, leftY - 1, 1, 'F');
            const lines = pdf.splitTextToSize(finding, colWidth - 10);
            pdf.text(lines, margin + 6, leftY);
            leftY += (lines.length * 5) + 2;
        });

        // Recommendations Column
        let rightY = yPos;
        addText('RECOMMENDATIONS', margin + colWidth + margin, rightY, { fontSize: 11, fontStyle: 'bold', color: '#334155' });
        rightY += 7;
        ai.recommendations.forEach(rec => {
            pdf.setFillColor('#22c55e');
            pdf.circle(margin + colWidth + margin + 2, rightY - 1, 1, 'F');
            const lines = pdf.splitTextToSize(rec, colWidth - 10);
            pdf.text(lines, margin + colWidth + margin + 6, rightY);
            rightY += (lines.length * 5) + 2;
        });

        yPos = Math.max(leftY, rightY) + 10;

        // Disclaimer
        if (yPos > pageHeight - 30) {
            pdf.addPage();
            yPos = margin;
        }

        pdf.setDrawColor(203, 213, 225); // slate-300
        pdf.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 5;

        pdf.setFontSize(8);
        pdf.setTextColor('#64748b');
        const disclaimerLines = pdf.splitTextToSize(ai.disclaimer || 'Standard medical disclaimer applies.', pageWidth - 2 * margin);
        pdf.text(disclaimerLines, margin, yPos);
    }

    // Footer disclaimer
    pdf.setFontSize(8);
    pdf.setTextColor('#64748b');
    const disclaimer = 'DISCLAIMER: This report is generated by an AI system and is intended for informational purposes only. It should not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.';
    const disclaimerLines = pdf.splitTextToSize(disclaimer, pageWidth - 2 * margin);

    if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = margin;
    }

    disclaimerLines.forEach((line: string) => {
        pdf.text(line, margin, pageHeight - 20 + (disclaimerLines.indexOf(line) * 4));
    });

    return pdf.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
