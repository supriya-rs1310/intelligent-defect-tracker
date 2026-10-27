import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { User, Calendar, AlertTriangle, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const MyAssignedTickets = ({ onTicketClick }) => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [stats, setStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  const tabs = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

  useEffect(() => {
    const fetchMyTickets = async () => {
      try {
        const response = await api.get('/api/tickets');
        
        // ✅ Extract array from response
        const ticketsData = response.data.content || response.data || [];
        
        // ✅ Filter by username
        const myTickets = ticketsData.filter(
          t => t.assignedToUser && t.assignedToUser.username === user?.username
        );
        
        setTickets(myTickets);
        setFilteredTickets(myTickets);
        
        setStats({
          open: myTickets.filter(t => t.status === 'OPEN').length,
          inProgress: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
          resolved: myTickets.filter(t => t.status === 'RESOLVED').length,
        });
      } catch (error) {
        console.error('Failed to fetch assigned tickets:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyTickets();
  }, [user?.id, user?.username]);  // ✅ Fixed: Only runs when user ID changes

  
  useEffect(() => {
    if (activeTab === 'ALL') {
      setFilteredTickets(tickets);
    } else {
      setFilteredTickets(tickets.filter(t => t.status === activeTab));
    }
  }, [activeTab, tickets]);

  const startWorking = async (ticketId) => {
    try {
      await api.patch(`/api/tickets/${ticketId}/status`, { status: 'IN_PROGRESS' });
      toast.success('🚀 Started working on ticket!');
      const response = await api.get('/api/tickets');
      const myTickets = response.data.filter(
        t => t.assignedToUser && t.assignedToUser.id === user?.id
      );
      setTickets(myTickets);
      setStats({
        open: myTickets.filter(t => t.status === 'OPEN').length,
        inProgress: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: myTickets.filter(t => t.status === 'RESOLVED').length,
      });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const markResolved = async (ticketId) => {
    try {
      await api.patch(`/api/tickets/${ticketId}/status`, { status: 'RESOLVED' });
      toast.success('✅ Ticket resolved!');
      const response = await api.get('/api/tickets');
      const myTickets = response.data.filter(
        t => t.assignedToUser && t.assignedToUser.id === user?.id
      );
      setTickets(myTickets);
      setStats({
        open: myTickets.filter(t => t.status === 'OPEN').length,
        inProgress: myTickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: myTickets.filter(t => t.status === 'RESOLVED').length,
      });
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'IN_PROGRESS': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'RESOLVED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'OPEN': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'RESOLVED': return <CheckCircle className="h-4 w-4 text-green-400" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>Loading your tickets...</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-2xl font-bold" style={{ color: '#ff6b6b' }}>{stats.open}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>To Do</p>
        </div>
        <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-2xl font-bold" style={{ color: '#ffd93d' }}>{stats.inProgress}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>In Progress</p>
        </div>
        <div className="p-4 rounded-xl border text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <p className="text-2xl font-bold" style={{ color: '#6bcb77' }}>{stats.resolved}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Done</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab ? 'text-white' : ''
            }`}
            style={{
              background: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'white' : 'var(--text-secondary)',
              border: activeTab === tab ? 'none' : '1px solid var(--border-color)',
            }}
          >
            {tab === 'ALL' ? 'All' : tab}
            {tab !== 'ALL' && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                {tickets.filter(t => t.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
            <User className="h-12 w-12 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
            <p>🎉 No tickets assigned to you</p>
            <p className="text-sm mt-1">Enjoy your free time! 🚀</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="p-4 rounded-xl border transition"
              style={{ 
                background: 'var(--bg-card)', 
                borderColor: 'var(--border-color)',
                borderLeft: ticket.severity === 'HIGH' ? '4px solid #ff6b6b' : 'none'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1" onClick={() => onTicketClick(ticket)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      {getStatusIcon(ticket.severity)}
                      {ticket.severity}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>#{ticket.id}</span>
                  </div>
                  <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{ticket.title}</h3>
                  <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 ml-4">
                  {ticket.status === 'OPEN' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startWorking(ticket.id);
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1"
                      style={{ background: '#ffd93d', color: '#1a1a2e' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f5c842'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#ffd93d'}
                    >
                      <PlayCircle className="h-3 w-3" />
                      Start
                    </button>
                  )}
                  
                  {ticket.status === 'IN_PROGRESS' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markResolved(ticket.id);
                      }}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1"
                      style={{ background: '#6bcb77', color: 'white' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#5abf67'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#6bcb77'}
                    >
                      <CheckCircle className="h-3 w-3" />
                      Resolve
                    </button>
                  )}
                  
                  {ticket.status === 'RESOLVED' && (
                    <span className="px-3 py-2 rounded-lg text-xs font-medium" style={{ background: 'var(--bg-secondary)', color: '#6bcb77' }}>
                      ✅ Done
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyAssignedTickets;