from flask import Flask, request, jsonify
from flask_cors import CORS  # Importar CORS
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from db_connection import obtener_conexion_db, ejecutar_query
from datetime import datetime
from dotenv import load_dotenv
import os
import uuid

# Cargar las variables de entorno desde el archivo .env
load_dotenv()


openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("Falta OPENAI_API_KEY en el entorno")
app = Flask(__name__)
CORS(app)  # Habilitar CORS en toda la aplicación
llm = ChatOpenAI(
    model="gpt-3.5-turbo",  # o "gpt-3.5-turbo" si prefieres
    temperature=0.7,
    api_key=openai_api_key
)


def generate_analysis(responses, situation):
    prompt = f"""
        El usuario ha completado un ejercicio de autoexploración emocional basado en la teoría de evaluación cognitiva (appraisal).

        Situación vivida:
        {situation}

        Respuestas del usuario:
        {responses}

        Como asistente conversacional, analiza brevemente con empatía las respuestas y ayúdalo a reflexionar sobre:

        1. ¿Qué revela esta situación sobre lo que es importante para él o ella (metas, creencias, valores)?
        2. ¿Qué percepción tiene sobre su capacidad de cambiar o adaptarse a esta situación?
        3. ¿Qué aprendizajes personales puede sacar de esta experiencia?

        Incluye sugerencias simples (no psicológicas) para comprender mejor sus emociones o afrontar la situación de forma saludable.

        Finaliza con un mensaje de apoyo y un recordatorio amable de que buscar ayuda profesional siempre es una opción válida.

        **Importante**: Devuelve la respuesta en HTML estructurado, usando etiquetas como `<h4>`, `<p>`, y `<ul>`, para que pueda mostrarse ordenadamente en un sitio web.
        """


    #print(responses)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content if hasattr(response, 'content') else str(response)

# Función para guardar los resultados en la base de datos
def guardar_resultados(user_id, emotion, situation, responses, body_location=None, body_sensation=None):
    record_id = str(uuid.uuid4())
    emocion_id = None
    fecha_respuesta = datetime.utcnow()

    try:
        if len(responses) < 6:
            print(f"❌ Error: se esperaban 6 respuestas, pero se recibieron {len(responses)}")
            return False

        # Verificar si la emoción ya existe
        query = "SELECT id FROM public.emociones WHERE emocion_identificada = %s AND usuario_id = %s"
        params = (emotion, user_id)
        emocion_existente = ejecutar_query(query, params, tipo="select")

        if not emocion_existente:
            emocion_id = str(uuid.uuid4())
            query = """
            INSERT INTO public.emociones (id, emocion_identificada, usuario_id)
            VALUES (%s, %s, %s)
            """
            params = (emocion_id, emotion, user_id)
            ejecutar_query(query, params, tipo="insert")
        else:
            emocion_id = emocion_existente[0][0]

        # Insertar respuestas y sensaciones físicas en la base
        query = """
        INSERT INTO public.situaciones_respuestas (
            id, emocion_id, descripcion_situacion, 
            respuesta_1, respuesta_2, respuesta_3, 
            respuesta_4, respuesta_5, respuesta_6, 
            fecha_respuesta, ubicacion_cuerpo, sensacion_cuerpo)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        params = (
            record_id,
            emocion_id,
            situation,
            responses[0],
            responses[1],
            responses[2],
            responses[3],
            responses[4],
            responses[5],
            fecha_respuesta,
            body_location,
            body_sensation
        )

        ejecutar_query(query, params, tipo="insert")
        print("✅ Resultados guardados correctamente.")
        return True

    except Exception as e:
        print(f"❌ Error al guardar los resultados: {str(e)}")
        return False


