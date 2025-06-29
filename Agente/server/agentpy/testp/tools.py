from langchain.tools import tool
from .tests_data import SINP, LSPS

TESTS = {
    "SINP": SINP,
    "LSPS": LSPS
}

@tool
def responder_test(user_id: str, test_id: str) -> str:
    """
    Simula respuestas del test SOLO para SINP.
    """
    try:
        test_id = test_id.upper()
        if test_id not in TESTS:
            return f"❌ Test '{test_id}' no encontrado. Usa uno de: {', '.join(TESTS.keys())}"

        if test_id != "SINP":
            return "⚠️ Este test requiere ser respondido paso a paso. Por favor, escribe 'iniciar test LSPS' para hacerlo correctamente."

        test_data = TESTS[test_id]
        preguntas = test_data["preguntas"]
        respuestas = []

        for i, texto in enumerate(preguntas):
            respuesta = 3  # Simulación fija
            respuestas.append(
                f"📝 Pregunta {i+1}: {texto}\n✅ Respuesta elegida: {respuesta}"
            )

        return f"📋 Test: {test_data['titulo']}\n\n" + "\n\n".join(respuestas)

    except Exception as e:
        return f"❌ Error al procesar el test: {str(e)}"
