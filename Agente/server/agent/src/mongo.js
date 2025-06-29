import { MongoClient } from "mongodb";

const uri = "mongodb+srv://lacarrillo6:lacarrillo61@cluster0.5fqzzrz.mongodb.net/";
const client = new MongoClient(uri);

export async function getSimulacionesCollection() {
  await client.connect();
  const db = client.db("AppChatBot");
  return db.collection("Simulaciones");
}
