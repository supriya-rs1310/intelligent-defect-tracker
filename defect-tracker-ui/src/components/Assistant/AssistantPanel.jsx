import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { X, Sparkles, Code, Loader2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const AssistantPanel = ({ isOpen, onClose, ticket }) => {
  const { user } = useAuth();
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isDeveloper = user?.role === 'DEVELOPER';

  useEffect(() => {
    setAnalysis('');
    setError('');
  }, [ticket]);

  const analyzeTicket = async () => {
    if (!ticket) return;
    
    if (!isDeveloper) {
      toast.error('Access Denied: Only developers can run AI analysis');
      return;
    }

    // ✅ Check if ticket is assigned to current user
    const isAssignedToMe = ticket?.assignedToUser?.id === user?.id;
    if (!isAssignedToMe) {
      toast.error('You are not assigned to this ticket');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysis('');

    try {
      const response = await api.get(`/api/tickets/${ticket.id}/ai-analyze`);
      
      if (response.data && response.data.aiSuggestedFix) {
        setAnalysis(response.data.aiSuggestedFix);
        toast.success('AI Analysis complete!');
      } else if (response.data && response.data.error) {
        setError(response.data.error);
        toast.error(response.data.error);
      } else {
        setError('No analysis result received');
        toast.error('No analysis result received');
      }
    } catch (err) {
      console.error('AI Analysis error:', err);
      
      let errorMsg = 'Analysis failed. Please try again.';
      
      if (err.response) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMsg = data;
        } else if (data && data.error) {
          errorMsg = data.error;
        } else if (data && data.message) {
          errorMsg = data.message;
        }
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!ticket) return;
    
    try {
      await api.patch(`/api/tickets/${ticket.id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      ticket.status = newStatus;
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast.error(error.response?.data || 'Failed to update status');
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-y-0 right-0 w-[450px] border-l shadow-2xl transform transition-transform duration-300 ease-in-out z-[9999]"
      style={{ 
        background: 'var(--bg-card)', 
        borderColor: 'var(--border-color)',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>AI Assistant</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-secondary)' }}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {ticket ? (
            <>
              <div className="mb-6">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Analyzing Ticket</p>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{ticket.title}</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>#{ticket.id} • {ticket.status}</p>
              </div>

              {ticket.codeSnippet && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    <Code className="h-4 w-4" />
                    <span>Code Snapshot</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <SyntaxHighlighter
                      language="java"
                      style={vscDarkPlus}
                      customStyle={{
                        padding: '1rem',
                        fontSize: '12px',
                        background: 'transparent',
                      }}
                    >
                      {ticket.codeSnippet}
                    </SyntaxHighlighter>
                  </div>
                </div>
              )}

              {/* ✅ AI Analysis Button - Only for assigned tickets */}
              {isDeveloper && ticket?.assignedToUser?.id === user?.id ? (
                <button
                  onClick={analyzeTicket}
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                  style={{ background: 'var(--accent)', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent)'}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Run AI Analysis
                    </>
                  )}
                </button>
              ) : (
                <div className="p-4 text-center rounded-xl border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {!isDeveloper 
                      ? '🔒 Only developers can run AI analysis' 
                      : '🔒 You are not assigned to this ticket'}
                  </p>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 rounded-xl border" style={{ background: 'rgba(255, 0, 0, 0.1)', borderColor: 'rgba(255, 0, 0, 0.2)' }}>
                  <p className="text-sm text-red-400">❌ {error}</p>
                </div>
              )}

              {analysis && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>AI Suggested Fix</h4>
                  <div className="rounded-xl p-4 border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                      {analysis}
                    </p>
                  </div>

                  {isDeveloper && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Update Status</h4>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus('OPEN')}
                          disabled={ticket.status === 'OPEN'}
                          className="px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                          style={{
                            background: ticket.status === 'OPEN' ? 'var(--accent)' : 'var(--bg-secondary)',
                            color: ticket.status === 'OPEN' ? 'white' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          OPEN
                        </button>
                        <button
                          onClick={() => updateStatus('IN_PROGRESS')}
                          disabled={ticket.status === 'IN_PROGRESS'}
                          className="px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                          style={{
                            background: ticket.status === 'IN_PROGRESS' ? 'var(--accent)' : 'var(--bg-secondary)',
                            color: ticket.status === 'IN_PROGRESS' ? 'white' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          IN PROGRESS
                        </button>
                        <button
                          onClick={() => updateStatus('RESOLVED')}
                          disabled={ticket.status === 'RESOLVED'}
                          className="px-4 py-2 rounded-lg text-sm transition disabled:opacity-50"
                          style={{
                            background: ticket.status === 'RESOLVED' ? 'var(--accent)' : 'var(--bg-secondary)',
                            color: ticket.status === 'RESOLVED' ? 'white' : 'var(--text-secondary)',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          RESOLVED
                        </button>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                        Current status: <strong>{ticket.status}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center mt-20" style={{ color: 'var(--text-muted)' }}>
              <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
              <p>Select a ticket to analyze</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssistantPanel;