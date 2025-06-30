import sys
import os

from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from langchain.memory import ConversationBufferMemory
from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_tools_agent, AgentExecutor
from testp.session_storage import iniciar_test, obtener_sesion,eliminar_sesion
from testp.prompts import prompt
from testp.tools import responder_test
from datetime import datetime
from db_connection import ejecutar_query, obtener_conexion_db
from testp.comentario_llm import interpretar_resultados, generar_comentario
from testp.feedback_utils import generar_feedback
# Ruta para el frontend
from flask import request, jsonify

#from server2.agentpy.db_connection import obtener_conexion_db

from simulacion.emociones import generate_analysis, guardar_resultados

from flask import Flask, request, jsonify

from dotenv import load_dotenv


from simulacion.Personalizadasimulador_social_llm import AgenteSimuladorLlm
load_dotenv()

# Configuración Flask
app = Flask(__name__)


CORS(app)

# Inicializar modelo
llm = ChatOpenAI(
    temperature=0.7,
    model="gpt-3.5-turbo",
    openai_api_key=os.getenv("OPENAI_API_KEY"),
)

# Memoria conversacional
memory = ConversationBufferMemory(
    memory_key="chat_history",
    return_messages=True
)

# Crear agente con herramienta y prompt personalizado
tools = [responder_test]
agent = create_openai_tools_agent(llm=llm, tools=tools, prompt=prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, memory=memory, verbose=True)


def guardar_resultado_test(user_id, test_id, puntaje_social, puntaje_rendimiento, interpretacion):
    puntaje_total = puntaje_social + puntaje_rendimiento
    fecha = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    interpretacion = interpretar_resultados(puntaje_total, puntaje_rendimiento, puntaje_social, test_id)

    query = """
        INSERT INTO public.resultados_test 
        (usuario_id, test_id, puntuacion_total, interpretacion, fecha, "puntaje_social(miedo )", "puntaje_rendimiento(evitacion)")
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    params = (str(user_id), test_id, puntaje_total, interpretacion, fecha, puntaje_social, puntaje_rendimiento)

    print("📤 Enviando datos al INSERT:")
    print("Query:", query)
    print("Params:", params)

    # ✅ Abrir y cerrar la conexión internamente
    ejecutar_query(query, params, tipo="insert")

    



def detectar_test_desde_mensaje(message: str) -> str:
    """
    Detecta el test que el usuario quiere iniciar a partir del mensaje.
    Devuelve 'SINP', 'LSPS', 'LSAS' o None si no se identifica.
    """
    message = message.lower()

def detectar_test(message: str) -> str | None:
    message = message.lower()

    # Verbos que indican intención de iniciar test
    verbos = ["hacer", "comenzar", "realizar", "iniciar", "tomar", "quiero", "me gustaría", "puedo"]

    if any(v in message for v in verbos):
        if "sinp" in message or "inventario" in message:
            return "SINP"
        if "lsps" in message or "liebowitz" in message or "lsas" in message:
            return "LSPS"

    return None  # No hay intención clara de hacer test


groq_apa_key = os.getenv("GROQ_API_KEY")

simulador = AgenteSimuladorLlm(groq_apa_key)

@app.route('/')
def home():
    return "Servidor Flask activo"

@app.route('/agent', methods=['POST'])
def agent_route():
    data = request.get_json()
    user_id = data.get("user_id")
    message = data.get("message")

    if not user_id or not message:
        return jsonify({"error": "Faltan datos"}), 400

    message_lower = message.lower()

    # 🔁 Continuación de un test
    session = obtener_sesion(user_id)
    # ✅ Introducción al módulo de tests psicológicos
    if "inicio" in message_lower or "ayuda" in message_lower:
        return jsonify({
            "response": (
                "👋 ¡Bienvenido/a al Módulo de Evaluación Psicológica!\n\n"
                "Aquí podrás realizar tests para identificar posibles síntomas de **ansiedad social**, de forma segura, privada y sencilla.\n"
                "🧪 Disponibles ahora:\n"
                "1. **SINP** – Inventario de Fobia Social (17 preguntas)\n"
                "2. LSPS – Escala de Fobia Social de Liebowitz (24 situaciones, evalúa miedo y evitación)\n\n"
                "✍️ Para comenzar, escribe por ejemplo:\n"
                "`Quiero hacer el test SINP`\n"
                "`Iniciar test LSPS`\n"
                "Estoy aquí para apoyarte. 💙"
            )
        })
    # 🔍 Detectar test desde el mensaj
    test_detectado = detectar_test(message)
    
    if test_detectado:
        session = iniciar_test(user_id, test_detectado)
        pregunta = session.obtener_pregunta_actual()
        print(f"📋 Pregunta inicial ({test_detectado}):", pregunta)

        if test_detectado == "SINP":
            return jsonify({
                "response": f"🧪 Has elegido el test **SINP - Inventario de Fobia Social**.\n📋 {session.instrucciones}\n\n🔹 Pregunta 1:\n**{pregunta}**\n\nResponde del 0 (En absoluto) al 4 (Extremadamente).",
                "is_test_question": True,
                "test_type": "SINP"
            })

        elif test_detectado == "LSPS":
            return jsonify({
                "response": f"🧪 Comenzamos el test **LSPS - Liebowitz Social Phobia Scale**.\n📋 {session.instrucciones}\n\n🔹 Situación 1:\n**{pregunta}**\n\n📌 ¿Qué tanto miedo sientes en esa situación? (0 a 3)",
                "is_test_question": True,
                "test_type": "LSPS",
                "fase": "miedo"
            })

    # 🔁 Continuación de un test
    session = obtener_sesion(user_id)
    if session:
        if not message.isdigit() or int(message) not in range(0, 5):
            return jsonify({"response": "⚠️ Respuesta inválida. Por favor responde con un número válido del 0 al 4."})

        respuesta = int(message)
        session.registrar_respuesta(respuesta)

        # 🔸 LSPS - esperar segunda parte (evitación)
        if session.test_id == "LSPS" and session.esperando_2da_parte():
            return jsonify({
                "response": "🙏 Gracias. Ahora dime qué tanto evitas esa situación (0 a 3).",
                "is_test_question": True,
                "test_type": "LSPS",
                "fase": "evitacion"
            })

        # 🟢 Finalización del test
        if session.finalizado():
            puntaje_total = session.puntaje_total()
            diag = session.diagnostico()

            # 🟡 Detectamos tipo de test para puntajes separados
            if session.test_id == "SINP":
                puntaje_social = puntaje_total
                puntaje_rendimiento = 0  # No aplica
            elif session.test_id == "LSPS":
                puntaje_social = session.puntaje_social()
                puntaje_rendimiento = session.puntaje_rendimiento()
            else:
                puntaje_social = puntaje_total
                puntaje_rendimiento = 0

            # ✅ GUARDAMOS en la base de datos
            try:
                if session.test_id == "SINP":
                    session.test_id = "SINP-test"  # Normalizar nombre para la base de datos
                elif session.test_id == "LSPS":
                    session.test_id = "LSAS-test"
                guardar_resultado_test(
                    user_id=user_id,
                    test_id=session.test_id,
                    puntaje_social=puntaje_social,
                    puntaje_rendimiento=puntaje_rendimiento,
                    interpretacion=''
                )

            except Exception as e:
                print("❌ Error guardando resultado:", e)

            eliminar_sesion(user_id)

            # Mensaje final empático
            consejo = {
                "mínima": "💙 Buen trabajo. Tus respuestas indican que experimentas una ansiedad social mínima o nula. ¡Sigue cuidando de ti!",
                "leve": "📘 Podrías beneficiarte de técnicas de relajación o grupos de apoyo. ¡Hablarlo ya es un paso valiente!",
                "moderada": "📗 Tus resultados indican ansiedad moderada. Considera hablar con un terapeuta que pueda apoyarte.",
                "severa": "📕 Tus respuestas reflejan ansiedad social significativa. Te recomendamos buscar orientación profesional pronto.",
                "muy severa": "🚨 Tu nivel de ansiedad social es muy elevado. No estás solo/a. Hay ayuda disponible y vale la pena buscarla."
            }

            # Detectar categoría para el consejo
            if "mínima" in diag:
                msg_final = consejo["mínima"]
            elif "leve" in diag:
                msg_final = consejo["leve"]
            elif "moderada" in diag:
                msg_final = consejo["moderada"]
            elif "severa" in diag and "muy" not in diag:
                msg_final = consejo["severa"]
            elif "muy severa" in diag:
                msg_final = consejo["muy severa"]
            else:
                msg_final = "💬 Gracias por completar el test. Recuerda que esto es solo una guía inicial."

            # Respuesta finalpuntaje_total = session.puntaje_total()
            puntaje_social = session.puntaje_social()
            puntaje_rendimiento = session.puntaje_rendimiento()

            nombre_test = "LSAS-test" if session.test_id == "LSPS" else "SINP-test"

            resumen_empatico = interpretar_resultados(
                puntaje_total,
                puntaje_rendimiento,
                puntaje_social,
                nombre_test
            )

            comentario_llm = generar_comentario(
                puntaje=session.puntaje_total(),
                test_nombre=session.test_id
            )

            print("📝 Resumen empático:", resumen_empatico)
            print("📝 Comentario LLM:", comentario_llm)

            return jsonify({
                "response": 
                    f"✅ Has terminado el test.\n\n🧮 Tu puntaje total es: {puntaje_total}\n\n{resumen_empatico}"+
                    f"🧠 Comentario personalizado:\n{comentario_llm}",
                
            })


        # 🟣 Siguiente pregunta
        pregunta = session.obtener_pregunta_actual()
        num = session.indice_actual + 1
        feedback = ["Gracias por compartirlo.", "Muy bien.", "Continuemos.", "Anotado. Gracias."]
        frase_feedback = feedback[num % len(feedback)]

        if session.test_id == "LSPS":
            return jsonify({
                "response": f"✅ {frase_feedback}\n\n🔹 Situación {num}:\n**{pregunta}**\n\n📌 ¿Qué tanto **miedo** te genera esta situación? (0 a 3)",
                "is_test_question": True,
                "test_type": "LSPS",
                "fase": "miedo"
                
            })
        elif session.test_id == "SINP":
            
            texto = generar_feedback(respuesta, pregunta, num)
            return jsonify({"response": texto,"is_test_question": True,"test_type": "SINP"})

    # 🟥 No hay sesión activa
    try:
        result = agent_executor.invoke({
            "input": message,
            "chat_history": memory.buffer  # o puedes usar `[]` si no quieres historial compartido
        })

        print("🤖 Respuesta del LLM:", result['output'])
        return jsonify({"response": "🤖 " + result['output']})

    except Exception as e:
        print("❌ Error en LLM conversacional:", e)
        return jsonify({
            "response": "🤖 Lo siento, no entendí eso. Para comenzar un test escribe:\n- `Quiero hacer el test SINP`\n- `Iniciar test LSPS`\n\nO escribe `ayuda`."
        })


@app.route('/simulador', methods=['POST'])
def endpoint_simulador():
    data = request.get_json()
    message = data.get("message", "")
    user_id = data.get("user_id")

    print(f"Received message: {message}, for user_id: {user_id}")

    if not message or not user_id:
        return jsonify({"error": "Faltan datos"}), 400

    response = simulador.interactuar(user_id, message)
    return jsonify(response)

@app.route('/emotion_responses', methods=['POST'])
def emotion_responses():  
    # Obtener los datos del cuerpo de la solicitud
    data = request.get_json()
    user_id = data.get('user_id')
    emotion = data.get('emotion')
    responses = data.get('responses')
    situation = data.get('situation') 
    body_location=data.get("body_location"),
    body_sensation=data.get("body_sensation")
    
    # Imprimir los datos en la consola para verificar
    print(f"User ID: {user_id}")
    print(f"Emotion: {emotion}")
    print(f"Responses: {responses}")
    print(f"Situation: {situation}")
    
    # Llamar a la función para guardar los resultados
    guardar_resultados(user_id, emotion, situation, responses)
    
    try:
        # Llamar a la función para generar el análisis
        analysis = generate_analysis(responses, situation)
        #print(f"Analysis: {analysis}")
        
        # Devolver la respuesta exitosa con el análisis generado
        return jsonify({
            "message": "Respuestas procesadas con éxito.",
            "analysis": analysis,  
            "status": "success"
        }), 200
    
    except Exception as e:
        # Devolver un error si algo sale mal
        return jsonify({
            "message": "Error al procesar las respuestas",
            "error": str(e),
            "status": "error"
        }), 500



if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8000)

