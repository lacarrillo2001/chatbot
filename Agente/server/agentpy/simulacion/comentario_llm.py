from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
import os

# Cargar las variables de entorno desde el archivo .env
load_dotenv()

def generar_comentario(puntaje, test_nombre, openai_api_key):
    try:
        # Configurar el modelo ChatGroq con la API key
        chat = ChatGroq(
            temperature=0.7,
            model_name="meta-llama/llama-4-scout-17b-16e-instruct",  # Reemplaza con el modelo disponible en tu cuenta Groq
            api_key=openai_api_key
        )

        # Construcción del prompt para generar un comentario más humano
        prompt = ChatPromptTemplate.from_messages([ 
            ("system", "Eres un asistente experto y empático que proporciona comentarios claros y comprensivos sobre los resultados psicológicos de los usuarios."),
            ("human", """
                El test '{test_nombre}' mide la ansiedad social y el miedo al rendimiento. Si el puntaje es bajo, esto indica que el usuario tiene una baja ansiedad y se siente cómodo en situaciones sociales. Si el puntaje es moderado, significa que experimenta algo de ansiedad social o al rendir en público, pero aún puede manejarlo. Si el puntaje es alto, refleja una ansiedad significativa que puede afectar su vida diaria.

                Basado en el puntaje de {puntaje}, genera un comentario comprensivo, empático y motivador que ayude al usuario a entender cómo mejorar o cómo se encuentra en relación a su ansiedad social y por rendimiento. Evita el uso de jerga técnica y utiliza un tono amable y alentador.
            """)
        ])

        # Formateo del prompt
        mensaje = prompt.format_messages(test_nombre=test_nombre, puntaje=puntaje)

         # Limitar la cantidad de tokens en la respuesta con max_tokens
        completion = chat.invoke(mensaje, max_completion_tokens=500)  # Limita la respuesta a 500 tokens

        # Ejecutar el modelo para generar el comentario response = chat.invoke(mensaje)

        return completion.content
    except Exception as e:
        print(f"Error al generar el comentario: {e}")
        return f"Hubo un error al conectar con el modelo Groq: {str(e)}"

def interpretar_resultados(puntaje_total, puntaje_rendimiento, puntaje_social,test_nombre):
    try:
        if test_nombre == "LSAS-test":
            """
            Genera una interpretación del puntaje total y los subtotales del LSAS, con un tono empático y humano.
            """
            # Clasificación del puntaje total
            if puntaje_total < 61:
                interpretacion_total = "Tu puntaje muestra que tienes una ansiedad social baja. ¡Eso es genial! Estás manejando bien las situaciones sociales y las interacciones con otras personas."
            elif 61 <= puntaje_total <= 90:
                interpretacion_total = "Tu puntaje indica una ansiedad social moderada. A veces es normal sentir nervios en situaciones sociales o frente a los demás, pero con un poco más de práctica, seguro que te sentirás más cómodo."
            else:
                interpretacion_total = "Tu puntaje sugiere una alta ansiedad social. Esto puede ser desafiante, pero es importante recordar que es completamente normal pedir ayuda y trabajar en ello. No estás solo en esto, y hay maneras de mejorar."

            # Interpretación de los subtotales
            if puntaje_rendimiento < 20:
                interpretacion_rendimiento = "En cuanto a la ansiedad por rendimiento, estás en una buena posición. No te sientes muy nervioso al tener que rendir frente a los demás."
            elif 20 <= puntaje_rendimiento <= 30:
                interpretacion_rendimiento = "A veces experimentas algo de ansiedad al tener que rendir en público, pero es algo que se puede manejar. Sigue practicando y te sentirás más confiado."
            else:
                interpretacion_rendimiento = "Parece que la ansiedad por rendimiento es algo que te afecta significativamente. No te preocupes, con el tiempo y práctica, puedes aprender a manejar estos nervios."

            if puntaje_social < 20:
                interpretacion_social = "En cuanto a la ansiedad social, te sientes cómodo en la mayoría de las interacciones sociales. ¡Eso es fantástico! Seguramente puedes seguir mejorando con experiencias sociales."
            elif 20 <= puntaje_social <= 30:
                interpretacion_social = "Tu ansiedad social es moderada, lo que significa que a veces te puede costar un poco interactuar con otros. Recuerda que está bien tomar pequeños pasos para sentirte más seguro en estas situaciones."
            else:
                interpretacion_social = "La ansiedad social es algo que te impacta considerablemente, pero es importante saber que hay recursos y apoyo para ayudarte a enfrentarlo. ¡No estás solo en esto y cada paso cuenta!"

            # Combina todas las interpretaciones con un tono humano y alentador
            interpretacion_completa = (
                f"Interpretación del puntaje total:\n{interpretacion_total}\n\n"
                f"Interpretación de la ansiedad por rendimiento (P):\n{interpretacion_rendimiento}\n\n"
                f"Interpretación de la ansiedad social (S):\n{interpretacion_social}\n\n"
                "Recuerda que lo más importante es dar pequeños pasos hacia el progreso. ¡Cada esfuerzo cuenta!"
            )
        if test_nombre == "SINP-test":
            """
            Genera una interpretación del puntaje total del test SPIN con un enfoque empático.
            """
            if puntaje_total <= 20:
                interpretacion_total = (
                    "Tu puntaje indica una ansiedad social mínima o nula. "
                    "Eso sugiere que en general te sientes cómodo en situaciones sociales. ¡Excelente!"
                )
            elif 21 <= puntaje_total <= 30:
                interpretacion_total = (
                    "Tu puntaje refleja una ansiedad social leve. "
                    "Puede que ocasionalmente te sientas incómodo en situaciones sociales, "
                    "pero es algo muy común y manejable con práctica y estrategias de confianza."
                )
            elif 31 <= puntaje_total <= 40:
                interpretacion_total = (
                    "Tu puntaje sugiere una ansiedad social moderada. "
                    "Podrías estar evitando ciertas situaciones sociales o sentirte nervioso con frecuencia. "
                    "Trabajar con ejercicios de exposición gradual o hablar con un profesional puede ayudarte a sentirte más cómodo."
                )
            elif 41 <= puntaje_total <= 50:
                interpretacion_total = (
                    "Tu puntaje indica una ansiedad social severa. "
                    "Esto puede interferir significativamente en tu vida diaria. "
                    "No estás solo, y buscar ayuda profesional puede marcar una gran diferencia en tu bienestar."
                )
            else:  # puntaje_total > 50
                interpretacion_total = (
                    "Tu puntaje refleja una ansiedad social muy severa. "
                    "Probablemente estás experimentando un alto nivel de malestar en entornos sociales. "
                    "Es muy recomendable hablar con un especialista que pueda guiarte con herramientas efectivas. "
                    "Recuerda que pedir ayuda es un acto de fortaleza, y hay apoyo disponible para ti."
                )

            interpretacion_completa = (
                f"Interpretación del puntaje total:\n{interpretacion_total}\n\n"
                "Este resultado es una oportunidad para reflexionar sobre cómo te sientes en contextos sociales. "
                "Ya sea que necesites solo un poco de práctica o apoyo profesional, cada paso que das hacia tu bienestar cuenta mucho. "
                "¡Tú puedes avanzar hacia mayor confianza y tranquilidad social!"
            )

        return interpretacion_completa

    except Exception as e:
        print(f"Error al interpretar los resultados: {e}")
        return f"Hubo un error al interpretar los resultados: {str(e)}"


