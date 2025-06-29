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
def guardar_resultados(user_id, emotion, situation, responses):
    record_id = str(uuid.uuid4())
    emocion_id = None  # Para almacenar el ID de la emoción
    fecha_respuesta = datetime.utcnow()

   #print(f"Guardando resultados para el usuario {user_id} con emoción {emotion} y situación {situation}")
    #print(f"Respuestas: {responses}")

    try:
        # Obtener conexión a la base de datos
        connection = obtener_conexion_db()

        # Verificar si la emoción ya existe en la base de datos
        query = "SELECT id FROM public.emociones WHERE emocion_identificada = %s AND usuario_id = %s"
        params = (emotion,)
        emocion_existente = ejecutar_query(connection, query, params, tipo="select")

        if not emocion_existente:
            # Si no existe, insertamos una nueva emoción
            emocion_id = str(uuid.uuid4())  # Generar un nuevo UUID para la emoción
            query = """
            INSERT INTO public.emociones (id, emocion_identificada, usuario_id)
            VALUES (%s, %s, %s)
            """
            params = (emocion_id, emotion, user_id)
            ejecutar_query(connection, query, params, tipo="insert")
        else:
            emocion_id = emocion_existente[0][0]  # Recuperamos el ID de la emoción existente

        # Insertar los resultados de las respuestas en la tabla "situaciones_respuestas"
        query = """
        INSERT INTO public.situaciones_respuestas (
            id, emocion_id, descripcion_situacion, 
            respuesta_1, respuesta_2, respuesta_3, 
            respuesta_4, respuesta_5, respuesta_6, 
            fecha_respuesta)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
        """
        
        params = (
            record_id,  # ID generado para las respuestas
            emocion_id,  # ID de la emoción asociada
            situation,  # Descripción de la situación
            responses[0],  # Respuesta 1
            responses[1],  # Respuesta 2
            responses[2],  # Respuesta 3
            responses[3],  # Respuesta 4
            responses[4],  # Respuesta 5
            responses[5],  # Respuesta 6
            fecha_respuesta,  # Fecha de la respuesta
        )

        if len(responses) < 6:
            print(f"❌ Error: se esperaban 6 respuestas, pero se recibieron {len(responses)}")
            return False

        # Ejecutar la consulta para insertar los datos
        ejecutar_query(connection, query, params, tipo="insert")
 
        return True
    except Exception as e:
        print(f"Error al guardar los resultados: {str(e)}")
        return False

