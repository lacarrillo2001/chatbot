
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
import EtapaInfoModal from './components/Etapa/EtapaInfoModal';
import UserMenu from './components/UserMenu/UserMenu';
import UserInfoModal from './components/UserMenu/UserInfoModal';

////Componenete

interface ChatState {
  messages: Message[];
  input: string;
  loading: boolean;
}

const modules: Module[] = [
  { id: 'diario', name: 'Mi Diario', icon: 'diary', description: 'Resumen emocional y test' },
  { id: 'chatevaluacion', name: 'Chat Evaluaciones', icon: 'chat', description: 'AI Assistant for Evaluation' },
  { id: 'emociones', name: 'Explora tus Emociones', icon: 'emotions', description: 'Reflexiona sobre tus emociones' },
  { id: 'chat', name: 'Chat Simulacione', icon: 'chat-simulation', description: 'AI Assistant' },
  { id: 'documents', name: 'Panel de administración', icon: 'admin-panel', description: 'Panel de administración simuladores' },
  

  /*{ id: 'code', name: 'Code', icon: 'code', description: 'Code Assistant' },
  { id: 'images', name: 'Images', icon: 'image', description: 'Image Generation' },
  { id: 'settings', name: 'Settings', icon: 'settings', description: 'Configuration' },*/
];


const App: React.FC = () => {
  const [chatStates, setChatStates] = useState<Record<string, ChatState>>({
    chat: { messages: [], input: '', loading: false },
    chatevaluacion: { messages: [], input: '', loading: false },
  });

  const [activeModule, setActiveModule] = useState('diario');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  //const threadId = "4d295ee4-bb27-45ac-a742-d98d14293f80";
  //const [userId, setUserId] = useState<string>("4d295ee4-bb27-45ac-a742-d98d14293f80");
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const currentState = chatStates[activeModule] || { messages: [], input: '', loading: false };
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userId, setUserId] = useState<string>(localStorage.getItem("userId") || "");
  console.log("🔐 Token cargado desde localStorage:", token);
  const [view, setView] = useState<"login" | "register" | "forgot">("login");
  const [etapaUsuario, setEtapaUsuario] = useState<string>("");
  const [showEtapaInfo, setShowEtapaInfo] = useState(false);
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [hasSentWelcome, setHasSentWelcome] = useState<Record<string, boolean>>({
  chat: false,
  chatevaluacion: false,
});


const getModulosDisponibles = (): Module[] => {
  switch (etapaUsuario) {
    case "inicio":
      return modules.filter(m => m.id === "chatevaluacion");
    case "test_completado":
      return modules.filter(m => ["chatevaluacion", "emociones"].includes(m.id));
    case "emocion_registrada":
      return modules.filter(m => ["chatevaluacion", "emociones","chat"].includes(m.id));
    case "completo":
      return modules;
    default:
      return [];
  }
};
  const handleLoginSuccess = (token: string, userId: string, tokenInfo: string) => {
  localStorage.setItem("token", token);
  localStorage.setItem("userId", userId);
  localStorage.setItem("token_info", tokenInfo);
  setToken(token);
  setUserId(userId);
};

  const handleEmocionRegistrada = () => {
  setEtapaUsuario("emocion_registrada");
  setActiveModule("chat"); // Ir directamente a Simulaciones
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
        return import.meta.env.VITE_API_EVALUACION;
      case 'chat':
      default:
        return import.meta.env.VITE_API_CHAT;
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
      console.log("📦 aiResponses:", aiResponse); 
     const aiMessage = {
        ...createMessage(aiResponse.response, 'ai'),
        is_test_question: !!aiResponse.is_test_question,
        test_type: aiResponse.test_type ?? null,
        fase: aiResponse.fase ?? null,
      };
      console.log("🧠 aiMessage.fases:", aiMessage.fase); 
      // Si el test ha finalizado, actualizar etapa
        // Si el test ha finalizado, actualizar etapa
          if (
            aiMessage.fase === "final" ||
            aiMessage.content.includes("Has terminado el test")
          ) {
            try {
              console.log("🎯 Etapa detectada por contenido del mensaje. Actualizando...");
              await fetch(`${import.meta.env.VITE_API_ETAPA}${userId}/etapa`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ nuevaEtapa: "test_completado" }),
              });
              setEtapaUsuario("test_completado");
            } catch (err) {
              console.error("❌ Error al actualizar etapa:", err);
            }
          }

        if (
          aiMessage.content.includes("Has completado la simulación")
        ) {
          try {
            console.log("🎉 Simulación finalizada. Actualizando a etapa 'completo'...");
            await fetch(`${import.meta.env.VITE_API_ETAPA}${userId}/etapa`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ nuevaEtapa: "completo" }),
            });
            setEtapaUsuario("completo");
          } catch (err) {
            console.error("❌ Error al actualizar etapa a 'completo':", err);
          }
        }


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
          onResetEmotion={() => setSelectedEmotion("")}
          //onEmocionRegistrada={handleEmocionRegistrada}
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

const fetchUserInfo = async () => {
  const tokenInfo = localStorage.getItem("token_info");
  if (!tokenInfo) return;

  try {
    const response = await fetch(`${import.meta.env.VITE_API_INFO}?token=${tokenInfo}`);
    if (!response.ok) throw new Error("No se pudo obtener la información");

    const data = await response.json();
    setUserInfo(data);
    setShowUserInfoModal(true);
  } catch (err) {
    console.error("Error al obtener la información del usuario:", err);
  }
};

  const fetchEtapaUsuario = async (userId: string) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_ETAPA}${userId}/etapa`);
    if (!response.ok) throw new Error("Error al obtener la etapa");
    const data = await response.json();
    setEtapaUsuario(data.etapa);
  } catch (error) {
    console.error("Error al obtener la etapa del usuario:", error);
  }
};
useEffect(() => {
  if (etapaUsuario) {
    setShowEtapaInfo(true); // Mostrar modal automáticamente cuando cambia la etapa
  }
}, [etapaUsuario]);


useEffect(() => {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent;
    const nuevoModulo = customEvent.detail;
    setActiveModule(nuevoModulo);
  };

  window.addEventListener('cambiarModulo', handler);
  return () => window.removeEventListener('cambiarModulo', handler);
}, []);

useEffect(() => {
  const disponibles = getModulosDisponibles();
  if (!disponibles.some(m => m.id === activeModule)) {
    setActiveModule(disponibles[0]?.id || "diario");
  }
}, [etapaUsuario]);
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
    fetchEtapaUsuario(userId)
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

                console.log("🔐 Tokens:");
console.log("token de sesión:", token);
console.log("userId:", userId);
console.log("token_info:", localStorage.getItem("token_info"));


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
             {showEtapaInfo && (
                <EtapaInfoModal etapa={etapaUsuario} onClose={() => setShowEtapaInfo(false)} />
              )}



              <Sidebar
                modules={getModulosDisponibles()}
                activeModule={activeModule}
                setActiveModule={setActiveModule}
                sidebarCollapsed={sidebarCollapsed}
                toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
              />
              <div className="main-content">
                 
                  
               <div className="user-header-container">  

      <button onClick={() => setShowEtapaInfo(true)} className="info-button">
                        ¿Qué significa esta etapa?
                      </button>
                <UserMenu
                  onLogout={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    localStorage.removeItem("token_info");
                    setToken(null);
                    setUserId("");
                  }}
                  onShowInfo={(info) => {
                    setUserInfo(info);
                    setShowUserInfoModal(true);
                  }}
                />
              </div>

                {renderModuleContent()}
                {showUserInfoModal && userInfo && (
                  <UserInfoModal
                    info={userInfo}
                    onClose={() => setShowUserInfoModal(false)}
                  />
                )}
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

