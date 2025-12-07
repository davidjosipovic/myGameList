'use client';

import { useState, useEffect } from 'react';

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; sender: 'user' | 'bot' }>>([
    { text: 'Hello! I\'m the AI assistant. How can I help you with game information?', sender: 'bot' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState('');

  // Generate session ID on mount
  useEffect(() => {
    setSessionId(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    // Add user message
    setMessages(prev => [...prev, { text: userMessage, sender: 'user' }]);
    setInputMessage('');
    
    // Add "typing" indicator
    setMessages(prev => [...prev, { text: '...', sender: 'bot' }]);

    try {
      // Call chat API with sessionId
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, sessionId }),
      });

      const data = await response.json();

      // Remove "typing" indicator and add real response
      setMessages(prev => {
        const withoutTyping = prev.slice(0, -1);
        return [...withoutTyping, { text: data.response || 'I couldn\'t process your message.', sender: 'bot' }];
      });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const withoutTyping = prev.slice(0, -1);
        return [...withoutTyping, { 
          text: 'Oops! An error occurred. Please try again.', 
          sender: 'bot' 
        }];
      });
    }
  };

  return (
    <>
      {/* Chatbot Window */}
      <div 
        className={`fixed bottom-24 left-6 bg-white rounded-2xl shadow-2xl transition-all duration-300 z-50 ${
          isOpen ? 'w-80 sm:w-96 h-[500px] opacity-100' : 'w-0 h-0 opacity-0'
        }`}
        style={{ overflow: 'hidden' }}
      >
        {isOpen && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h3 className="font-bold text-lg">AI Game Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 rounded-full p-1 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-white text-gray-800 shadow-md'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full p-2 hover:shadow-lg transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full w-14 h-14 sm:w-16 sm:h-16 shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center group z-50"
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
      >
        {isOpen ? (
          <svg className="h-7 w-7 sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-7 w-7 sm:h-8 sm:w-8" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
            />
          </svg>
        )}
        {!isOpen && (
          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chatbot
          </span>
        )}
      </button>
    </>
  );
}
