import fs from "fs";
import { createRequire } from "module"; // ✅ add karo
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbedding } from "./rag.service.js";
import { Pinecone } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";

// ✅ CommonJS library ko ES Module mein use karne ka tarika
const require = createRequire(import.meta.url);
const PDFParse = require("pdf-parse");

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("my-project");

async function getEmbeddingsBatch(chunks) {
  const BATCH_SIZE = 10

  const allEmbeddings = []

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)

    const embeddings = await Promise.all(
      batch.map(chunk => getEmbedding(chunk))
    )

    allEmbeddings.push(...embeddings)
    console.log(`Embedded ${Math.min(i + BATCH_SIZE, chunks.length)}/${chunks.length} chunks`)
  }

  return allEmbeddings
}

export async function processPDF(filePath, userId) {
  const buffer = fs.readFileSync(filePath)

  const data = await PDFParse(buffer) // ✅ ab kaam karega

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,
    chunkOverlap: 100,
  })

  const chunks = await splitter.splitText(data.text)
  console.log(`Total chunks: ${chunks.length}`)

  const embeddings = await getEmbeddingsBatch(chunks)

  const records = chunks.map((chunk, i) => ({
    id: uuidv4(),
    values: embeddings[i],
    metadata: {
      text: chunk,
      userId,
    },
  }))

  await index.upsert(records)

  fs.unlinkSync(filePath)

  return { chunks: chunks.length }
}