from .tests_data import SINP, LSPS
from .state_manager import TestSession

# Diccionario en memoria para mantener las sesiones activas
sessions = {}

def iniciar_test(user_id, test_id="SINP"):
    test_id = (test_id or "SINP").upper()
    
    if test_id == "LSPS" or test_id == "2":
        test_data = LSPS
    else:
        test_data = SINP

    session = TestSession(user_id, test_data)
    sessions[user_id] = session
    return session

def obtener_sesion(user_id):
    return sessions.get(user_id)

def eliminar_sesion(user_id):
    sessions.pop(user_id, None)
