import { jsPDF } from 'jspdf';
import { BPLog } from '../types';
import { getBPCategory } from '../constants';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export const exportLast7DaysReadingsToPDF = async (logs: BPLog[]) => {
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
  
  // Group logs by date
  interface GroupedLogs {
    [date: string]: BPLog[];
  }
  const groupedLogs: GroupedLogs = {};
  last7DaysLogs.forEach(log => {
    const date = new Date(log.timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    if (!groupedLogs[date]) {
      groupedLogs[date] = [];
    }
    groupedLogs[date].push(log);
  });
  
  // Sort dates in descending order
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  
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
  
  // Detailed Readings by Day
  let yPosition = 100;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Readings by Day', 20, yPosition);
  
  yPosition += 10;
  
  // Iterate through each day
  sortedDates.forEach((date, dayIndex) => {
    const dayReadings = groupedLogs[date];
    
    // Calculate day averages
    const dayAvgSys = Math.round(dayReadings.reduce((sum, r) => sum + r.systolic, 0) / dayReadings.length);
    const dayAvgDia = Math.round(dayReadings.reduce((sum, r) => sum + r.diastolic, 0) / dayReadings.length);
    const dayAvgPulse = Math.round(dayReadings.reduce((sum, r) => sum + r.pulse, 0) / dayReadings.length);
    
    // Check if we need a new page for day header
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }
    
    // Day header with background
    doc.setFillColor(245, 245, 250);
    doc.rect(20, yPosition - 5, 170, 12, 'F');
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(date, 25, yPosition + 2);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`${dayReadings.length} reading${dayReadings.length > 1 ? 's' : ''} | Avg: ${dayAvgSys}/${dayAvgDia} mmHg, ${dayAvgPulse} bpm`, 25, yPosition + 8);
    
    yPosition += 16;
    
    // Column headers for this day's readings
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('Time', 30, yPosition);
    doc.text('Systolic', 70, yPosition);
    doc.text('Diastolic', 100, yPosition);
    doc.text('Pulse', 130, yPosition);
    doc.text('Category', 155, yPosition);
    
    yPosition += 2;
    doc.setDrawColor(200, 200, 200);
    doc.line(30, yPosition, 190, yPosition);
    yPosition += 6;
    
    // Readings for this day
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    dayReadings.forEach((log, index) => {
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        
        // Redraw day header on new page
        doc.setFillColor(245, 245, 250);
        doc.rect(20, yPosition - 5, 170, 8, 'F');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`${date} (continued)`, 25, yPosition + 1);
        yPosition += 10;
        
        // Redraw column headers
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(100, 100, 100);
        doc.text('Time', 30, yPosition);
        doc.text('Systolic', 70, yPosition);
        doc.text('Diastolic', 100, yPosition);
        doc.text('Pulse', 130, yPosition);
        doc.text('Category', 155, yPosition);
        yPosition += 2;
        doc.line(30, yPosition, 190, yPosition);
        yPosition += 6;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
      }
      
      const time = new Date(log.timestamp);
      const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const category = getBPCategory(log.systolic, log.diastolic);
      
      doc.setFontSize(9);
      doc.text(timeStr, 30, yPosition);
      doc.text(log.systolic.toString(), 70, yPosition);
      doc.text(log.diastolic.toString(), 100, yPosition);
      doc.text(log.pulse.toString(), 130, yPosition);
      
      doc.setFontSize(8);
      doc.text(category, 155, yPosition);
      
      yPosition += 6;
      
      // Add note if exists
      if (log.note) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const noteText = `Note: ${log.note}`;
        const splitNote = doc.splitTextToSize(noteText, 160);
        doc.text(splitNote, 35, yPosition);
        yPosition += (splitNote.length * 4) + 2;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
      }
    });
    
    // Add spacing between days
    yPosition += 8;
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
  
  // Save or Share the PDF
  const filename = `BP_Report_${startDateStr.replace(/\//g, '-')}_to_${endDateStr.replace(/\//g, '-')}.pdf`;
  
  // Check if running on native platform (iOS/Android)
  if (Capacitor.isNativePlatform()) {
    try {
      // Get PDF as base64 data (without the data URL prefix)
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      // Save to temporary cache directory
      const savedFile = await Filesystem.writeFile({
        path: filename,
        data: pdfBase64,
        directory: Directory.Cache,
      });
      
      // Share the saved file
      await Share.share({
        title: 'Blood Pressure Report',
        text: `Blood Pressure Report: ${startDateStr} to ${endDateStr}`,
        url: savedFile.uri,
        dialogTitle: 'Share your Blood Pressure Report'
      });
      
      // Optionally delete the temp file after sharing
      // await Filesystem.deleteFile({
      //   path: filename,
      //   directory: Directory.Cache,
      // });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      // Fallback to download
      doc.save(filename);
    }
  } else {
    // Web browser - download directly
    doc.save(filename);
  }
};
