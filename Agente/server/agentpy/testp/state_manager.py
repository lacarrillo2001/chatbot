class TestSession:
    def __init__(self, user_id, test_data):
        self.user_id = user_id
        self.test_id = test_data["id"]
        self.preguntas = test_data["preguntas"]
        self.instrucciones = test_data["instrucciones"]
        self.respuestas = []
        self.indice_actual = 0
        self.pendiente_2da_parte = False  # solo para LSPS

    def obtener_pregunta_actual(self):
        if self.indice_actual < len(self.preguntas):
            return self.preguntas[self.indice_actual]
        return None

    def registrar_respuesta(self, respuesta):
        if self.test_id == "LSPS":
            if not self.pendiente_2da_parte:
                self.respuestas.append({"miedo": int(respuesta), "evitacion": None})
                self.pendiente_2da_parte = True
            else:
                self.respuestas[-1]["evitacion"] = int(respuesta)
                self.pendiente_2da_parte = False
                self.indice_actual += 1
        else:
            self.respuestas.append(int(respuesta))
            self.indice_actual += 1

    def esperando_2da_parte(self):
        return self.pendiente_2da_parte

    def finalizado(self):
        return self.indice_actual >= len(self.preguntas)

    def puntaje_total(self):
        
        if self.test_id in ["LSPS","LSAS-test"]:
            return sum(
                (r.get("miedo", 0) or 0) + (r.get("evitacion", 0) or 0)
                for r in self.respuestas
                if isinstance(r, dict) and isinstance(r.get("miedo"), int) and isinstance(r.get("evitacion"), int)
            )
        return sum(self.respuestas)  # Esto solo aplica a SINP

    
    def diagnostico(self):
        total = self.puntaje_total()

        if self.test_id == "SINP":
            if total < 20:
                return "Ansiedad social inexistente o muy leve"
            elif total <= 30:
                return "Ansiedad social leve"
            elif total <= 40:
                return "Ansiedad social moderada"
            elif total <= 50:
                return "Ansiedad social severa"
            else:
                return "Ansiedad social muy severa"

        elif self.test_id == "LSPS":
            if total < 55:
                return "No se aprecia ansiedad social"
            elif total <= 65:
                return "Ansiedad social moderada"
            elif total <= 80:
                return "Ansiedad social significativa"
            elif total <= 95:
                return "Ansiedad social severa"
            else:
                return "Ansiedad social muy severa"

        return "Diagnóstico no disponible para este test"

    def puntaje_social(self):
        """Suma solo las puntuaciones de miedo (componente social)."""
        if self.test_id == "LSPS":
            return sum(r.get("miedo", 0) for r in self.respuestas if isinstance(r, dict) and isinstance(r.get("miedo"), int) and r.get("evitacion") is not None)

        return self.puntaje_total()

    def puntaje_rendimiento(self):
        """Suma solo las puntuaciones de evitación (componente conductual)."""
        if self.test_id == "LSPS":
            return sum(r.get("miedo", 0) for r in self.respuestas if isinstance(r, dict) and isinstance(r.get("miedo"), int) and r.get("evitacion") is not None)
        return 0
