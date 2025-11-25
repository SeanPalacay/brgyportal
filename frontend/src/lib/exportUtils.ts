import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// PDF Export Functions
export const exportToPDF = (data: any[], title: string, columns: string[], filename?: string) => {
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(20);
  doc.text(title, 20, 20);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
  
  // Create table
  autoTable(doc, {
    head: [columns],
    body: data.map(item => columns.map(col => {
      const key = col.toLowerCase().replace(/\s+/g, '').replace(/[()%]/g, '');
      return String(item[key] || item[col] || item[col.toLowerCase()] || '');
    })),
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });
  
  // Save the PDF
  doc.save(filename || `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Excel Export Functions
export const exportToExcel = (data: any[], title: string, filename?: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, title);
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Save the file
  saveAs(blob, filename || `${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Health Reports Export
export const exportHealthReportToPDF = (report: any) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text('Health Services Report - Gabay Barangay', 20, 20);
  
  // Summary
  doc.setFontSize(14);
  doc.text('Summary Statistics', 20, 40);
  doc.setFontSize(10);
  doc.text(`Total Patients: ${report.summary?.totalPatients || 0}`, 20, 50);
  doc.text(`Total Appointments: ${report.summary?.totalAppointments || 0}`, 20, 60);
  doc.text(`Completed Appointments: ${report.summary?.completedAppointments || 0}`, 20, 70);
  doc.text(`Total Vaccinations: ${report.summary?.totalVaccinations || 0}`, 20, 80);
  doc.text(`Completion Rate: ${(report.summary?.completionRate || 0).toFixed(1)}%`, 20, 90);
  
  let currentY = 110;
  
  // Appointments by Type
  if (report.appointments?.byType?.length > 0) {
    doc.setFontSize(14);
    doc.text('Appointments by Type', 20, currentY);
    
    autoTable(doc, {
      head: [['Type', 'Count']],
      body: report.appointments.byType.map((item: any) => [item.type || 'N/A', String(item.count || 0)]),
      startY: currentY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    
    currentY += 60;
  }
  
  // Demographics
  if (report.demographics?.byGender?.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Demographics by Gender', 20, currentY);
    
    autoTable(doc, {
      head: [['Gender', 'Count']],
      body: report.demographics.byGender.map((item: any) => [item.gender || 'N/A', String(item.count || 0)]),
      startY: currentY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
  }
  
  doc.save(`health-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportHealthReportToExcel = (report: any) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Patients', report.summary?.totalPatients || 0],
    ['Total Appointments', report.summary?.totalAppointments || 0],
    ['Completed Appointments', report.summary?.completedAppointments || 0],
    ['Total Vaccinations', report.summary?.totalVaccinations || 0],
    ['Completion Rate (%)', (report.summary?.completionRate || 0).toFixed(1)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Appointments by Type
  if (report.appointments?.byType?.length > 0) {
    const appointmentsData = report.appointments.byType.map((item: any) => ({
      Type: item.type || 'N/A',
      Count: item.count || 0
    }));
    const appointmentsSheet = XLSX.utils.json_to_sheet(appointmentsData);
    XLSX.utils.book_append_sheet(workbook, appointmentsSheet, 'Appointments by Type');
  }
  
  // Demographics
  if (report.demographics?.byGender?.length > 0) {
    const genderData = report.demographics.byGender.map((item: any) => ({
      Gender: item.gender || 'N/A',
      Count: item.count || 0
    }));
    const genderSheet = XLSX.utils.json_to_sheet(genderData);
    XLSX.utils.book_append_sheet(workbook, genderSheet, 'Demographics by Gender');
  }
  
  // Blood Type Demographics
  if (report.demographics?.byBloodType?.length > 0) {
    const bloodTypeData = report.demographics.byBloodType.map((item: any) => ({
      'Blood Type': item.bloodType || 'N/A',
      Count: item.count || 0
    }));
    const bloodTypeSheet = XLSX.utils.json_to_sheet(bloodTypeData);
    XLSX.utils.book_append_sheet(workbook, bloodTypeSheet, 'Blood Type Distribution');
  }
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `health-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Daycare Reports Export
export const exportDaycareReportToPDF = (report: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Daycare Services Report - Gabay Barangay', 20, 20);
  
  doc.setFontSize(14);
  doc.text('Summary Statistics', 20, 40);
  doc.setFontSize(10);
  doc.text(`Total Students: ${report.summary?.totalStudents || 0}`, 20, 50);
  doc.text(`Total Registrations: ${report.summary?.totalRegistrations || 0}`, 20, 60);
  doc.text(`Approved Registrations: ${report.summary?.approvedRegistrations || 0}`, 20, 70);
  doc.text(`Pending Registrations: ${report.summary?.pendingRegistrations || 0}`, 20, 80);
  doc.text(`Average Attendance Rate: ${(report.summary?.averageAttendanceRate || 0).toFixed(1)}%`, 20, 90);
  
  let currentY = 110;
  
  // Registration Status
  if (report.registrations?.byStatus?.length > 0) {
    doc.setFontSize(14);
    doc.text('Registration Status', 20, currentY);
    
    autoTable(doc, {
      head: [['Status', 'Count']],
      body: report.registrations.byStatus.map((item: any) => [item.status || 'N/A', String(item.count || 0)]),
      startY: currentY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    
    currentY += 60;
  }
  
  // Demographics
  if (report.demographics?.byGender?.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Student Demographics', 20, currentY);
    
    autoTable(doc, {
      head: [['Gender', 'Count']],
      body: report.demographics.byGender.map((item: any) => [item.gender || 'N/A', String(item.count || 0)]),
      startY: currentY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
  }
  
  doc.save(`daycare-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportDaycareReportToExcel = (report: any) => {
  const workbook = XLSX.utils.book_new();
  
  const summaryData = [
    ['Metric', 'Value'],
    ['Total Students', report.summary?.totalStudents || 0],
    ['Total Registrations', report.summary?.totalRegistrations || 0],
    ['Approved Registrations', report.summary?.approvedRegistrations || 0],
    ['Pending Registrations', report.summary?.pendingRegistrations || 0],
    ['Average Attendance Rate (%)', (report.summary?.averageAttendanceRate || 0).toFixed(1)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  // Registration Status
  if (report.registrations?.byStatus?.length > 0) {
    const statusData = report.registrations.byStatus.map((item: any) => ({
      Status: item.status || 'N/A',
      Count: item.count || 0
    }));
    const statusSheet = XLSX.utils.json_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Registration Status');
  }
  
  // Demographics
  if (report.demographics?.byGender?.length > 0) {
    const genderData = report.demographics.byGender.map((item: any) => ({
      Gender: item.gender || 'N/A',
      Count: item.count || 0
    }));
    const genderSheet = XLSX.utils.json_to_sheet(genderData);
    XLSX.utils.book_append_sheet(workbook, genderSheet, 'Student Demographics');
  }
  
  // Age Groups
  if (report.demographics?.byAgeGroup?.length > 0) {
    const ageData = report.demographics.byAgeGroup.map((item: any) => ({
      'Age Group': item.ageGroup || 'N/A',
      Count: item.count || 0
    }));
    const ageSheet = XLSX.utils.json_to_sheet(ageData);
    XLSX.utils.book_append_sheet(workbook, ageSheet, 'Age Distribution');
  }
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `daycare-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// SK Reports Export
export const exportSKReportToPDF = (report: any) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('SK Engagement Report - Gabay Barangay', 20, 20);
  
  doc.setFontSize(14);
  doc.text('Summary Statistics', 20, 40);
  doc.setFontSize(10);
  doc.text(`Total Events: ${report.summary?.totalEvents || 0}`, 20, 50);
  doc.text(`Published Events: ${report.summary?.publishedEvents || 0}`, 20, 60);
  doc.text(`Completed Events: ${report.summary?.completedEvents || 0}`, 20, 70);
  doc.text(`Total Registrations: ${report.summary?.totalRegistrations || 0}`, 20, 80);
  doc.text(`Total Attendance: ${report.summary?.totalAttendance || 0}`, 20, 90);
  doc.text(`Average Attendance Rate: ${(report.summary?.averageAttendanceRate || 0).toFixed(1)}%`, 20, 100);
  
  let currentY = 120;
  
  // Events by Status
  if (report.events?.byStatus?.length > 0) {
    doc.setFontSize(14);
    doc.text('Events by Status', 20, currentY);
    
    autoTable(doc, {
      head: [['Status', 'Count']],
      body: report.events.byStatus.map((item: any) => [item.status || 'N/A', String(item.count || 0)]),
      startY: currentY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
    
    currentY += 60;
  }
  
  // Top Events
  if (report.participation?.topEvents?.length > 0) {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    doc.setFontSize(14);
    doc.text('Top Performing Events', 20, currentY);
    
    autoTable(doc, {
      head: [['Event', 'Attendance Rate (%)', 'Total Attendance']],
      body: report.participation.topEvents.map((item: any) => [
        item.event || 'N/A', 
        (item.attendanceRate || 0).toFixed(1), 
        String(item.totalAttendance || 0)
      ]),
      startY: currentY + 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    });
  }
  
  doc.save(`sk-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportSKReportToExcel = (report: any) => {
  const workbook = XLSX.utils.book_new();

  const summaryData = [
    ['Metric', 'Value'],
    ['Total Events', report.summary?.totalEvents || 0],
    ['Published Events', report.summary?.publishedEvents || 0],
    ['Completed Events', report.summary?.completedEvents || 0],
    ['Total Registrations', report.summary?.totalRegistrations || 0],
    ['Total Attendance', report.summary?.totalAttendance || 0],
    ['Average Attendance Rate (%)', (report.summary?.averageAttendanceRate || 0).toFixed(1)],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Events by Status
  if (report.events?.byStatus?.length > 0) {
    const statusData = report.events.byStatus.map((item: any) => ({
      Status: item.status || 'N/A',
      Count: item.count || 0
    }));
    const statusSheet = XLSX.utils.json_to_sheet(statusData);
    XLSX.utils.book_append_sheet(workbook, statusSheet, 'Events by Status');
  }

  // Events by Category
  if (report.events?.byCategory?.length > 0) {
    const categoryData = report.events.byCategory.map((item: any) => ({
      Category: item.category || 'N/A',
      Count: item.count || 0
    }));
    const categorySheet = XLSX.utils.json_to_sheet(categoryData);
    XLSX.utils.book_append_sheet(workbook, categorySheet, 'Events by Category');
  }

  // Top Events
  if (report.participation?.topEvents?.length > 0) {
    const topEventsData = report.participation.topEvents.map((item: any) => ({
      Event: item.event || 'N/A',
      'Attendance Rate (%)': (item.attendanceRate || 0).toFixed(1),
      'Total Attendance': item.totalAttendance || 0
    }));
    const topEventsSheet = XLSX.utils.json_to_sheet(topEventsData);
    XLSX.utils.book_append_sheet(workbook, topEventsSheet, 'Top Events');
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `sk-report-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Event Attendee List Export
interface EventAttendeeData {
  eventTitle: string;
  eventDate: string;
  eventCategory?: string;
  eventLocation: string;
  attendees: Array<{
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string;
    attendedAt: string;
    remarks?: string;
  }>;
}

export const exportEventAttendeesToPDF = (data: EventAttendeeData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Barangay Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BARANGAY MANAGEMENT SYSTEM', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('TheyCare Portal - SK Event Management', pageWidth / 2, 22, { align: 'center' });

  // Horizontal line
  doc.setLineWidth(0.5);
  doc.line(20, 26, pageWidth - 20, 26);

  // Document Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT ATTENDANCE LIST', pageWidth / 2, 35, { align: 'center' });

  // Event Information Section
  let currentY = 45;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Event Information:', 20, currentY);

  currentY += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  // Event Title
  doc.setFont('helvetica', 'bold');
  doc.text('Event Name:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.eventTitle, 55, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(data.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }), 55, currentY);

  if (data.eventCategory) {
    currentY += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Category:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(data.eventCategory, 55, currentY);
  }

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Location:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(data.eventLocation, 55, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Total Attendees:', 20, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text(String(data.attendees.length), 55, currentY);

  // Export timestamp
  currentY += 6;
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, currentY);
  doc.setTextColor(0);

  // Attendee Table
  currentY += 8;

  const tableData = data.attendees.map((attendee, index) => [
    String(index + 1),
    `${attendee.firstName} ${attendee.lastName}`,
    attendee.email,
    attendee.contactNumber || 'N/A',
    new Date(attendee.attendedAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  ]);

  autoTable(doc, {
    head: [['#', 'Full Name', 'Email', 'Contact Number', 'Attendance Time']],
    body: tableData,
    startY: currentY,
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 45 },
      2: { cellWidth: 50 },
      3: { cellWidth: 35 },
      4: { cellWidth: 40 }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 20, right: 20 },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || currentY + 50;
  const footerY = doc.internal.pageSize.getHeight() - 20;

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text('This is a system-generated document.', pageWidth / 2, footerY, { align: 'center' });
  doc.text('TheyCare Portal - Barangay Management System', pageWidth / 2, footerY + 4, { align: 'center' });

  // Generate filename in format: EventName_Attendees_YYYYMMDD.pdf
  const eventName = data.eventTitle.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `${eventName}_Attendees_${dateStr}.pdf`;

  doc.save(filename);
};