import React, { useState, useRef } from 'react';
import './index.css';
import ChatModule from './components/ChatModule';
import DocumentModule from './components/DocumentModule';
import PlaceholderModule from './components/PlaceholderModule';
import Sidebar from './components/Sidebar';
import EmotionSelection from "./components/EmotionSelection";
import EmotionReflection from "./components/EmotionReflection";

import type{ Message, Module } from './types';

interface ChatState {
  messages: Message[];
  input: string;
  loading: boolean;
}

const modules: Module[] = [
  
  { id: 'chatevaluacion', name: 'Chat Evaluaciones', icon: 'chat', description: 'AI Assistant for Evaluation' },
  { id: 'chat', name: 'Chat Simulacione', icon: 'chat', description: 'AI Assistant' },
  { id: 'documents', name: 'Panel de administración', icon: 'document', description: 'Panel de administración simuladores' },
  { id: 'emociones', name: 'Explora tus Emociones', icon: 'emotion', description: 'Reflexiona sobre tus emociones' }, // Nuevo módulo
  /*{ id: 'code', name: 'Code', icon: 'code', description: 'Code Assistant' },
  { id: 'images', name: 'Images', icon: 'image', description: 'Image Generation' },
  { id: 'settings', name: 'Settings', icon: 'settings', description: 'Configuration' },*/
];

const App: React.FC = () => {
  const [chatStates, setChatStates] = useState<Record<string, ChatState>>({
    chat: { messages: [], input: '', loading: false },
    chatevaluacion: { messages: [], input: '', loading: false },
  });

  const [activeModule, setActiveModule] = useState('chat');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const threadId = "4d295ee4-bb27-45ac-a742-d98d14293f80";
  const [userId, setUserId] = useState<string>("user123");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const currentState = chatStates[activeModule] || { messages: [], input: '', loading: false };


   const handleEmotionSelection = (emotion: string) => {
    setSelectedEmotion(emotion);  // Establecer la emoción seleccionada
    setActiveModule("emociones");  // Cambiar al módulo de emociones
  };

    const handleAnswer = (answer: string) => {
    // Aquí enviaríamos la respuesta al backend si es necesario
    console.log(`Respuesta recibida sobre ${selectedEmotion}: ${answer}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setChatStates(prev => ({
      ...prev,
      [activeModule]: {
        ...prev[activeModule],
        input: value,
      },
    }));

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const createMessage = (content: string, sender: 'user' | 'ai'): Message => ({
    id: `${Date.now()}_${Math.random()}`,
    content,
    sender,
    timestamp: new Date(),
  });

  const getApiUrl = (moduleId: string) => {
    switch (moduleId) {
      case 'chatevaluacion':
        return import.meta.env.VITE_API_EVALUACION || 'http://localhost:3003/agent';
      case 'chat':
      default:
        return import.meta.env.VITE_API_CHAT || 'http://localhost:3003/simulador/message';
    }
  };

  const sendMessage = async () => {
    const { input, loading } = currentState;
    if (!input.trim() || loading) return;

    const userMessage = createMessage(input.trim(), 'user');
    const currentInput = input.trim();

    setChatStates(prev => ({
      ...prev,
      [activeModule]: {
        ...prev[activeModule],
        messages: [...prev[activeModule].messages, userMessage],
        input: '',
        loading: true,
      },
    }));

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
     
      if (getApiUrl(activeModule)=='') {
        throw new Error('API URL is not defined');
      }
      const response = await fetch(`${getApiUrl(activeModule)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput, user_id: threadId }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const aiResponse = await response.json();
      const aiMessage = createMessage(aiResponse.response, 'ai');

      setChatStates(prev => ({
        ...prev,
        [activeModule]: {
          ...prev[activeModule],
          messages: [...prev[activeModule].messages, aiMessage],
          loading: false,
        },
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = createMessage('Sorry, I encountered an error. Please try again.', 'ai');
      setChatStates(prev => ({
        ...prev,
        [activeModule]: {
          ...prev[activeModule],
          messages: [...prev[activeModule].messages, errorMessage],
          loading: false,
        },
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderModuleContent = () => {
if (['chat', 'chatevaluacion'].includes(activeModule)) {
      return (
        <ChatModule
          messages={currentState.messages}
          input={currentState.input}
          loading={currentState.loading}
          onInputChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onSendMessage={sendMessage}
          textareaRef={textareaRef}
          selectedEmotion={selectedEmotion}  // Pasamos la emoción seleccionada al chat
        />
      );
    }

    if (activeModule === "emociones") {
      return selectedEmotion ? (
        <EmotionReflection emotion={selectedEmotion} onAnswer={handleAnswer} userId={userId} />  // Pasamos `userId`
      ) : (
        <EmotionSelection onSelectEmotion={handleEmotionSelection} />
      );
    }

    /*if (activeModule === 'chat') {
      return (
        <ChatModule
          messages={[]}
          input=""
          loading={false}
          onInputChange={() => {}}
          onKeyPress={() => {}}
          onSendMessage={() => {}}
          textareaRef={React.createRef()}
          selectedEmotion={selectedEmotion}  // Pasamos la emoción seleccionada al chat
        />
      );
    }*/
    
    if (activeModule === 'documents') {
      return <DocumentModule />;
    }

    const currentModule = modules.find(m => m.id === activeModule);
    return currentModule ? <PlaceholderModule module={currentModule} /> : null;
  };

  return (
    <div className="app">
      <Sidebar
        modules={modules}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      {renderModuleContent()}
    </div>
  );
};

export default App;
