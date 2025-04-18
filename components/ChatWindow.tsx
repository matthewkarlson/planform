'use client';

import { useState, useRef, useEffect } from 'react';
import { Persona } from '@/components/PersonaChatShell';
import StageCompleteDialog from '@/components/StageCompleteDialog';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

interface ChatWindowProps {
  stageId: string;
  persona: Persona;
  onStageComplete: () => void;
}

export default function ChatWindow({ stageId, persona, onStageComplete }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStageComplete, setIsStageComplete] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load existing messages when component mounts
  useEffect(() => {
    let isMounted = true;
    const fetchExistingMessages = async () => {
      if (!stageId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/stage/message?stageId=${stageId}`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        
        // Only update state if component is still mounted
        if (isMounted && data.messages && Array.isArray(data.messages)) {
          // Convert the messages to the expected format
          const formattedMessages: Message[] = data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role === 'assistant' ? 'ai' : msg.role,
            content: msg.content || '',
          }));
          
          setMessages(formattedMessages);
          
          // If conversation has progressed enough, show stage complete option
          if (formattedMessages.length > 6) {
            setIsStageComplete(true);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching messages:', error);
          setError('Failed to load conversation history.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setInitialLoadComplete(true);
        }
      }
    };

    fetchExistingMessages();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [stageId]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (initialLoadComplete || messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, initialLoadComplete]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputValue,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/stage/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stageId,
          message: userMessage.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      // Process the streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let responseText = '';

      if (reader) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: '',
        };

        // Add empty AI message to the list
        setMessages((prev) => [...prev, aiMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          responseText += chunk;

          // Update the AI message content incrementally
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMessage.id ? { ...msg, content: responseText } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
    if (messages.length > 6) {
      setIsStageComplete(true);
    } 
  };

  // Show loading state during initial load
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <div 
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="text-xl font-semibold mb-2">Start a conversation with {persona.name}</div>
            <p className="text-gray-600 max-w-md">
              {persona.goal}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content || (
                    <div className="animate-pulse">
                      <div className="h-2 bg-gray-300 rounded w-16 mb-2"></div>
                      <div className="h-2 bg-gray-300 rounded w-24"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border-t border-red-200 p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-200 p-4 bg-white"
      >
        <div className="flex">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`Message ${persona.name}...`}
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || inputValue.trim() === ''}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </form>

      {isStageComplete && (
        <StageCompleteDialog
          personaName={persona.name}
          onContinue={onStageComplete}
        />
      )}
    </>
  );
} 