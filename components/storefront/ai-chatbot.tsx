// Step 6: Multi-Tenant AI Commerce Chatbot Widget
import React, { useState, useRef, useEffect } from 'react';
import { mockDb } from '../../lib/mock-db';
import { Product, CartItem } from '../../types';

interface AIChatbotProps {
  merchantId: string;
  merchantName: string;
  onAddToCart: (item: CartItem) => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  suggestions?: Product[];
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ merchantId, merchantName, onAddToCart }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: `Hello! Welcome to ${merchantName}. How can I assist you with our catalog today?`,
      timestamp: new Date()
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userMessageText = inputVal;
    setInputVal('');
    
    // Add user message
    setMessages(prev => [...prev, {
      sender: 'user',
      text: userMessageText,
      timestamp: new Date()
    }]);

    setIsTyping(true);

    // Simulate Network / LLM latency
    setTimeout(() => {
      // 1. Mandatory initial lookup filter: Get products matching merchant partition ONLY
      // 2. Perform Cosine Similarity (simulated pgvector query in mockDb)
      const vectorSearchResults = mockDb.queryVectorSimilarity(merchantId, userMessageText, 3);
      
      // Enforce operational guardrails in the system prompt simulation
      // Guardrail instructions: Exclusive representation of active tenant catalog.
      let replyText = "";
      let suggestions: Product[] = [];

      if (vectorSearchResults.length > 0) {
        suggestions = vectorSearchResults;
        const matchesList = vectorSearchResults.map(p => `• **${p.name}** ($${p.price.toFixed(2)}): ${p.description}`).join('\n\n');
        replyText = `Based on your request, I found these matches from the **${merchantName}** catalog:\n\n${matchesList}\n\nWould you like to add any of these items to your cart?`;
      } else {
        replyText = `I searched our catalog, but I couldn't find any products closely matching your request. As an assistant for **${merchantName}**, I can only recommend items from our official inventory. Is there anything else from our store I can help you find?`;
      }

      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: replyText,
        suggestions,
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition duration-300 hover:scale-105 active:scale-95 bg-teal-600 text-white"
          style={{
            background: 'var(--primary-color, #0D9488)',
            borderRadius: 'var(--border-radius, 1rem)'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          className="w-96 h-[500px] flex flex-col bg-zinc-900 border border-zinc-800 shadow-2xl overflow-hidden backdrop-blur-xl bg-opacity-95"
          style={{ borderRadius: 'var(--border-radius, 1rem)' }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 bg-teal-900/40 border-b border-zinc-850 text-white"
            style={{ borderTopLeftRadius: 'var(--border-radius, 1rem)', borderTopRightRadius: 'var(--border-radius, 1rem)' }}
          >
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <div>
                <h4 className="text-sm font-bold truncate max-w-[200px]">{merchantName} Assistant</h4>
                <p className="text-[10px] text-zinc-400">AI Semantic Guide</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-zinc-800 rounded transition text-zinc-400 hover:text-zinc-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm text-zinc-300">
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`px-3 py-2 max-w-[85%] leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-850 text-zinc-100 rounded-2xl rounded-tr-none' 
                      : 'bg-zinc-800 text-zinc-200 rounded-2xl rounded-tl-none border border-zinc-700/50'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Render dynamic vector search product recommendations */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-zinc-700/50">
                      {msg.suggestions.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-2 bg-zinc-900 rounded border border-zinc-800/80">
                          <div className="flex items-center space-x-2 truncate">
                            <img src={p.image_url} alt="" className="w-8 h-8 object-cover rounded" />
                            <div className="truncate">
                              <p className="text-xs font-semibold text-zinc-200 truncate">{p.name}</p>
                              <p className="text-[10px] text-teal-400 font-mono">${p.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => onAddToCart({
                              productId: p.id,
                              name: p.name,
                              price: p.price,
                              quantity: 1,
                              imageUrl: p.image_url
                            })}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] px-2.5 py-1.5 rounded transition font-semibold"
                            style={{ background: 'var(--primary-color, #0D9488)' }}
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-zinc-500 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-zinc-500 bg-zinc-800/40 p-3 rounded-2xl w-fit border border-zinc-750">
                <span className="text-xs">Typing semantic matches</span>
                <span className="flex space-x-1">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <form onSubmit={handleSend} className="p-3 border-t border-zinc-850 flex space-x-2 bg-zinc-950">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder={`Search products or ask a question...`}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="px-4 bg-teal-650 hover:bg-teal-600 text-white rounded-lg text-xs font-semibold transition"
              style={{ background: 'var(--primary-color, #0D9488)' }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
