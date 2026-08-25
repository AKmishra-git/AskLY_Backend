import fs from "fs";
import {PDFParse} from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getEmbedding } from "./rag.service.js";
import { Pinecone } from "@pinecone-database/pinecone";
import { v4 as uuidv4 } from "uuid";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("my-project");

export async function processPDF(filePath, userId) {
  const buffer = fs.readFileSync(filePath);

  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100,
  });

  const chunks = await splitter.splitText(data.text);

  const records = [];

  for (let chunk of chunks) {
    const embedding = await getEmbedding(chunk);

    records.push({
      id: uuidv4(),
      values: embedding,
      metadata: {
        text: chunk,
        userId,
      },
    });
  }

  await index.upsert({ records });

  return { chunks: chunks.length };
}