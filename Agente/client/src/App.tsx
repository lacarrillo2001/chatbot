
import React, { useState, useRef,useEffect } from 'react';
import './index.css';
import ChatModule from './components/ChatModule';
import DocumentModule from './components/DocumentModule';
import PlaceholderModule from './components/PlaceholderModule';
import Sidebar from './components/Sidebar';
import EmotionSelection from "./components/EmotionSelection";
import EmotionReflection from "./components/EmotionReflection";
import type{ Message, Module } from './types';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import DiarioEmocional from './components/Estadisticas/DiarioEmocional';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VerifyEmail from './components/Register/VerifyEmail';
import ResetPassword from './components/Register/ResetPassword';
import ForgotPassword from './components/Register/ForgotPassword';



interface ChatState {
  messages: Message[];
  input: string;
  loading: boolean;
}

const modules: Module[] = [
  
  { id: 'chatevaluacion', name: 'Chat Evaluaciones', icon: 'chat', description: 'AI Assistant for Evaluation' },
  { id: 'chat', name: 'Chat Simulacione', icon: 'chat-simulation', description: 'AI Assistant' },
  { id: 'documents', name: 'Panel de administración', icon: 'admin-panel', description: 'Panel de administración simuladores' },
  { id: 'emociones', name: 'Explora tus Emociones', icon: 'emotions', description: 'Reflexiona sobre tus emociones' },
  { id: 'diario', name: 'Mi Diario', icon: 'diary', description: 'Resumen emocional y test' },

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
  //const threadId = "4d295ee4-bb27-45ac-a742-d98d14293f80";
  //const [userId, setUserId] = useState<string>("4d295ee4-bb27-45ac-a742-d98d14293f80");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const currentState = chatStates[activeModule] || { messages: [], input: '', loading: false };
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userId, setUserId] = useState<string>(localStorage.getItem("userId") || "");
  const [view, setView] = useState<"login" | "register" | "forgot">("login");

  const [hasSentWelcome, setHasSentWelcome] = useState<Record<string, boolean>>({
  chat: false,
  chatevaluacion: false,
});



  const handleLoginSuccess = (token: string, userId: string) => {
    setToken(token);
    setUserId(userId);
  };


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
        return import.meta.env.VITE_API_EVALUACION || 'http://localhost:3003/api/chat/message';
      case 'chat':
      default:
        return import.meta.env.VITE_API_CHAT || 'http://localhost:3003/api/simulador/message';
    }
  };

 const sendMessage = async (overrideMessage?: string) => {
    const currentInput = overrideMessage ?? currentState.input.trim();
    if (!currentInput || currentState.loading) return;

    const userMessage = createMessage(currentInput, 'user');
   

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
        body: JSON.stringify({ message: currentInput, user_id: userId }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);


      /*const aiResponse = await response.json();
      const aiMessage = createMessage(aiResponse.response, 'ai');*/

      const aiResponse = await response.json();
     const aiMessage = {
        ...createMessage(aiResponse.response, 'ai'),
        is_test_question: !!aiResponse.is_test_question,
        test_type: aiResponse.test_type ?? null,
        fase: aiResponse.fase ?? null,
      };

      

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

  const handleTestOptionClick = (value: number) => {
    const message = value.toString();

    // Solo enviar directamente sin modificar el estado manualmente
    sendMessage(message);
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
          selectedEmotion={selectedEmotion} // No emotion selected for chat modules
          showTestOptions={activeModule === 'chatevaluacion'}
          onSendOption={handleTestOptionClick}

        />
      );
    }
    if (activeModule === "emociones") {
      return selectedEmotion ? (
        <EmotionReflection
        emotion={selectedEmotion}
        onAnswer={handleAnswer}
        userId={userId}
        onResetEmotion={() => setSelectedEmotion("")} // ← solución común
/>
// Pasamos `userId`
      ) : (
        <EmotionSelection onSelectEmotion={handleEmotionSelection} />
      );
    }
    if (activeModule === 'documents') {
      return <DocumentModule />;
    }

    if (activeModule === 'diario') {
      return <DiarioEmocional userId={userId} />;
    }


    const currentModule = modules.find(m => m.id === activeModule);
    return currentModule ? <PlaceholderModule module={currentModule} /> : null;


    
  };
useEffect(() => {
  if (userId) {
    // Reiniciar los chats al cambiar de usuario
    setChatStates({
      chat: { messages: [], input: '', loading: false },
      chatevaluacion: { messages: [], input: '', loading: false },
    });

    // También reiniciar la bienvenida
    setHasSentWelcome({
      chat: false,
      chatevaluacion: false,
    });
  }
}, [userId]);
useEffect(() => {
  const shouldSendWelcome =
    (activeModule === 'chat' || activeModule === 'chatevaluacion') &&
    !hasSentWelcome[activeModule] &&
    chatStates[activeModule]?.messages.length === 0;

  if (!shouldSendWelcome) return;

  // Marcamos que ya se va a enviar, antes de la petición
  setHasSentWelcome(prev => ({ ...prev, [activeModule]: true }));

  const sendWelcome = async () => {
    setChatStates(prev => ({
      ...prev,
      [activeModule]: {
        ...prev[activeModule],
        loading: true,
      },
    }));

    try {
      const response = await fetch(getApiUrl(activeModule), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'inicio', user_id: userId }),
      });

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
    } catch (err) {
      console.error(`Error en bienvenida (${activeModule}):`, err);
      setChatStates(prev => ({
        ...prev,
        [activeModule]: {
          ...prev[activeModule],
          loading: false,
        },
      }));
    }
  };

  sendWelcome();
}, [activeModule, hasSentWelcome, userId]);





const isPublicPath = window.location.pathname.startsWith("/verify-email") || window.location.pathname.startsWith("/reset-password");

if (!token && !isPublicPath) {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      {view === "login" ? (
        <Login 
          onLoginSuccess={handleLoginSuccess} 
          onRegisterClick={() => setView("register")} 
          onForgotClick={() => setView("forgot")}  
        />
      ) : view === "register" ? (
        <Register onLoginClick={() => setView("login")} />
      ) : (
        <ForgotPassword />
      )}
    </div>
  );
}




 return (
  <Router>
    <Routes>
     <Route path="/verify-email/:token" element={<VerifyEmail />} />
     <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="*"
        element={
          !token ? (
            <div style={{ padding: "2rem", textAlign: "center" }}>
              {view === "login" ? (
                <Login 
                  onLoginSuccess={handleLoginSuccess} 
                  onRegisterClick={() => setView("register")}
                  onForgotClick={() => setView("forgot")}  // 👈 Esto faltaba
                />
              ) : (
                <Register onLoginClick={() => setView("login")} />
              )}
            </div>
          ) : (
            <div className="app">
              <Sidebar
                modules={modules}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                sidebarCollapsed={sidebarCollapsed}
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <div className="main-content">
                <div className="logout-container">
                  <button
                    className="logout-button"
                    onClick={() => {
                      localStorage.removeItem("token");
                      localStorage.removeItem("userId");
                      setToken(null);
                      setUserId("");
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
                {renderModuleContent()}
              </div>
            </div>
          )
        }
      />
    </Routes>
  </Router>
);
};

export default App;

