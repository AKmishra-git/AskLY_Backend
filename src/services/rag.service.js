import { Pinecone } from "@pinecone-database/pinecone";
import { MistralAIEmbeddings } from "@langchain/mistralai";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index("my-project");

const embeddings = new MistralAIEmbeddings({
  apiKey: process.env.MISTRAL_API_KEY,
  model: "mistral-embed",
});

export async function getEmbedding(text) {
  return await embeddings.embedQuery(text);
}

export async function retrieveContext(question, userId) {
  const queryEmbedding = await getEmbedding(question);

  const result = await index.query({
    vector: queryEmbedding,
    topK: 3,
    includeMetadata: true,
    filter: {
      userId: { $eq: userId },
    },
  });

  return result.matches.map(m => m.metadata.text).join("\n");
}