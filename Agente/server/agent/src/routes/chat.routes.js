import express from "express";
import axios from "axios";
import dotenv from 'dotenv';
dotenv.config(); 

const router = express.Router();

// Memoria temporal
const conversations = new Map();

// Prueba del servidor
router.get("/test", (req, res) => {
  res.send("Hello from the chat server!");
});

// Iniciar una nueva conversación
router.post("/start", (req, res) => {
  const { user_id, user_name } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id es requerido" });

  const conversation = {
    user_id,
    user_name: user_name || `Usuario ${user_id}`,
    messages: [],
    created_at: new Date().toISOString(),
    last_activity: new Date().toISOString(),
  };

  conversations.set(user_id, conversation);
  res.json({
    message: "Conversación iniciada",
    conversation_id: user_id,
    user_name: conversation.user_name,
  });
});

// Enviar mensaje al agente
router.post("/message", async (req, res) => {
  const { message, user_id } = req.body;
  if (!message || !user_id) return res.status(400).json({ error: "message y user_id son requeridos" });

  let conversation = conversations.get(user_id);
  if (!conversation) {
    conversation = {
      user_id,
      user_name: `Usuario ${user_id}`,
      messages: [],
      created_at: new Date().toISOString(),
      last_activity: new Date().toISOString(),
    };
    conversations.set(user_id, conversation);
  }

  const userMessage = {
    role: "user",
    content: message,
    timestamp: new Date().toISOString(),
  };
  conversation.messages.push(userMessage);

  const url = process.env.API_AGENTPYTHON;
  console.log("Backend URL:", url);

  try {
    const response = await axios.post(url, {
      message: message,
      user_id: user_id,
    });

    const agentResponse = response.data;

    const agentMessage = {
      role: "assistant",
      content: agentResponse.response || agentResponse.message,
      timestamp: new Date().toISOString(),
    };
    conversation.messages.push(agentMessage);
    conversation.last_activity = new Date().toISOString();

    res.json({
      response: agentMessage.content,
      conversation_id: user_id,
      message_count: conversation.messages.length,
      timestamp: agentMessage.timestamp,
      // Campos opcionales si el agente los incluye
      is_test_question: agentResponse.is_test_question || false,
      test_type: agentResponse.test_type || null,
      fase: agentResponse.fase || null,
    });
  } catch (error) {
    conversation.messages.push({
      role: "system",
      content: "Error: No se pudo procesar el mensaje",
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Error comunicándose con el servidor Python",
      details: error.response ? error.response.data : error.message,
    });
  }
});

// Historial de conversación
router.get("/history/:user_id", (req, res) => {
  const { user_id } = req.params;
  const conversation = conversations.get(user_id);
  if (!conversation) return res.status(404).json({ error: "Conversación no encontrada" });

  res.json({
    conversation_id: user_id,
    user_name: conversation.user_name,
    messages: conversation.messages,
    created_at: conversation.created_at,
    last_activity: conversation.last_activity,
    message_count: conversation.messages.length,
  });
});

// Limpiar conversación
router.delete("/clear/:user_id", (req, res) => {
  const { user_id } = req.params;
  const conversation = conversations.get(user_id);
  if (!conversation) return res.status(404).json({ error: "Conversación no encontrada" });

  conversation.messages = [];
  conversation.last_activity = new Date().toISOString();
  res.json({ message: "Conversación limpiada", conversation_id: user_id });
});

// Ver todas las conversaciones
router.get("/conversations", (req, res) => {
  const conversationsList = Array.from(conversations.entries()).map(([id, conv]) => ({
    conversation_id: id,
    user_name: conv.user_name,
    message_count: conv.messages.length,
    created_at: conv.created_at,
    last_activity: conv.last_activity,
  }));

  res.json({
    total_conversations: conversationsList.length,
    conversations: conversationsList,
  });
});

// Endpoint legacy para compatibilidad
router.post("/legacy-agent", async (req, res) => {
  const { message, user_id } = req.body;
  if (!message || !user_id) return res.status(400).json({ error: "Faltan parámetros" });

  try {
    const response = await axios.post("https://chatbot-bbwb.onrender.com/agent", {
      message: message,
      user_id: user_id,
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "Error comunicándose con el servidor Python",
      details: error.response ? error.response.data : error.message,
    });
  }
});

export default router;
