import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, Bug, 
  BarChart, Menu, Plus, User, 
  SunIcon, MoonIcon 
} from 'lucide-react';
import StatsCards from '../components/Dashboard/StatsCards';
import TicketList from '../components/Dashboard/TicketList';
import AssistantPanel from '../components/Assistant/AssistantPanel';
import NewTicketModal from '../components/Tickets/NewTicketModal';
import ReportsDashboard from '../components/Reports/ReportsDashboard';
import RobotAssistant from '../components/Dashboard/RobotAssistant';
import MyAssignedTickets from '../components/Dashboard/MyAssignedTickets';
import api from '../api/axios';

const Dashboard = ({ initialTab = 'dashboard' }) => {
  const { user, logout } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [activeTab] = useState(initialTab);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ticketStats, setTicketStats] = useState({ open: 0, inProgress: 0, resolved: 0 });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/api/tickets/metrics');
        setTicketStats({
          open: response.data.OPEN || 0,
          inProgress: response.data.IN_PROGRESS || 0,
          resolved: response.data.RESOLVED || 0
        });
      } catch (error) {
        console.error('Failed to fetch metrics');
      }
    };
    fetchMetrics();
  }, []);

  const getNavigation = () => {
    const baseNav = [
      { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard', path: '/dashboard' },
      { name: 'View Tickets', icon: Bug, id: 'tickets', path: '/tickets' },
    ];
    
    if (user?.role === 'DEVELOPER') {
      baseNav.push(
        { name: 'My Assigned', icon: User, id: 'assigned', path: '/my-assigned' },
        { name: 'Reports', icon: BarChart, id: 'reports', path: '/reports' }
      );
    }
    
    return baseNav;
  };

  const navigation = getNavigation();

  const handleNavigation = (id, path) => {
    if (path) {
      window.location.href = path;
    }
  };

  // ✅ Handle ticket click - opens AI Assistant
const handleTicketClick = (ticket) => {
  console.log('🎯 DASHBOARD: Ticket clicked:', ticket.id, ticket.title);
  setSelectedTicket(ticket);
  setIsAssistantOpen(true);
};

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark-theme' : 'light-theme'}`} style={{ background: 'var(--bg-primary)' }}>
      
      {/* SIDEBAR */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} 
           style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        
        <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Bug className="h-8 w-8" style={{ color: 'var(--accent)' }} />
            <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>DefectTracker</span>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id, item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left ${
                activeTab === item.id ? 'text-white' : ''
              }`}
              style={{
                background: activeTab === item.id ? 'var(--accent)' : 'transparent',
                color: activeTab === item.id ? 'white' : 'var(--text-secondary)'
              }}
              onMouseEnter={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== item.id) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1">{item.name}</span>
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <button 
              onClick={() => setIsDark(!isDark)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {isDark ? <SunIcon className="h-5 w-5 flex-shrink-0" /> : <MoonIcon className="h-5 w-5 flex-shrink-0" />}
              <span className="flex-1">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-left"
              style={{ color: '#ff6b6b' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,0,0,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <span className="flex-1">Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:ml-64">
        
        <header className="px-6 py-4 border-b" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="lg:hidden" style={{ color: 'var(--text-secondary)' }} onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activeTab === 'dashboard' && 'STATUS AT A GLANCE'}
                  {activeTab === 'tickets' && 'VIEW TICKETS'}
                  {activeTab === 'assigned' && 'MY ASSIGNED TICKETS'}
                  {activeTab === 'reports' && 'REPORTS'}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.username} ({user?.role})</p>
              </div>
            </div>
            
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
        </header>

        <main className="p-6">
          {activeTab === 'dashboard' && (
            <>
              <div className="flex justify-center items-center py-8">
                <div className="w-[320px] h-[320px]">
                  <RobotAssistant 
                    username={user?.username || 'User'}
                    openTickets={ticketStats.open}
                    inProgressTickets={ticketStats.inProgress}
                    resolvedTickets={ticketStats.resolved}
                  />
                </div>
              </div>
              
              <div className="mt-10 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <StatsCards />
              </div>
            </>
          )}
          
          {activeTab === 'tickets' && (
            <TicketList onTicketClick={handleTicketClick} />
          )}
          
          {activeTab === 'assigned' && user?.role === 'DEVELOPER' && (
            <MyAssignedTickets 
            onTicketClick={(ticket) => {
            setSelectedTicket(ticket);
            setIsAssistantOpen(true);
            }} 
            />
          )}
          
          {activeTab === 'reports' && user?.role === 'DEVELOPER' && <ReportsDashboard />}
        </main>
      </div>

      {/* AI ASSISTANT PANEL */}
      <AssistantPanel 
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
      />

      <NewTicketModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onTicketCreated={() => window.location.reload()}
      />
    </div>
  );
};

export default Dashboard;