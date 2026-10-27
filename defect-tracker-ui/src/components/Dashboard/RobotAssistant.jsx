import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChatbotAssistant } from 'chatbot-assistant-ui';
import 'chatbot-assistant-ui/dist/styles.css';

const RobotAssistant = ({ username, openTickets, inProgressTickets, resolvedTickets }) => {
  const [hasSpoken, setHasSpoken] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('normal');
  const hasInitialized = useRef(false);

  const totalTickets = openTickets + inProgressTickets + resolvedTickets;

  // ✅ Get welcome message WITHOUT setting state
  const getWelcomeMessage = useCallback(() => {
    let message = `Welcome back, ${username}! `;
    
    if (totalTickets === 0) {
      message = `🎉 Welcome back, ${username}! You have no tickets. Great job! Everything is clean and resolved. Keep up the amazing work!`;
    } else {
      message = `👋 Welcome back, ${username}! You have ${openTickets} open, ${inProgressTickets} in progress, and ${resolvedTickets} resolved. `;
      
      if (openTickets > 0) {
        message += `⚠️ You have ${openTickets} open tickets that need your attention. `;
      } else if (inProgressTickets > 0) {
        message += `🔄 You're working on ${inProgressTickets} tickets. Keep going! `;
      } else {
        message += `✅ You've resolved ${resolvedTickets} tickets. Excellent work! `;
      }
    }
    return message;
  }, [username, openTickets, inProgressTickets, resolvedTickets, totalTickets]);

  // ✅ Determine emotion based on ticket counts (without triggering re-render)
  const getInitialEmotion = useCallback(() => {
    if (openTickets > 0) return 'worried';
    if (inProgressTickets > 0) return 'thinking';
    if (totalTickets === 0) return 'happy';
    return 'normal';
  }, [openTickets, inProgressTickets, totalTickets]);

  // ✅ Auto-speak on mount (only once)
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      
      // Set initial emotion
      setCurrentEmotion(getInitialEmotion());
      
      const message = getWelcomeMessage();
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.onend = () => {
        setHasSpoken(true);
        setCurrentEmotion('normal');
      };
      
      setCurrentEmotion('talking');
      window.speechSynthesis.speak(utterance);
    }
  }, [getWelcomeMessage, getInitialEmotion]);

  // Handle click to speak again
  const handleClick = () => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const message = getWelcomeMessage();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.onend = () => {
      setCurrentEmotion('normal');
    };
    setCurrentEmotion('talking');
    window.speechSynthesis.speak(utterance);
  };

  // Emotion mapping
  const emotionMap = {
    normal: 'idle',
    happy: 'happy',
    worried: 'sad',
    thinking: 'thinking',
    talking: 'talking'
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      {/* Chatbot Assistant */}
      <div 
        className="cursor-pointer transition-transform duration-300 hover:scale-105"
        onClick={handleClick}
      >
        <ChatbotAssistant
          size={280}
          theme="dark"
          emotion={emotionMap[currentEmotion] || 'idle'}
          welcomeMessage={getWelcomeMessage()}
          onSendMessage={(msg) => console.log('Message:', msg)}
        />
      </div>
      
      {/* Speech Bubble */}
      <div 
        className="mt-4 px-6 py-3 rounded-xl border shadow-md max-w-xs text-center transition-all duration-300"
        style={{ 
          background: 'var(--bg-card)', 
          borderColor: 'var(--border-color)',
          transform: hasSpoken ? 'scale(1)' : 'scale(0.95)',
          opacity: hasSpoken ? 1 : 0.8
        }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {hasSpoken ? (
            <span>🤖 {currentEmotion === 'talking' ? 'Speaking...' : 'I have spoken!'}</span>
          ) : (
            <span>🔄 Loading robot...</span>
          )}
        </p>
        <div className="flex items-center justify-center gap-3 mt-1">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            📌 {openTickets} open
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            🚀 {resolvedTickets} resolved
          </span>
        </div>
      </div>
    </div>
  );
};

export default RobotAssistant;