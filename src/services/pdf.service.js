import fs from "fs";
import PDFParse from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbedding } from "./rag.service.js";
import { Pinecone } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("my-project");

// ✅ Batch embedding function
async function getEmbeddingsBatch(chunks) {
  const BATCH_SIZE = 10 // 10 chunks ek saath embed karo

  const allEmbeddings = []

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE)

    // ✅ 10 chunks parallel mein embed karo
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

  // ✅ Import fix kiya
  const data = await PDFParse(buffer)

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 800,   // ✅ 500 se badhaya — kam chunks bane
    chunkOverlap: 100,
  })

  const chunks = await splitter.splitText(data.text)
  console.log(`Total chunks: ${chunks.length}`)

  // ✅ Sab chunks ek saath embed karo batch mein
  const embeddings = await getEmbeddingsBatch(chunks)

  // ✅ Records banao
  const records = chunks.map((chunk, i) => ({
    id: uuidv4(),
    values: embeddings[i],
    metadata: {
      text: chunk,
      userId,
    },
  }))

  // ✅ Upsert format fix kiya
  await index.upsert(records)

  // ✅ Temp file delete karo memory save karne ke liye
  fs.unlinkSync(filePath)

  return { chunks: chunks.length }
}