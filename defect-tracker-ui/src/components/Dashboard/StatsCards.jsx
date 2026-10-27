import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

const StatsCards = () => {
  const [metrics, setMetrics] = useState({ OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/api/tickets/metrics');
        setMetrics(response.data);
      } catch (error) {
        console.error('Failed to fetch metrics');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const cards = [
    { title: 'Open Defects', value: metrics.OPEN, icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    { title: 'In Progress', value: metrics.IN_PROGRESS, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Resolved', value: metrics.RESOLVED, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="p-6 rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.title}</p>
              <p className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{loading ? '...' : card.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.color}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;