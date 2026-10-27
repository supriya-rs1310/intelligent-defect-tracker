import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Plus, Search, Filter, User, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import NewTicketModal from '../components/Tickets/NewTicketModal';
import AssistantPanel from '../components/Assistant/AssistantPanel';

const Tickets = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  
  // ✅ State for AI Assistant
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const tabs = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];

  const fetchTickets = async () => {
    try {
      const response = await api.get('/api/tickets?page=0&size=10');
      const ticketData = response.data.content || response.data || [];
      setTickets(ticketData);
      setFilteredTickets(ticketData);
    } catch (error) {
      toast.error('Failed to fetch tickets');
      setTickets([]);
      setFilteredTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTickets = useCallback(() => {
    let filtered = [...tickets];

    if (activeTab !== 'ALL') {
      filtered = filtered.filter(t => t.status === activeTab);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        t.id.toString().includes(search)
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, activeTab, searchTerm]);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    filterTickets();
  }, [filterTickets]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'OPEN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'IN_PROGRESS': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'RESOLVED': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'HIGH': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'MEDIUM': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'LOW': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  // ✅ Open AI Assistant panel with selected ticket
  const handleTicketClick = (ticket) => {
    console.log('🖱️ Ticket clicked:', ticket.id, ticket.title);
    setSelectedTicket(ticket);
    setIsAssistantOpen(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>View Tickets</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage all defect reports</p>
        </div>
        
        {/* Only TESTER can create tickets */}
        {user?.role === 'TESTER' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg flex items-center gap-2 transition"
            style={{ background: 'var(--accent)', color: 'white' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
          >
            <Plus className="h-4 w-4" />
            New Ticket
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-lg border" style={{ 
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)'
        }}>
          <Search className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search tickets by title, description, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent flex-1 focus:outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
        <button className="px-4 py-2 rounded-lg border flex items-center gap-2 transition" style={{ 
          background: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-secondary)'
        }}>
          <Filter className="h-4 w-4" />
          Filter
        </button>
      </div>

      {/* Tickets List */}
      <div className="rounded-2xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        {/* Tabs */}
        <div className="p-4 border-b flex gap-2 overflow-x-auto" style={{ borderColor: 'var(--border-color)' }}>
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                activeTab === tab ? 'text-white' : ''
              }`}
              style={{
                background: activeTab === tab ? 'var(--accent)' : 'transparent',
                color: activeTab === tab ? 'white' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {tab === 'ALL' ? 'All Tickets' : tab}
              {tab !== 'ALL' && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                  {tickets.filter(t => t.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Ticket List */}
        <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
          {loading ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center" style={{ color: 'var(--text-muted)' }}>
              {searchTerm ? 'No tickets match your search' : 'No tickets found'}
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => handleTicketClick(ticket)}
                className="p-4 transition cursor-pointer hover:bg-gray-800/30"
                style={{ borderColor: 'var(--border-color)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(ticket.severity)}`}>
                        {ticket.severity}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full border" style={{ 
                        background: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-muted)'
                      }}>
                        #{ticket.id}
                      </span>
                    </div>
                    <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>{ticket.title}</h3>
                    <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{ticket.description}</p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
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
                  <ChevronRight className="h-5 w-5 flex-shrink-0 ml-4" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      <NewTicketModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTicketCreated={fetchTickets}
      />

      {/* ✅ AI Assistant Panel */}
      <AssistantPanel 
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />
    </div>
  );
};

export default Tickets;