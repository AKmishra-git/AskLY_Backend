import fs from "fs";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbedding } from "./rag.service.js";
import { Pinecone } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";
import { PDFParse } from "pdf-parse"; // ✅ v2: named export, ESM-native, no createRequire needed

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
  let parser;
  try {
    console.log("Step 1 - File path:", filePath)

    // ✅ Check karo file exist karti hai
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const buffer = fs.readFileSync(filePath)
    console.log("Step 2 - Buffer size:", buffer.length)

    // ✅ v2 API: instantiate PDFParse with the buffer, then call getText()
    parser = new PDFParse({ data: buffer })
    const data = await parser.getText()
    console.log("Step 3 - Text length:", data.text.length)

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 800,
      chunkOverlap: 100,
    })

    const chunks = await splitter.splitText(data.text)
    console.log("Step 4 - Chunks:", chunks.length)

    const embeddings = await getEmbeddingsBatch(chunks)
    console.log("Step 5 - Embeddings:", embeddings.length)

    const records = chunks.map((chunk, i) => ({
      id: uuidv4(),
      values: embeddings[i],
      metadata: { text: chunk, userId },
    }))

    await index.upsert(records)
    console.log("Step 6 - Pinecone done ✅")

    fs.unlinkSync(filePath)

    return { chunks: chunks.length }

  } catch (error) {
    console.error("❌ Error at step:", error.message)
    console.error("❌ Stack:", error.stack)
    throw error
  } finally {
    // ✅ v2 requires explicit cleanup of parser resources
    if (parser) {
      await parser.destroy()
    }
  }
}