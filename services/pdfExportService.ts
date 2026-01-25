import { jsPDF } from 'jspdf';
import { BPLog } from '../types';
import { getBPCategory } from '../constants';

export const exportLast7DaysReadingsToPDF = (logs: BPLog[]) => {
  if (logs.length === 0) {
    alert('No readings available to export');
    return;
  }

  // Get the last reading date
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const lastReadingDate = new Date(sortedLogs[0].timestamp);
  
  // Calculate date 7 days before the last reading
  const sevenDaysBeforeLastReading = new Date(lastReadingDate);
  sevenDaysBeforeLastReading.setDate(sevenDaysBeforeLastReading.getDate() - 7);
  
  // Filter logs from last 7 days from the last reading
  const last7DaysLogs = sortedLogs.filter(log => {
    const logDate = new Date(log.timestamp);
    return logDate >= sevenDaysBeforeLastReading && logDate <= lastReadingDate;
  });

  if (last7DaysLogs.length === 0) {
    alert('No readings found in the last 7 days from the last recorded date');
    return;
  }

  // Create PDF
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('HearthPulse', 20, 20);
  
  doc.setFontSize(16);
  doc.text('Blood Pressure Report', 20, 30);
  
  // Date range
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const startDateStr = sevenDaysBeforeLastReading.toLocaleDateString();
  const endDateStr = lastReadingDate.toLocaleDateString();
  doc.text(`Report Period: ${startDateStr} - ${endDateStr}`, 20, 40);
  doc.text(`Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 45);
  
  // Calculate statistics
  const avgSystolic = Math.round(last7DaysLogs.reduce((sum, log) => sum + log.systolic, 0) / last7DaysLogs.length);
  const avgDiastolic = Math.round(last7DaysLogs.reduce((sum, log) => sum + log.diastolic, 0) / last7DaysLogs.length);
  const avgPulse = Math.round(last7DaysLogs.reduce((sum, log) => sum + log.pulse, 0) / last7DaysLogs.length);
  
  const maxSystolic = Math.max(...last7DaysLogs.map(log => log.systolic));
  const minSystolic = Math.min(...last7DaysLogs.map(log => log.systolic));
  const maxDiastolic = Math.max(...last7DaysLogs.map(log => log.diastolic));
  const minDiastolic = Math.min(...last7DaysLogs.map(log => log.diastolic));
  
  // Summary Section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Readings: ${last7DaysLogs.length}`, 20, 62);
  doc.text(`Average: ${avgSystolic}/${avgDiastolic} mmHg`, 20, 68);
  doc.text(`Average Pulse: ${avgPulse} bpm`, 20, 74);
  doc.text(`Systolic Range: ${minSystolic} - ${maxSystolic} mmHg`, 20, 80);
  doc.text(`Diastolic Range: ${minDiastolic} - ${maxDiastolic} mmHg`, 20, 86);
  
  // Table headers
  let yPosition = 100;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Readings', 20, yPosition);
  
  yPosition += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date & Time', 20, yPosition);
  doc.text('Systolic', 70, yPosition);
  doc.text('Diastolic', 95, yPosition);
  doc.text('Pulse', 120, yPosition);
  doc.text('Category', 140, yPosition);
  
  // Draw line under headers
  doc.line(20, yPosition + 2, 190, yPosition + 2);
  
  // Table rows
  yPosition += 8;
  doc.setFont('helvetica', 'normal');
  
  last7DaysLogs.forEach((log, index) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
      
      // Redraw headers on new page
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Date & Time', 20, yPosition);
      doc.text('Systolic', 70, yPosition);
      doc.text('Diastolic', 95, yPosition);
      doc.text('Pulse', 120, yPosition);
      doc.text('Category', 140, yPosition);
      doc.line(20, yPosition + 2, 190, yPosition + 2);
      yPosition += 8;
      doc.setFont('helvetica', 'normal');
    }
    
    const date = new Date(log.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const category = getBPCategory(log.systolic, log.diastolic);
    
    doc.text(`${dateStr} ${timeStr}`, 20, yPosition);
    doc.text(log.systolic.toString(), 70, yPosition);
    doc.text(log.diastolic.toString(), 95, yPosition);
    doc.text(log.pulse.toString(), 120, yPosition);
    doc.text(category, 140, yPosition);
    
    // Add note if exists
    if (log.note) {
      yPosition += 5;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text(`Note: ${log.note}`, 25, yPosition);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      yPosition += 3;
    }
    
    yPosition += 7;
  });
  
  // Footer with disclaimer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('This report is for informational purposes only. Consult your healthcare provider for medical advice.', 20, 285);
    doc.text(`Page ${i} of ${pageCount}`, 180, 285);
  }
  
  // Save the PDF
  const filename = `BP_Report_${startDateStr.replace(/\//g, '-')}_to_${endDateStr.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
};
