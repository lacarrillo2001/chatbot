import psycopg2
from dotenv import load_dotenv
import os
import logging
logger = logging.getLogger(__name__)

# Cargar las variables de entorno
load_dotenv()

def obtener_conexion_db():
    """Devuelve una conexión segura (Aiven) o local según el .env"""
    use_ssl = os.getenv("PG_USE_SSL", "false").lower() == "true"

    conn_params = {
        "dbname": os.getenv("PG_DBNAME"),
        "user": os.getenv("PG_USER"),
        "password": os.getenv("PG_PASSWORD"),
        "host": os.getenv("PG_HOST"),
        "port": os.getenv("PG_PORT"),
    }

    if use_ssl:
        conn_params["sslmode"] = "verify-full"
        conn_params["sslrootcert"] = os.getenv("PG_SSLROOTCERT")

    return psycopg2.connect(**conn_params)


def ejecutar_query(connection, query, params=None, tipo="select"):
    cursor = connection.cursor()
    try:
        logger.info("🟢 Ejecutando query SQL:")
        logger.info("Query: %s", query)
        logger.info("Params: %s", params)

        cursor.execute(query, params)
        if tipo in ["insert", "update", "delete"]:
            connection.commit()
        if tipo == "select":
            return cursor.fetchall()
    except Exception as e:
        logger.error("❌ Error en la consulta SQL", exc_info=True)
        logger.error("Query: %s", query)
        logger.error("Params: %s", params)
        connection.rollback()
        return None
    finally:
        cursor.close()


def obtener_preguntas_y_opciones(test_id):
    conexion = obtener_conexion_db()
    query = """
    SELECT 
        pt.id AS pregunta_id, 
        pt.texto AS pregunta_texto, 
        op.id AS opcion_id, 
        op.texto_opcion AS opcion_texto, 
        op.valor AS opcion_valor,
        pt.tipo AS pregunta_tipo
    FROM 
        public.tests t
    JOIN public.preguntas_test pt ON pt.test_id = t.id
    JOIN public.opciones_pregunta_test op ON op.pregunta_id = pt.id
    WHERE t.id = %s
    ORDER BY pt.id, op.orden;
    """
    return ejecutar_query(conexion, query, (test_id,), tipo="select")
