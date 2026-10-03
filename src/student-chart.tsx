import React, { useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TermProgress {
  term: string;
  gpa: number;
  averageScore: number;
  classAverage?: number;
}

interface ChartProps {
  data: TermProgress[];
}

export const AcademicProgressChart: React.FC<ChartProps> = ({ data }) => {
  const [compareClassAvg, setCompareClassAvg] = React.useState<boolean>(true);

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>No term progress recorded yet.</p>
      </div>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    classAverage: d.classAverage ?? (d.term === 'Term 1' ? 78 : d.term === 'Term 2' ? 82 : 80)
  }));

  return (
    <div style={{
      background: 'var(--card-bg, #ffffff)',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid var(--border, #e2e8f0)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text, #1e293b)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-chart-line" style={{ color: '#4f46e5' }}></i> Academic Progress Across Terms
          </h4>
          <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-light, #64748b)' }}>
            Term-by-term average performance (%) and cumulative GPA scale
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setCompareClassAvg(!compareClassAvg)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 11px',
              fontSize: '12px',
              fontWeight: 600,
              borderRadius: '20px',
              border: '1px solid',
              borderColor: compareClassAvg ? '#f59e0b' : '#cbd5e1',
              background: compareClassAvg ? '#fffbebf0' : '#f8fafc',
              color: compareClassAvg ? '#b45309' : '#64748b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: compareClassAvg ? '0 1px 2px rgba(245, 158, 11, 0.15)' : 'none'
            }}
            title="Toggle Class Average Benchmark Comparison"
          >
            <i className={`fas ${compareClassAvg ? 'fa-check-circle' : 'fa-circle'}`} style={{ color: compareClassAvg ? '#d97706' : '#94a3b8' }}></i>
            <span>Compare Class Avg</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', fontWeight: 500 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#4f46e5' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4f46e5', display: 'inline-block' }}></span>
              My Score (%)
            </span>
            {compareClassAvg && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#d97706' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}></span>
                Class Avg (%)
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
              GPA (4.0)
            </span>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            <XAxis dataKey="term" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis yAxisId="left" domain={[0, 100]} stroke="#4f46e5" fontSize={12} tickLine={false} unit="%" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 4.0]} stroke="#059669" fontSize={12} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                borderColor: '#334155',
                borderRadius: '8px',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
              }}
            />
            <Line yAxisId="left" type="monotone" dataKey="averageScore" name="My Avg Score (%)" stroke="#4f46e5" strokeWidth={3} dot={{ r: 5, fill: '#4f46e5' }} activeDot={{ r: 8 }} />
            {compareClassAvg && (
              <Line yAxisId="left" type="monotone" dataKey="classAverage" name="Class Avg (%)" stroke="#f59e0b" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 7 }} />
            )}
            <Line yAxisId="right" type="monotone" dataKey="gpa" name="GPA" stroke="#059669" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 4, fill: '#059669' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

let chartRoot: Root | null = null;

export function mountAcademicProgressChart(elementId: string, data: TermProgress[]) {
  const container = document.getElementById(elementId);
  if (!container) return;
  if (!chartRoot) {
    chartRoot = createRoot(container);
  }
  chartRoot.render(<AcademicProgressChart data={data} />);
}

export function exportStudentResultsPDF(studentInfo?: any, resultsData?: any[]) {
  const windowObj = window as any;
  const statusEl = document.getElementById('exportPdfStatusMsg');
  const exportBtn = document.getElementById('exportResultsPdfBtn') as HTMLButtonElement | null;

  // 1. Inform user process has begun immediately in button and status container
  if (exportBtn) {
    exportBtn.disabled = true;
    exportBtn.style.opacity = '0.75';
    exportBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Exporting PDF...';
  }

  if (statusEl) {
    statusEl.style.display = 'flex';
    statusEl.className = 'export-pdf-status-alert alert-info';
    statusEl.innerHTML = '<i class="fas fa-spinner fa-spin" style="color: #2563eb;"></i> <span><strong>Exporting Report Card PDF...</strong> Generating formatted PDF report card.</span>';
  }

  if (typeof windowObj.showToast === 'function') {
    windowObj.showToast('Preparing PDF export... Please wait.', 'info');
  }

  setTimeout(() => {
    try {
      const student = studentInfo || windowObj.currentStudent || (typeof windowObj.getSession === 'function' ? (windowObj.getSession() || {}).user : null) || {
        name: 'Alex Johnson',
        id: 'STU001',
        class: 'Grade 10-A'
      };

      const results = resultsData || (windowObj.data && windowObj.data.results) || [
        { subject: 'Mathematics', score: 88, grade: 'A', term: 'Term 1' },
        { subject: 'English Language', score: 76, grade: 'B+', term: 'Term 1' },
        { subject: 'Basic Science', score: 92, grade: 'A', term: 'Term 1' },
        { subject: 'Computer Studies', score: 95, grade: 'A', term: 'Term 1' },
        { subject: 'Social Studies', score: 81, grade: 'A', term: 'Term 1' },
        { subject: 'Mathematics', score: 91, grade: 'A', term: 'Term 2' },
        { subject: 'English Language', score: 82, grade: 'A', term: 'Term 2' },
        { subject: 'Basic Science', score: 94, grade: 'A', term: 'Term 2' },
        { subject: 'Computer Studies', score: 98, grade: 'A', term: 'Term 2' },
        { subject: 'Mathematics', score: 85, grade: 'A', term: 'Term 3' },
        { subject: 'English Language', score: 88, grade: 'A', term: 'Term 3' },
        { subject: 'Basic Science', score: 90, grade: 'A', term: 'Term 3' },
        { subject: 'Computer Studies', score: 96, grade: 'A', term: 'Term 3' }
      ];

      const doc = new jsPDF();

      // Header Banner
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('EDUVERSE INSTITUTE', 14, 18);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('OFFICIAL ACADEMIC REPORT CARD', 135, 18);

      // Student Details Block
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 34, 182, 32, 3, 3, 'FD');

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Student: ${student.name || 'Alex Johnson'}`, 20, 44);
      doc.setFont('helvetica', 'normal');
      doc.text(`Student ID: ${student.id || student.studentId || 'STU001'}`, 20, 52);
      doc.text(`Class: ${student.class || student.assignedClass || 'Grade 10-A'}`, 20, 60);

      const curTerm = '2025/2026 First Term';
      doc.text(`Academic Session: ${curTerm}`, 115, 44);
      doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 115, 52);
      doc.text(`Status: Official Passed`, 115, 60);

      // Term Academic Performance Summary Table
      const termGroups: Record<string, { total: number; count: number }> = {};
      results.forEach((r: any) => {
        const t = r.term || 'Term 1';
        if (!termGroups[t]) termGroups[t] = { total: 0, count: 0 };
        termGroups[t].total += (parseInt(r.score, 10) || 0);
        termGroups[t].count += 1;
      });

      const termRows = Object.keys(termGroups).map((tKey) => {
        const avg = Math.round(termGroups[tKey].total / (termGroups[tKey].count || 1));
        const gpa = Math.min(4.0, Math.max(1.0, parseFloat((avg / 25).toFixed(2))));
        return [tKey, `${avg}%`, `${gpa} / 4.0`, avg >= 80 ? 'Distinction' : avg >= 60 ? 'Credit' : 'Pass'];
      });

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Academic Progress Summary Across Terms', 14, 76);

      autoTable(doc, {
        startY: 80,
        head: [['Academic Term', 'Average Score', 'GPA Scale', 'Standing']],
        body: termRows,
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
        theme: 'grid'
      });

      // Current Term Detailed Subject Breakdown Table
      const lastY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 120;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Subject Breakdown', 14, lastY);

      const subjectRows = results.map((r: any) => {
        const score = parseInt(r.score, 10) || 0;
        const grade = r.grade || (score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D');
        const remark = score >= 80 ? 'Excellent' : score >= 70 ? 'Very Good' : score >= 60 ? 'Good' : 'Satisfactory';
        return [r.subject || 'Subject', `${score}%`, grade, r.term || 'Term 1', remark];
      });

      autoTable(doc, {
        startY: lastY + 4,
        head: [['Subject Name', 'Score (%)', 'Grade', 'Term', 'Performance Remark']],
        body: subjectRows,
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
        theme: 'striped'
      });

      // Signature and Footer
      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 16 : 220;

      if (finalY < 265) {
        doc.setDrawColor(203, 213, 225);
        doc.line(20, finalY + 15, 80, finalY + 15);
        doc.line(130, finalY + 15, 190, finalY + 15);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text("Class Teacher's Signature", 20, finalY + 20);
        doc.text("Principal's Signature & Official Stamp", 130, finalY + 20);
      }

      const safeName = (student.name || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `EduVerse_Report_Card_${safeName}.pdf`;
      doc.save(filename);

      // 2. Inform user process complete and ready for download
      if (statusEl) {
        statusEl.className = 'export-pdf-status-alert alert-success';
        statusEl.innerHTML = `<i class="fas fa-check-circle" style="color: #16a34a;"></i> <span><strong>PDF Export Complete!</strong> Report card downloaded as <code>${filename}</code>.</span>`;
        setTimeout(() => {
          if (statusEl) statusEl.style.display = 'none';
        }, 6000);
      }

      if (typeof windowObj.showToast === 'function') {
        windowObj.showToast('Report card PDF ready and downloaded successfully!', 'success');
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      if (statusEl) {
        statusEl.className = 'export-pdf-status-alert alert-danger';
        statusEl.innerHTML = '<i class="fas fa-exclamation-circle" style="color: #dc2626;"></i> <span>Failed to generate PDF report card. Please try again.</span>';
      }
      if (typeof windowObj.showToast === 'function') {
        windowObj.showToast('PDF Export failed. Please try again.', 'error');
      }
    } finally {
      if (exportBtn) {
        exportBtn.disabled = false;
        exportBtn.style.opacity = '1';
        exportBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Export as PDF';
      }
    }
  }, 120);
}

/* ==========================================================================
   TEACHER DASHBOARD - RECHARTS SCORE DISTRIBUTION CHART
   ========================================================================== */

export interface SubjectDistributionData {
  subject: string;
  examName: string;
  totalStudents: number;
  classAverage: number;
  passRate: number;
  highestScore: number;
  distribution: {
    range: string;
    count: number;
    label: string;
    color: string;
  }[];
}

const SUBJECT_PERFORMANCE_DATA: Record<string, SubjectDistributionData> = {
  Mathematics: {
    subject: 'Mathematics',
    examName: '2025/2026 First Term Mid-Term Exam',
    totalStudents: 32,
    classAverage: 76.4,
    passRate: 90.6,
    highestScore: 98,
    distribution: [
      { range: '0-49%', count: 3, label: 'Needs Support (<50%)', color: '#ef4444' },
      { range: '50-59%', count: 4, label: 'Pass (50-59%)', color: '#f59e0b' },
      { range: '60-69%', count: 7, label: 'Credit (60-69%)', color: '#3b82f6' },
      { range: '70-79%', count: 9, label: 'Good (70-79%)', color: '#6366f1' },
      { range: '80-89%', count: 6, label: 'Very Good (80-89%)', color: '#8b5cf6' },
      { range: '90-100%', count: 3, label: 'Distinction (90-100%)', color: '#10b981' }
    ]
  },
  'English Language': {
    subject: 'English Language',
    examName: '2025/2026 First Term Mid-Term Exam',
    totalStudents: 32,
    classAverage: 81.2,
    passRate: 96.8,
    highestScore: 95,
    distribution: [
      { range: '0-49%', count: 1, label: 'Needs Support (<50%)', color: '#ef4444' },
      { range: '50-59%', count: 2, label: 'Pass (50-59%)', color: '#f59e0b' },
      { range: '60-69%', count: 6, label: 'Credit (60-69%)', color: '#3b82f6' },
      { range: '70-79%', count: 11, label: 'Good (70-79%)', color: '#6366f1' },
      { range: '80-89%', count: 8, label: 'Very Good (80-89%)', color: '#8b5cf6' },
      { range: '90-100%', count: 4, label: 'Distinction (90-100%)', color: '#10b981' }
    ]
  },
  'Basic Science': {
    subject: 'Basic Science',
    examName: '2025/2026 First Term Mid-Term Exam',
    totalStudents: 32,
    classAverage: 73.8,
    passRate: 87.5,
    highestScore: 94,
    distribution: [
      { range: '0-49%', count: 4, label: 'Needs Support (<50%)', color: '#ef4444' },
      { range: '50-59%', count: 5, label: 'Pass (50-59%)', color: '#f59e0b' },
      { range: '60-69%', count: 8, label: 'Credit (60-69%)', color: '#3b82f6' },
      { range: '70-79%', count: 8, label: 'Good (70-79%)', color: '#6366f1' },
      { range: '80-89%', count: 5, label: 'Very Good (80-89%)', color: '#8b5cf6' },
      { range: '90-100%', count: 2, label: 'Distinction (90-100%)', color: '#10b981' }
    ]
  },
  'Computer Studies': {
    subject: 'Computer Studies',
    examName: '2025/2026 First Term Mid-Term Exam',
    totalStudents: 32,
    classAverage: 86.5,
    passRate: 100.0,
    highestScore: 100,
    distribution: [
      { range: '0-49%', count: 0, label: 'Needs Support (<50%)', color: '#ef4444' },
      { range: '50-59%', count: 1, label: 'Pass (50-59%)', color: '#f59e0b' },
      { range: '60-69%', count: 3, label: 'Credit (60-69%)', color: '#3b82f6' },
      { range: '70-79%', count: 8, label: 'Good (70-79%)', color: '#6366f1' },
      { range: '80-89%', count: 12, label: 'Very Good (80-89%)', color: '#8b5cf6' },
      { range: '90-100%', count: 8, label: 'Distinction (90-100%)', color: '#10b981' }
    ]
  },
  Physics: {
    subject: 'Physics',
    examName: '2025/2026 First Term Mid-Term Exam',
    totalStudents: 32,
    classAverage: 71.0,
    passRate: 84.3,
    highestScore: 92,
    distribution: [
      { range: '0-49%', count: 5, label: 'Needs Support (<50%)', color: '#ef4444' },
      { range: '50-59%', count: 6, label: 'Pass (50-59%)', color: '#f59e0b' },
      { range: '60-69%', count: 9, label: 'Credit (60-69%)', color: '#3b82f6' },
      { range: '70-79%', count: 6, label: 'Good (70-79%)', color: '#6366f1' },
      { range: '80-89%', count: 4, label: 'Very Good (80-89%)', color: '#8b5cf6' },
      { range: '90-100%', count: 2, label: 'Distinction (90-100%)', color: '#10b981' }
    ]
  }
};

export const TeacherScoreDistributionChart: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  const currentData = SUBJECT_PERFORMANCE_DATA[selectedSubject] || SUBJECT_PERFORMANCE_DATA['Mathematics'];

  return (
    <div
      style={{
        background: 'var(--card-bg, #ffffff)',
        padding: '20px',
        borderRadius: '12px',
        border: '1px solid var(--border, #e2e8f0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        marginBottom: '24px'
      }}
    >
      {/* Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--text, #1e293b)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-chart-bar" style={{ color: '#2563eb' }}></i> Exam Score Distribution & Performance Trends
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: '13px', color: 'var(--text-light, #64748b)' }}>
            Distribution of student grades in <strong>{currentData.examName}</strong>
          </p>
        </div>

        {/* Subject Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="teacherSubjectChartSelect" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text, #334155)' }}>
            Select Subject:
          </label>
          <select
            id="teacherSubjectChartSelect"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '2px solid var(--border, #cbd5e1)',
              background: 'var(--card-bg, #ffffff)',
              color: 'var(--text, #1e293b)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {Object.keys(SUBJECT_PERFORMANCE_DATA).map((subj) => (
              <option key={subj} value={subj}>
                {subj}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Class Avg Score</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>{currentData.classAverage}%</div>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '12px 14px' }}>
          <span style={{ fontSize: '11px', color: '#166534', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Pass Rate</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>{currentData.passRate}%</div>
        </div>
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 14px' }}>
          <span style={{ fontSize: '11px', color: '#0369a1', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Highest Score</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>{currentData.highestScore}%</div>
        </div>
        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '10px', padding: '12px 14px' }}>
          <span style={{ fontSize: '11px', color: '#6b21a8', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>Total Examined</span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#7e22ce', marginTop: '4px' }}>{currentData.totalStudents} Students</div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData.distribution} margin={{ top: 15, right: 20, left: -10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.6} />
            <XAxis
              dataKey="range"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              label={{ value: 'Score Range Bracket (%)', position: 'insideBottom', offset: -15, fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              allowDecimals={false}
              label={{ value: 'Student Count', angle: -90, position: 'insideLeft', offset: 15, fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  const percent = ((data.count / currentData.totalStudents) * 100).toFixed(1);
                  return (
                    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#ffffff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
                      <p style={{ margin: 0, fontWeight: 700, color: data.color }}>{data.label}</p>
                      <p style={{ margin: '4px 0 0', color: '#e2e8f0' }}>
                        Students: <strong>{data.count}</strong> ({percent}% of class)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
              {currentData.distribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Actionable Trend Callout */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#334155' }}>
        <i className="fas fa-lightbulb" style={{ color: '#eab308', fontSize: '16px', flexShrink: 0 }}></i>
        <div>
          <strong>Class Trend Analysis for {selectedSubject}:</strong> {currentData.passRate >= 90 ? 'Outstanding class mastery!' : 'Solid performance.'}{' '}
          {currentData.distribution[0].count > 0 ? (
            <span>
              <span style={{ color: '#dc2626', fontWeight: 600 }}>{currentData.distribution[0].count} student(s)</span> scored below 50% and are recommended for targeted after-school tutoring.
            </span>
          ) : (
            <span>All students passed the 50% benchmark!</span>
          )}
        </div>
      </div>
    </div>
  );
};

let teacherChartRoot: Root | null = null;

export function mountTeacherScoreDistributionChart(elementId: string) {
  const container = document.getElementById(elementId);
  if (!container) return;
  if (!teacherChartRoot) {
    teacherChartRoot = createRoot(container);
  }
  teacherChartRoot.render(<TeacherScoreDistributionChart />);
}

/* ==========================================================================
   STUDENT MONTHLY ATTENDANCE TREND CHART COMPONENT
   ========================================================================== */

export interface AttendanceTrendPoint {
  month: string;
  rate: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
}

export const StudentAttendanceTrendChart: React.FC<{ studentId?: string }> = () => {
  const [selectedTerm, setSelectedTerm] = useState('Term 1 (2025-2026)');
  const [updateNonce, setUpdateNonce] = useState(0);

  React.useEffect(() => {
    const handleUpdate = () => {
      setUpdateNonce((prev) => prev + 1);
    };
    window.addEventListener('attendanceDataUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('attendanceDataUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Compute live attendance trend points from (window as any).data.attendance
  const computeLiveTrends = (): Record<string, AttendanceTrendPoint[]> => {
    const windowObj = window as any;
    const baseList: any[] = (windowObj.data && Array.isArray(windowObj.data.attendance)) ? windowObj.data.attendance : [];

    // Grouping by Month Key (e.g., 'Oct 2026')
    const monthStats: Record<string, { present: number; absent: number; late: number; total: number }> = {
      'Sep 2025': { present: 20, absent: 1, late: 1, total: 22 },
      'Oct 2025': { present: 19, absent: 2, late: 0, total: 21 },
      'Nov 2025': { present: 18, absent: 3, late: 1, total: 22 },
      'Dec 2025': { present: 14, absent: 1, late: 0, total: 15 },
      'Jan 2026': { present: 13, absent: 5, late: 2, total: 20 },
      'Feb 2026': { present: 17, absent: 2, late: 1, total: 20 },
      'Mar 2026': { present: 19, absent: 1, late: 1, total: 21 },
    };

    baseList.forEach((item: any) => {
      if (!item || !item.date) return;
      const d = new Date(item.date);
      if (isNaN(d.getTime())) return;
      const monthKey = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthStats[monthKey]) {
        monthStats[monthKey] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      monthStats[monthKey].total += 1;
      const st = (item.status || '').toLowerCase();
      if (st === 'present') monthStats[monthKey].present += 1;
      else if (st === 'late') monthStats[monthKey].late += 1;
      else if (st === 'absent') monthStats[monthKey].absent += 1;
      else monthStats[monthKey].present += 1;
    });

    const term1Points: AttendanceTrendPoint[] = Object.keys(monthStats).map((mKey) => {
      const stats = monthStats[mKey];
      const tot = stats.total || 1;
      const rate = Math.round(((stats.present + stats.late * 0.5) / tot) * 100);
      return {
        month: mKey,
        rate: Math.min(100, Math.max(0, rate)),
        presentDays: stats.present,
        absentDays: stats.absent,
        lateDays: stats.late
      };
    });

    return {
      'Term 1 (2025-2026)': term1Points,
      'Term 2 (2025-2026)': [
        { month: 'Apr 2026', rate: 96, presentDays: 21, absentDays: 1, lateDays: 0 },
        { month: 'May 2026', rate: 90, presentDays: 18, absentDays: 2, lateDays: 0 },
        { month: 'Jun 2026', rate: 94, presentDays: 16, absentDays: 1, lateDays: 0 },
      ]
    };
  };

  const monthlyTrends = computeLiveTrends();
  const currentData = monthlyTrends[selectedTerm] || monthlyTrends['Term 1 (2025-2026)'];
  const avgRate = currentData.length ? Math.round(currentData.reduce((acc, curr) => acc + curr.rate, 0) / currentData.length) : 100;
  const lowestMonth = currentData.length ? [...currentData].sort((a, b) => a.rate - b.rate)[0] : { month: 'Current', rate: 100 };

  return (
    <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
      {/* Header with Term selector */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-chart-line" style={{ color: '#2563eb' }}></i>
            Monthly Attendance Trend Analysis
          </h3>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#64748b' }}>
            Visualizing student attendance percentages throughout the academic term
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            style={{
              padding: '6px 12px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#1e293b',
              cursor: 'pointer'
            }}
          >
            <option value="Term 1 (2025-2026)">Term 1 (2025-2026)</option>
            <option value="Term 2 (2025-2026)">Term 2 (2025-2026)</option>
          </select>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Term Average</span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{avgRate}%</div>
        </div>
        <div style={{ background: lowestMonth.rate < 75 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${lowestMonth.rate < 75 ? '#fecaca' : '#bbf7d0'}`, borderRadius: '8px', padding: '10px 14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: lowestMonth.rate < 75 ? '#991b1b' : '#166534', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Lowest Month</span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: lowestMonth.rate < 75 ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
            {lowestMonth.month.split(' ')[0]} ({lowestMonth.rate}%)
          </div>
        </div>
        <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '10px 14px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#6b21a8', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Academic Threshold</span>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#7e22ce', marginTop: '2px' }}>75% Minimum</div>
        </div>
      </div>

      {/* Recharts Line Chart */}
      <div style={{ width: '100%', height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData} margin={{ top: 15, right: 20, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.7} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} domain={[0, 100]} unit="%" />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as AttendanceTrendPoint;
                  return (
                    <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '10px 14px', color: '#ffffff', fontSize: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)' }}>
                      <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#60a5fa' }}>{data.month}</p>
                      <p style={{ margin: '2px 0', color: '#e2e8f0' }}>
                        Attendance Rate: <strong style={{ color: data.rate < 75 ? '#f87171' : '#4ade80' }}>{data.rate}%</strong>
                      </p>
                      <p style={{ margin: '2px 0', color: '#94a3b8' }}>
                        Present: {data.presentDays}d | Absent: {data.absentDays}d | Late: {data.lateDays}d
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '75% Threshold', fill: '#dc2626', fontSize: 11, position: 'top' }} />
            <Line
              type="monotone"
              dataKey="rate"
              name="Attendance Rate (%)"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 5, fill: '#2563eb', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 8, fill: '#1d4ed8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

let attendanceChartRoot: Root | null = null;

export function mountStudentAttendanceTrendChart(elementId: string, studentId?: string) {
  const container = document.getElementById(elementId);
  if (!container) return;
  if (!attendanceChartRoot) {
    attendanceChartRoot = createRoot(container);
  }
  attendanceChartRoot.render(<StudentAttendanceTrendChart studentId={studentId} />);
}

if (typeof window !== 'undefined') {
  (window as any).mountAcademicProgressChart = mountAcademicProgressChart;
  (window as any).exportStudentResultsPDF = exportStudentResultsPDF;
  (window as any).mountTeacherScoreDistributionChart = mountTeacherScoreDistributionChart;
  (window as any).mountStudentAttendanceTrendChart = mountStudentAttendanceTrendChart;
}


