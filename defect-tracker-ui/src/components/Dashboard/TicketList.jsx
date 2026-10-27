import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { ChevronRight, User, Calendar, AlertTriangle } from 'lucide-react';

const TicketList = ({ onTicketClick }) => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  const tabs = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/api/tickets?page=0&size=10');
        const ticketData = response.data.content || response.data || [];
        setTickets(ticketData);
        setFilteredTickets(ticketData);
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
        setTickets([]);
        setFilteredTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  useEffect(() => {
    if (activeTab === 'ALL') {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter(t => t.status === activeTab));
    }
  }, [activeTab, tickets]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'IN_PROGRESS': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'RESOLVED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'HIGH') return <AlertTriangle className="h-4 w-4 text-red-400" />;
    if (severity === 'MEDIUM') return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    return <AlertTriangle className="h-4 w-4 text-green-400" />;
  };

  // ✅ Click handler - opens AI Assistant panel (read-only)
  const handleTicketClick = (ticket) => {
    console.log('🖱️ Ticket clicked:', ticket.id, ticket.title);
    if (onTicketClick) {
      onTicketClick(ticket);
    }
  };

  return (
    <div className="rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
      {/* Tabs */}
      <div className="p-4 border-b flex flex-wrap gap-2" style={{ borderColor: 'var(--border-color)' }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab ? 'text-white' : ''
            }`}
            style={{
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              border: activeTab === tab ? 'none' : '1px solid var(--border-color)',
              minWidth: '80px'
            }}
          >
            {tab === 'ALL' ? '📋 All' : tab}
            {tab !== 'ALL' && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                {tickets.filter(t => t.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Ticket List - Read Only */}
      <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
        {loading ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
            {activeTab === 'ALL' ? 'No tickets found' : `No ${activeTab} tickets`}
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => handleTicketClick(ticket)}
              className="p-6 transition cursor-pointer hover:bg-gray-800/30"
              style={{ borderColor: 'var(--border-color)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {getSeverityIcon(ticket.severity)}
                      {ticket.severity}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>#{ticket.id}</span>
                  </div>
                  <h3 className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{ticket.title}</h3>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{ticket.description}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {ticket.assignedToUser?.username || 'Unassigned'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TicketList;