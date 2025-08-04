// /src/components/ChatModule.tsx
import React, { useEffect, useRef } from 'react';
import type { Message } from '../types';
import BotonesSeleccionTest from "./BotonesSeleccionTest"; // asegúrate de que la ruta sea correcta


interface ChatModuleProps {
  messages: Message[];
  input: string;
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onSendMessage: (mensaje?: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  selectedEmotion: string | null;  // Aseguramos que `selectedEmotion` esté definido aquí
  showTestOptions?: boolean;
  onSendOption?: (option: number) => void;
}

const ChatModule: React.FC<ChatModuleProps> = ({
  messages,
  input,
  loading,
  onInputChange,
  onKeyPress,
  onSendMessage,
  textareaRef,
  selectedEmotion,  // Recibimos la emoción seleccionada
  showTestOptions,
  onSendOption,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleOptionClick = (option: number) => {
    const message = option.toString();

    // Llama al prop para enviar el valor
    onSendOption?.(option);
  };

        const lastMessageObj = messages.length > 0 ? messages[messages.length - 1] : null;
        const lastMessage = lastMessageObj?.content || '';
        const isAIMessage = lastMessageObj?.sender === 'ai';
        

        const isTestQuestion = lastMessageObj?.is_test_question === true;
       
        const testType = lastMessageObj?.test_type;
        const fase = lastMessageObj?.fase;
        const mostrarBotonesSeleccionTest = showTestOptions && isAIMessage && !isTestQuestion && !testType;

        const etiquetas: { [key: string]: string[] } = {
            SINP: ['Ninguno', 'Leve', 'Moderado', 'Severo', 'Extremadamente'],
            LSPS_miedo: ['Ninguno', 'Leve', 'Moderado', 'Severo'],
            LSPS_evitacion: ['Nunca', 'Ocasionalmente', 'Frecuentemente', 'Casi siempre'],
          };

          let key = 'SINP';
          if (testType === 'LSPS' && fase) {
            key = `LSPS_${fase}`;
          }

          const labels = etiquetas[key] || [];
          const opciones = labels.map((_, i) => i);

  return (
    <>
      <div className="chat-container" ref={chatContainerRef}>
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p>Start a conversation with AI</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">{message.content}</div>
                <div className="message-time">{formatTime(message.timestamp)}</div>
              </div>
            ))
          )}
         
          {loading && (
            <div className="message ai loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </div>


      <div className="test-options-container">
      

          {showTestOptions && isAIMessage && isTestQuestion && (
          <div className="button-options">
            {opciones.map((num) => (
              <button
                key={num}
                className="option-button"
                onClick={() => handleOptionClick(num)}
              >
                {num} - {labels[num]}
              </button>
            ))}
          </div>
        )}

        {mostrarBotonesSeleccionTest && (
        <BotonesSeleccionTest onSelect={(mensaje) => onSendMessage(mensaje)} />
      )}
      </div>
        




      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={onInputChange}
            onKeyPress={onKeyPress}
            placeholder="Type your message..."
            disabled={loading}
            rows={1}
          />
          <button
            onClick={() => onSendMessage()}
            disabled={loading || !input.trim()}
            className="send-button"
          >
            {loading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 11-6.219-8.56" className="loading-spinner" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22,2 15,22 11,13 2,9 22,2" />
              </svg>
            )}
          </button>
        </div>
        <div className="input-hint">
          Press Enter to send, Shift+Enter for new line
        </div>
      
      </div>

  


      
    </>
  );
};

export default ChatModule;
