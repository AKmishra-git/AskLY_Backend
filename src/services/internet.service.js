import {tavily as Tavily} from "@tavily/core"


const tavily = new Tavily({
    apiKey: process.env.TAVILY_API_KEY
})

export const searchWeb = async (query) => {
    try {
        const response = await tavily.search(query, {
            numResults: 5,
            searchDepth: "advanced"

        })

        return JSON.stringify(response)

    } catch (error) {
        console.error("Error during web search:", error)
        throw new Error("Web search failed")
    }

  

}

