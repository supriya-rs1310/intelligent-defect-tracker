import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NewTicketModal = ({ isOpen, onClose, onTicketCreated }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    codeSnippet: '',
    severity: 'LOW',
    assignedToUserId: ''
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users');
        setUsers(response.data);
      } catch (error) {
        setUsers([
          { id: 1, username: 'Alice_Tester' },
          { id: 2, username: 'Bob_Dev' },
          { id: 3, username: 'testuser' },
          { id: 4, username: 'demo_user' }
        ]);
      }
    };
    if (isOpen) fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        codeSnippet: '',
        severity: 'LOW',
        assignedToUserId: ''
      });
      
      setCreatedTicket(null);
    }
  }, [isOpen]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const ticketData = {
      ...formData,
      assignedToUserId: parseInt(formData.assignedToUserId)
    };
    
    const response = await api.post('/api/tickets', ticketData);
    toast.success('Ticket created successfully!');
    
    setCreatedTicket(response.data);
    setShowSuccessPopup(true);
    
    // ✅ DELAY the refresh so popup stays visible
    setTimeout(() => {
      onTicketCreated();
    }, 6000);
    
  } catch (error) {
    toast.error(error.response?.data || 'Failed to create ticket');
  } finally {
    setLoading(false);
  }
};

  // ✅ SUCCESS POPUP - STAYS UNTIL USER CLICKS X
  const SuccessPopup = () => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div className="rounded-2xl p-8 max-w-md w-full border text-center relative"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
      >
        {/* ✅ X BUTTON - ONLY WAY TO CLOSE */}
        <button
          onClick={() => {
            setShowSuccessPopup(false);
            onClose();
          }}
          className="absolute top-4 right-4 p-1 rounded-full transition hover:bg-gray-700/50"
          style={{ color: 'var(--text-secondary)' }}
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(107, 203, 119, 0.2)' }}
          >
            <CheckCircle className="h-10 w-10" style={{ color: '#6bcb77' }} />
          </div>
        </div>
        
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
          🎉 Ticket Created Successfully!
        </h3>
        
        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Your ticket has been submitted and assigned to <strong>{createdTicket?.assignedToUser?.username}</strong>
        </p>
        
        <div className="p-4 rounded-xl border mb-4 text-left"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Ticket ID</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>#{createdTicket?.id}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Title</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{createdTicket?.title}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Status</span>
            <span className="text-sm font-medium" style={{ color: '#ff6b6b' }}>{createdTicket?.status}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Assigned To</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{createdTicket?.assignedToUser?.username}</span>
          </div>
        </div>
        
        <button
          onClick={() => {
            setShowSuccessPopup(false);
            onClose();
          }}
          className="w-full py-3 rounded-lg font-medium transition"
          style={{ background: 'var(--accent)', color: 'white' }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
        >
          View Tickets
        </button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Create Ticket Modal */}
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
        <div className="rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Create New Ticket</h2>
            <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter ticket title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Describe the bug in detail..."
                required
              />
            </div>

            {/* Code Snippet */}
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                Code Snippet
              </label>
              <textarea
                rows="5"
                value={formData.codeSnippet}
                onChange={(e) => setFormData({...formData, codeSnippet: e.target.value})}
                className="w-full px-4 py-2 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 transition"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Paste your broken code here (optional)..."
              />
            </div>

            {/* Severity & Assignee */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Severity
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="LOW">🟢 LOW</option>
                  <option value="MEDIUM">🟡 MEDIUM</option>
                  <option value="HIGH">🔴 HIGH</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
                  Assign To <span className="text-red-400">*</span>
                </label>
                <select
                  value={formData.assignedToUserId}
                  onChange={(e) => setFormData({...formData, assignedToUserId: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  required
                >
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} {u.role ? `(${u.role})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium transition disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'white' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
            >
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </form>
        </div>
      </div>

      {/* ✅ SUCCESS POPUP - WILL NOT CLOSE UNTIL YOU CLICK X */}
      {showSuccessPopup && <SuccessPopup />}
    </>
  );
};

export default NewTicketModal;