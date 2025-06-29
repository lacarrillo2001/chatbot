import random

def generar_feedback(respuesta: int, pregunta: str, num_pregunta: int) -> str:
    validaciones = {
        0: ["😊 Me alegra saber que no es un problema para ti.", "🧘‍♂️ Qué bien que no te afecta."],
        1: ["👍 Un poco de incomodidad es completamente normal.", "👌 Lo entiendo, gracias por compartirlo."],
        2: ["🤔 Parece que a veces esa situación te afecta. Gracias por tu honestidad."],
        3: ["🙏 Gracias. Esa situación parece incómoda para ti.", "😟 Entiendo, no es fácil enfrentar eso."],
        4: ["❤️ Gracias por confiar. Esta situación parece generarte mucha ansiedad.", "💬 Estoy contigo, eso puede ser muy difícil."]
    }

    frases_validacion = validaciones.get(respuesta, ["Gracias por tu respuesta."])
    frase_aleatoria = random.choice(frases_validacion)

    return (
        f"{frase_aleatoria}\n\n"
        f"🧠 Vamos con la siguiente...\n\n"
        f"🔹 Pregunta {num_pregunta}:\n**{pregunta}**\n\n"
        f"Responde con un número del 0 (en absoluto) al 4 (extremadamente)."
    )
