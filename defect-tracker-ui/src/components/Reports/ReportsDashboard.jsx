import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement } from 'chart.js';
import { FileText, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// ✅ Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement);

const ReportsDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/api/tickets?page=0&size=100');
        const data = response.data.content || response.data || [];
        setTickets(data);
        console.log('📊 Tickets:', data);
      } catch (error) {
        console.error('Failed to fetch tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED');
  const openTickets = tickets.filter(t => t.status === 'OPEN');
  const inProgressTickets = tickets.filter(t => t.status === 'IN_PROGRESS');

  // ✅ Data for Pie Chart
  const pieData = {
    labels: ['OPEN', 'IN_PROGRESS', 'RESOLVED'],
    datasets: [
      {
        data: [openTickets.length, inProgressTickets.length, resolvedTickets.length],
        backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77'],
        borderColor: ['#ff6b6b', '#ffd93d', '#6bcb77'],
        borderWidth: 1,
      },
    ],
  };

  // ✅ Data for Bar Chart
  const barData = {
    labels: ['HIGH', 'MEDIUM', 'LOW'],
    datasets: [
      {
        label: 'Severity Count',
        data: [
          tickets.filter(t => t.severity === 'HIGH').length,
          tickets.filter(t => t.severity === 'MEDIUM').length,
          tickets.filter(t => t.severity === 'LOW').length,
        ],
        backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77'],
        borderColor: ['#ff6b6b', '#ffd93d', '#6bcb77'],
        borderWidth: 1,
      },
    ],
  };

  // ✅ Data for Line Chart
  const getLast7Days = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const lineData = {
    labels: getLast7Days(),
    datasets: [
      {
        label: 'Tickets Created',
        data: getLast7Days().map(date => 
          tickets.filter(t => t.createdAt?.split('T')[0] === date).length
        ),
        fill: false,
        borderColor: '#1a5a9a',
        backgroundColor: '#1a5a9a',
        tension: 0.1,
      },
    ],
  };

  // ✅ Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e8edf5',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#8ba0c8' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#8ba0c8' },
        grid: { color: 'rgba(255,255,255,0.05)' },
        beginAtZero: true,
      },
    },
  };

  const exportResolvedPDF = () => {
    if (resolvedTickets.length === 0) {
      alert('No resolved tickets to export!');
      return;
    }

    const doc = new jsPDF('landscape');
    doc.setFontSize(18);
    doc.text('Resolved Tickets Report', 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Resolved: ${resolvedTickets.length}`, 14, 38);

    const tableData = resolvedTickets.map(t => [
      t.id,
      t.title,
      t.severity,
      t.assignedToUser?.username || 'Unassigned',
      new Date(t.createdAt).toLocaleDateString()
    ]);

    doc.autoTable({
      startY: 45,
      head: [['ID', 'Title', 'Severity', 'Assigned To', 'Resolved On']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [26, 90, 154], textColor: [255, 255, 255] },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text('DefectTracker - AI-Powered Bug Tracking', 14, finalY);
    doc.save('resolved-tickets-report.pdf');
  };

  if (loading) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Reports Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Analytics and insights from your defect tracker</p>
        </div>
        
        <button
          onClick={exportResolvedPDF}
          className="px-4 py-2 rounded-lg flex items-center gap-2 transition"
          style={{ background: 'var(--accent)', color: 'white' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
        >
          <Download className="h-4 w-4" />
          Export Resolved (PDF)
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Total Tickets</p>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{tickets.length}</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Open</p>
          <p className="text-2xl font-bold" style={{ color: '#ff6b6b' }}>{openTickets.length}</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>In Progress</p>
          <p className="text-2xl font-bold" style={{ color: '#ffd93d' }}>{inProgressTickets.length}</p>
        </div>
        <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Resolved</p>
          <p className="text-2xl font-bold" style={{ color: '#6bcb77' }}>{resolvedTickets.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ✅ Pie Chart */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Status Distribution</h3>
          <div style={{ height: 280, width: '100%' }}>
            <Pie data={pieData} options={chartOptions} />
          </div>
        </div>

        {/* ✅ Bar Chart */}
        <div className="p-6 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Severity Distribution</h3>
          <div style={{ height: 280, width: '100%' }}>
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>

        {/* ✅ Line Chart */}
        <div className="p-6 rounded-xl border md:col-span-2" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Tickets Created (Last 7 Days)</h3>
          <div style={{ height: 280, width: '100%' }}>
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Resolved Tickets Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Resolved Tickets ({resolvedTickets.length})
          </h3>
          <FileText className="h-5 w-5" style={{ color: 'var(--text-muted)' }} />
        </div>
        {resolvedTickets.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>No resolved tickets yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--bg-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>ID</th>
                  <th className="px-4 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>Title</th>
                  <th className="px-4 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>Severity</th>
                  <th className="px-4 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>Assigned To</th>
                  <th className="px-4 py-3 text-left" style={{ color: 'var(--text-secondary)' }}>Resolved On</th>
                </tr>
              </thead>
              <tbody>
                {resolvedTickets.map((ticket, index) => (
                  <tr key={ticket.id} style={{ borderTop: index > 0 ? '1px solid var(--border-color)' : 'none' }}>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>#{ticket.id}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{ticket.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ticket.severity === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                        ticket.severity === 'MEDIUM' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-green-500/10 text-green-400'
                      }`}>
                        {ticket.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {ticket.assignedToUser?.username || 'Unassigned'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsDashboard;