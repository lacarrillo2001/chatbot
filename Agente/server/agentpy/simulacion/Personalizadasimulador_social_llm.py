import json
from db_connection import obtener_conexion_db, ejecutar_query
from mongo_connection import MongoDBManager 
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
import re
import json

mongo_manager = MongoDBManager()

load_dotenv()

class AgenteSimuladorLlm:
    def __init__(self, api_key):
        self.simulaciones = mongo_manager.obtener_simulaciones()
        self.estado_usuario = {}
        self.chat = ChatGroq(
            temperature=0.7,
            model_name="meta-llama/llama-4-scout-17b-16e-instruct",
            api_key=api_key
        )
        

    def cargar_simulaciones(self, ruta):
        with open(ruta, encoding="utf-8") as f:
            return json.load(f)

    def interactuar(self, user_id, mensaje):
        estado = self.estado_usuario.get(user_id, {"estado": "inicio"})
        print(f"Estado actual del usuario {user_id}: {estado}")
        
        puntaje = estado.get("puntaje", 0)
        print(f"Puntaje actual del usuario {user_id}: {puntaje}")
        
        # Rango de simulaciones según el puntaje
        if puntaje > 95:
            rango_simulaciones = [sim for sim in self.simulaciones if sim["id"] == "sim-004"]
        elif 80 <= puntaje <= 95:
            rango_simulaciones = [sim for sim in self.simulaciones if sim["id"] == "sim-003"]
        elif 65 <= puntaje < 80:
            rango_simulaciones = [sim for sim in self.simulaciones if sim["id"] == "sim-002"]
        elif 55 <= puntaje < 65:
            rango_simulaciones = [sim for sim in self.simulaciones if sim["id"] == "sim-001"]
        else:
            rango_simulaciones = []

        if estado["estado"] == "inicio":
            opciones = [
                "1. Simulación personalizada (elige una situación)"
            ]
            print(f"El usuario {user_id} está en estado de inicio, opciones disponibles: {opciones}")
            
            self.estado_usuario[user_id] = {
                "estado": "esperando_tipo_simulacion",
                "datos": {}
            }
            
            mensaje_bienvenida = (
                "👋 ¡Bienvenido/a al módulo de simulación social!\n\n"
                "Este espacio ha sido diseñado para ayudarte a practicar situaciones sociales y reflexionar sobre tus emociones.\n"
                "Elige cómo deseas comenzar:\n"
            )
            
            return {
                "response": mensaje_bienvenida + "\n".join(opciones),
                "status": "awaiting_input"
            }


        elif estado["estado"] == "esperando_tipo_simulacion":
            print(f"El usuario {user_id} ha elegido el tipo de simulación: {mensaje.strip()}")
            
            # Si el usuario elige la simulación estable
            if mensaje.strip() == "0":
                if not rango_simulaciones:
                    return {"response": "❌ No hay simulaciones disponibles para tu puntaje actual.", "status": "awaiting_input"}

                opciones = [f"{i+1}. {sim['titulo']}" for i, sim in enumerate(rango_simulaciones)]
                self.estado_usuario[user_id] = {
                    "estado": "esperando_seleccion",
                    "datos": {}
                }
                return {
                    "response": "🧠 **Simulaciones sociales disponibles:**\n" + "\n".join(opciones)
                    + "\n\nEste es tu puntaje en el test de ansiedad social: " + str(puntaje) +
                    "\n\nSelecciona el número de la simulación que deseas practicar.",
                    "status": "awaiting_input"
                }

            # Si el usuario elige la simulación personalizada
            elif mensaje.strip() == "1":
                print(f"El usuario {user_id} ha elegido la simulación personalizada.")
                return self._seleccionar_simulacion_personalizada(user_id)

            else:
                return {"response": "❌ Opción no válida. Elige 1 para simulación personalizada.", "status": "awaiting_input"}

       
        elif estado["estado"] == "esperando_seleccion_situacion":
            print(f"Procesando selección de situación personalizada: {mensaje}")
            return self._procesar_seleccion_situacion(user_id, mensaje)
        
        elif estado["estado"] == "procesando_simulacion_personalizada":
            if mensaje.lower().strip() in ["sí", "si", "yes", "y"]:
                # Implementar carga de simulación existente
                situacion = estado["datos"]["situacion"]
                return self._cargar_simulacion_existente(user_id, situacion)
            else:
                situacion = estado["datos"]["situacion"]
                return self._crear_simulacion_interactiva_con_ia(user_id, situacion)
        elif estado["estado"] == "esperando_respuesta_paso":
            return self._procesar_respuesta(user_id, mensaje)
        # ⬆️ Este es el que falta
        else:
            return {
                "response": "❌ No se pudo procesar tu mensaje. Intenta nuevamente.",
                "status": "error"
            }
        

    def obtener_situaciones_usuario(self, user_id):
        print(f"Recuperando situaciones para el usuario {user_id}")
        query = """
         SELECT
            u.id AS usuario_id,
            u.seudonimo,
            e.id AS emocion_id,
            e.emocion_identificada,
            e.descripcion AS descripcion_emocion,
            sr.id AS situacion_id,
            sr.descripcion_situacion,
            sr.respuesta_1,
            sr.respuesta_2,
            sr.respuesta_3,
            sr.respuesta_4,
            sr.fecha_respuesta
        FROM
            public.usuarios u
        JOIN public.emociones e ON u.id = e.usuario_id
        JOIN public.situaciones_respuestas sr ON e.id = sr.emocion_id
        WHERE
            u.id = %s;
        """
        try:
            # Ejecutar la consulta para obtener las situaciones asociadas al usuario
            resultados = ejecutar_query(query, (user_id,), tipo="select")

            if resultados:
                print(f"SITUACIONES ENCONTRADAS: {resultados}")
                return resultados
            else:
                return []  # No se encontraron situaciones para el usuario
        except Exception as e:
            print(f"Error al obtener las situaciones del usuario: {e}")
            return []


    def _seleccionar_simulacion_personalizada(self, user_id):
        # Obtener las situaciones personalizadas asociadas al usuario
        print(f"Obteniendo situaciones personalizadas para el usuario {user_id}...")
        situaciones = self.obtener_situaciones_usuario(user_id)
        print(f"Situaciones obtenidas: {situaciones}")
        # Si no hay situaciones personalizadas, informar al usuario
        
        if not situaciones:
            return {"response": "❌ No tienes situaciones personalizadas guardadas.", "status": "awaiting_input"}

        # Crear un listado de opciones para que el usuario elija
        opciones = []
        for i, situacion in enumerate(situaciones):
            opciones.append(f"{i+1}. {situacion[7]}")  # Mostrar la descripción de la situación
        
        # Guardar el estado en espera de la selección
        self.estado_usuario[user_id] = {
            "estado": "esperando_seleccion_situacion",  # Estado esperando la selección
            "datos": {}
        }

        # Devolver la respuesta con las opciones
        return {
            "response": "🧠 **Situaciones personalizadas disponibles:**\n" + "\n".join(opciones) +
                        "\n\nSelecciona el número de la situación que deseas simular.",
            "status": "awaiting_input"
        }

    def _procesar_seleccion_situacion(self, user_id, mensaje):
        # Verifica que el mensaje sea una opción válida
        try:
            situacion_id = int(mensaje.strip()) - 1  # El índice de la situación seleccionada
            situaciones = self.obtener_situaciones_usuario(user_id)
            
            if situacion_id < 0 or situacion_id >= len(situaciones):
                return {"response": "❌ Selección inválida. Elige un número de situación válido.", "status": "awaiting_input"}

            situacion = situaciones[situacion_id][7]  # Descripción de la situación seleccionada

            # Llamar a la función que genera la simulación interactiva
            return self.crear_simulacion_interactiva(user_id, situacion)

        except ValueError:
            return {"response": "❌ Entrada inválida. Por favor selecciona un número de situación.", "status": "awaiting_input"}

    def crear_simulacion_interactiva(self, user_id, situacion):
        print(f"Creando simulación interactiva para el usuario {user_id} con la situación: {situacion}.")
        
        # Verificamos si ya existe una simulación para esta situación
        simulacion_existente = self._verificar_simulacion_existente(user_id, situacion)
        if simulacion_existente:
            print(f"Simulación existente encontrada para la situación '{situacion}'.")
            return {
                "response": f"🧠 **Ya has creado una simulación para esta situación anteriormente.** ¿Quieres probarla nuevamente?",
                "status": "awaiting_input"
            }

        # Si la simulación no existe, seguimos con la creación
        print("No existe simulación previa, continuando con la creación.")

        # Mensaje de inicio para el usuario
        mensaje_creando = "🧠 **Se está creando la simulación para la situación seleccionada...** Esto tomará un momento."
        
        # Enviar este mensaje de creación al usuario
        self.estado_usuario[user_id] = {
            "estado": "creando_simulacion",
            "datos": {"situacion": situacion}
        }
        
        print(f"Mensaje de creación enviado al usuario {user_id}: {mensaje_creando}")

        # Crear el prompt para la IA basado en la situación proporcionada
        prompt = f"""
            Eres un asistente empático. El usuario ha descrito la siguiente situación: {situacion}.
            Crea una simulación paso a paso para ayudar al usuario a reflexionar sobre su situación.
            Cada paso debe tener:
            1. Una breve descripción de la situación.
            2. Al menos 3 opciones de respuesta, numeradas y detalladas.
            3. Asegúrate de que las opciones sean claras y ofrezcan alternativas válidas que permitan al usuario reflexionar sobre posibles soluciones o decisiones.
            
            Ejemplo de simulación:

            **Paso 1:**
            Situación: Te encuentras en una reunión de trabajo. Todos los ojos están sobre ti. Te sientes nervioso y tus manos comienzan a sudar. El jefe te pide que presentes el informe que preparaste.
            Opciones:
            1. Respirar profundamente y calmarme antes de hablar.
            2. Mirar al jefe directamente y comenzar a hablar sin detenerme.
            3. Pedir una pequeña pausa para tomar agua y recomponerme.

            **Paso 2:**
            Situación: Has comenzado a hablar, pero de repente te quedas en blanco. La ansiedad te hace sentir que todos te están observando.
            Opciones:
            1. Continuar hablando aunque sea difícil, porque sabes que el informe es importante.
            2. Hacer una pausa y pedir un momento para reflexionar.
            3. Pedir a otro compañero que continúe la presentación por un momento mientras tomas un respiro.

            **Paso 3:**
            Situación: La reunión continúa y ya no sientes tanta ansiedad. Te das cuenta de que la gente está prestando atención a lo que estás diciendo.
            Opciones:
            1. Aprovechar la oportunidad para expresar ideas adicionales que no habías planeado.
            2. Seguir con el plan original sin desviarme.
            3. Hacer una breve pausa para asegurarme de que todos me han entendido.
            
            ---
            Asegúrate de que la simulación que generes tenga varios pasos, con descripciones y opciones de respuesta similares a este ejemplo. La simulación debe ser interactiva y ayudar al usuario a reflexionar sobre su situación, tomando decisiones que los guíen a través de diferentes escenarios.
        """
        
        try:
            print("Se está creando la simulación para la situación elegida.")
            respuesta = self.chat.invoke([
                ("system", "Eres un asistente empático que ayuda a las personas a reflexionar sobre sus emociones."),
                ("human", prompt)
            ])

            # Procesar la respuesta de la IA y generar los escenarios
            simulacion_generada = respuesta.content.strip()
            escenarios = self._generar_escenarios_desde_ia(simulacion_generada)
            
            if not escenarios:
                return {
                    "response": "❌ No se pudieron generar pasos válidos para esta situación. Intenta con otra descripción o más detalles.",
                    "status": "awaiting_input"
                }
            # Crear la simulación en formato estructurado (como un objeto JSON)
            simulacion = {
                "id": str(uuid.uuid4()),  # ID único para la simulación
                "titulo": f"Simulación: {situacion[:30]}...",  # Título corto para mostrar al usuario
                "descripcion": f"Simulación personalizada generada para la situación: {situacion}",
                "escenarios": escenarios,  # Los pasos generados por la IA
                "usuario_id": user_id , # Añadir el ID del usuario
                "fecha_creacion": str(datetime.now())  # Fecha de creación
            }

            # Convertir la simulación a formato JSON (como un objeto, no un archivo)
            simulacion_json = json.dumps(simulacion, indent=4)
            
            # Mostrar el JSON para depuración, puedes eliminar esta línea en producción
            print("Simulación personalizada generada con éxito.")
            print(f"Simulación generada: {simulacion_json}")

            # Guardar la simulación en la base de datos (MongoDB)
            mongo_manager.guardar_simulacion(simulacion)
            
            # Configurar el estado del usuario con la simulación recién generada
            self.estado_usuario[user_id] = {
                "estado": "esperando_respuesta_paso",  # Cambiar el estado a "esperando_respuesta_paso"
                "simulacion": simulacion,  # Guardar la simulación en el estado del usuario
                "paso_actual": 0,  # Comenzamos desde el primer paso
                "respuestas": []  # Respuestas vacías inicialmente
            }

            # Responder al usuario con el primer paso de la simulación
            return self._mostrar_paso(user_id, f"🎯 **Simulación generada sobre: {situacion[:30]}**\n{simulacion['descripcion']}")

        except Exception as e:
            # Capturamos cualquier error en el proceso
            print(f"Error al generar simulación interactiva: {e}")
            return {"response": "❌ Hubo un problema generando la simulación. Intenta nuevamente.", "status": "awaiting_input"}



    def _generar_escenarios_desde_ia(self, simulacion_generada):
        print("Procesando simulación generada por la IA...")

        escenarios = []

        # Dividir el texto por pasos (por ejemplo: "**Paso 1:**")
        pasos_raw = re.split(r"\*\*Paso \d+\:\*\*", simulacion_generada)
        print(f"{len(pasos_raw)-1} pasos detectados.")

        for paso in pasos_raw:
            paso = paso.strip()
            if not paso:
                continue

            # Buscar la situación y sus opciones (hasta 3)
            match = re.search(r"Situación:\s*(.*?)\s*Opciones:\s*((?:\d+\.\s.*\n?)+)", paso, re.DOTALL)
            if match:
                descripcion = match.group(1).strip()
                opciones_raw = match.group(2).strip()

                # Extraer líneas que empiecen con número + punto (opciones)
                opciones = re.findall(r"\d+\.\s[^\n]+", opciones_raw)

                if len(opciones) >= 3:
                    escenarios.append({
                        "situacion": descripcion,
                        "opciones": opciones[:3]  # limitamos a 3 opciones para coherencia
                    })
                else:
                    print("⚠️ Paso ignorado: menos de 3 opciones detectadas.")
            else:
                print("⚠️ No se pudo analizar un paso correctamente. Paso omitido.")

        print(f"✅ Escenarios válidos generados: {len(escenarios)}")
        return escenarios






   
    def _verificar_simulacion_existente(self, user_id, situacion):
        print(f"Verificando si ya existe una simulación para la situación '{situacion}' y el usuario {user_id}")
        # Consultar en la base de datos si ya existe una simulación para la misma situación y el mismo usuario
        query = """
        SELECT * FROM public.simulaciones
        WHERE usuario_id = %s AND descripcion LIKE %s
        """
        try:
            # Ejecutar la consulta para verificar si ya existe la simulación
            resultados = ejecutar_query(query, (user_id, f"%{situacion}%"), tipo="select")
            print(f"Simulaciones existentes para el usuario {user_id}: {resultados}")
            return resultados  # Si hay resultados, significa que la simulación ya existe
        except Exception as e:
            print(f"Error al verificar si la simulación existe: {e}")
            return None

   
    def guardar_resultado(self, user_id, escenario, opcion_texto, comentario):
        query = """
            INSERT INTO public.simulaciones (id, usuario_id, escenario, opcion_elegida, comentario_final, fecha)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = (
            str(uuid.uuid4()),           # id
            str(user_id),                # usuario_id
            escenario,                   # texto del escenario
            opcion_texto,                # opción elegida
            comentario,                  # generado por el LLM
            datetime.now()               # timestamp
        )
        
        ejecutar_query(query, params, tipo="insert")




    def _mostrar_paso(self, user_id, mensaje_inicial=""):
        estado = self.estado_usuario[user_id]
        paso_actual = estado.get("paso_actual", 0)
        simulacion = estado["simulacion"]
        escenarios = simulacion["escenarios"]

        if not escenarios or paso_actual >= len(escenarios):
            return {
                "response": "❌ No hay pasos disponibles en esta simulación.",
                "status": "completed"
            }

        if paso_actual >= len(escenarios):
            return {
                "response": "✅ Has completado todos los pasos de la simulación.",
                "status": "completed"
            }

        paso = escenarios[paso_actual]
        situacion = paso["situacion"]
        opciones = "\n".join(paso["opciones"])

        mensaje = f"{mensaje_inicial}\n\n**Paso {paso_actual + 1}:**\n{situacion}\n\nOpciones:\n{opciones}"
        
        return {
            "response": mensaje,
            "status": "awaiting_choice"
        }


    def _procesar_respuesta(self, user_id, mensaje):
        datos = self.estado_usuario[user_id]

        # Si ya dio una respuesta y ahora está escribiendo "continuar"
        if datos.get("esperando_continuar"):
            datos["esperando_continuar"] = False  # Ya puede continuar
            paso_idx = datos["paso_actual"]
            sim = datos["simulacion"]

            if paso_idx < len(sim["escenarios"]):
                return self._mostrar_paso(user_id)
            else:
                self.estado_usuario[user_id] = {"estado": "inicio"}
                return {
                    "response": "🎉 **Has completado la simulación.** Gracias por participar. ¿Quieres probar otra?",
                    "status": "completed"
                }

        # Procesar la respuesta inicial del paso
        sim = datos["simulacion"]
        paso_idx = datos["paso_actual"]
        paso = sim["escenarios"][paso_idx]

        try:
            opcion_idx = int(mensaje.strip()) - 1
            opcion_elegida = paso["opciones"][opcion_idx]
            datos["respuestas"].append(opcion_idx)

            feedback = self._generar_feedback_llm(paso["situacion"], opcion_elegida)

            try:
                self.guardar_resultado(
                    user_id=user_id,
                    escenario=paso["situacion"],
                    opcion_texto=opcion_elegida,
                    comentario=feedback
                )
            except Exception as e:
                print(f"❌ Error al guardar resultado de simulación: {e}")
            # Guardamos que estamos esperando que diga "continuar"
            datos["esperando_continuar"] = True
            datos["paso_actual"] += 1  # Aumentamos ya el paso

            return {
                "response": f"✅ {feedback}\n\n✏️ Cuando estés listo, escribe **\"continuar\"** para pasar al siguiente paso.",
                "status": "awaiting_input"
            }

        except (ValueError, IndexError):
            return {
                "response": "❌ Entrada inválida. Elige un número válido según las opciones.",
                "status": "awaiting_input"
            }



    def _generar_feedback_llm(self, situacion, opcion_elegida):
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Eres un asistente empático que ayuda a las personas a reflexionar sobre sus elecciones sociales. Sé cálido, respetuoso y claro."),
            ("human", f"""Escenario: {situacion}
                Respuesta elegida: {opcion_elegida}

            Escribe un comentario amable, comprensivo y útil para esta elección. Evita juzgar. Anima al usuario a reflexionar o continuar desarrollando habilidades sociales.""")
        ])

        mensajes = prompt.format_messages()

        try:
            respuesta = self.chat.invoke(mensajes)
            return respuesta.content.strip()
        except Exception as e:
            return "Gracias por tu respuesta. Continuemos con el siguiente paso."

