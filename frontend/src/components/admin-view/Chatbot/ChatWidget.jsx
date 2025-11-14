import { useState, useRef, useEffect } from 'react';
import { X, MessageSquare, Loader } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (userMessage) => {
    const userMsg = {
      id: Date.now().toString(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to process query');
      }

      const data = await response.json();

      const botMsg = {
        id: (Date.now() + 1).toString(),
        text: data.result || 'No results found',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        text: `Error: ${err.message || 'Unable to process your query. Please try again.'}`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
          aria-label="Open chat"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
          <div className="flex items-center justify-between bg-blue-600 text-white p-4 rounded-t-lg">
            <div>
              <h3 className="font-semibold">Business Analytics</h3>
              <p className="text-xs text-blue-100">Ask any query about your orders</p>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                handleClearChat();
              }}
              className="text-white hover:bg-blue-700 p-1 rounded transition-colors"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="text-gray-500">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start by asking about your business metrics</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
                      <Loader size={16} className="animate-spin" />
                      <span className="text-sm">Processing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

            <div className="min-h-screen bg-gray-100">
      <ChatWidget />
      <div className="flex items-center justify-center min-h-screen">
        <p>Admin Dashboard - Chat widget available in bottom right</p>
      </div>
    </div>
          <div className="border-t border-gray-200 p-4 space-y-2">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="w-full text-xs text-gray-600 hover:text-gray-900 py-1 transition-colors"
              >
                Clear chat
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
