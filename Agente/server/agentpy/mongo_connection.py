# mongo_connection.py

from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError  # Asegúrate de usar el error correcto
from dotenv import load_dotenv
import os
load_dotenv()
mongo_uri = os.getenv("MONGO_URI")
class MongoDBManager:
    def __init__(self, uri=mongo_uri, db_name="AppChatBot", collection_name="Simulaciones"):
        """Inicializa la conexión con MongoDB."""
        try:
            self.cliente = MongoClient(uri, serverSelectionTimeoutMS=5000)  # Añadido timeout para controlar la espera
            self.db = self.cliente[db_name]
            self.coleccion = self.db[collection_name]
            # Intentamos hacer una operación simple para verificar la conexión
            self.cliente.server_info()  # Esto lanzará un error si no hay conexión
            print("Conexión establecida con MongoDB.")
        except ServerSelectionTimeoutError as e:
            print(f"Error de conexión a MongoDB: {e}")
            self.cliente = None  # No inicializamos la conexión si hay error
            self.db = None
            self.coleccion = None
        except Exception as e:
            print(f"Error inesperado: {e}")
            self.cliente = None
            self.db = None
            self.coleccion = None

    def obtener_simulaciones(self):
        """Obtiene todas las simulaciones y las devuelve como una lista."""
        if self.coleccion is not None:  # Verificación explícita de que la colección no es None
            try:
                simulaciones = list(self.coleccion.find({}, {"_id": 0}))  # Excluye el campo _id
                return simulaciones
            except Exception as e:
                print(f"Error al obtener simulaciones: {e}")
                return []
        else:
            print("No se puede obtener simulaciones. Conexión no establecida.")
            return []

    def guardar_simulacion(self, simulacion):
        """Guarda una simulación en la base de datos."""
        if self.coleccion is not None:  # Verificación explícita de que la colección no es None
            try:
                # Insertar la simulación en MongoDB
                self.coleccion.insert_one(simulacion)
                print("Simulación guardada exitosamente en MongoDB.")
            except Exception as e:
                print(f"Error al guardar la simulación: {e}")
        else:
            print("No se puede guardar simulación. Conexión no establecida.")

    def close(self):
        """Cierra la conexión de MongoDB."""
        if self.cliente:
            self.cliente.close()
            print("Conexión cerrada con MongoDB.")
        else:
            print("Conexión no estaba abierta para cerrar.")
