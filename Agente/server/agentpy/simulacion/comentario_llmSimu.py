import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from mongo_connection import obtener_simulaciones

from dotenv import load_dotenv
import os
load_dotenv()

class AgenteSimuladorLlm:
    def __init__(self, api_key):
        self.simulaciones = obtener_simulaciones()
        self.estado_usuario = {}
        self.chat = ChatGroq(
            temperature=0.7,
            model_name="meta-llama/llama-4-scout-17b-16e-instruct",
            api_key=api_key
        )

    def cargar_simulaciones(self, ruta):
        with open(ruta, encoding="utf-8") as f:
            return json.load(f)