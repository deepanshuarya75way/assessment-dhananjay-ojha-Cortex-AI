import { tavily as Tavily } from "@tavily/core";
import env from "../config/env.js";

const tavily = Tavily({
    apiKey: env.tavilyApiKey,
})


export const searchInternet = async ({ query }) => {
    const results = await tavily.search(query, {
        maxResults: 5,
    })

    console.log(JSON.stringify(results))

    return JSON.stringify(results)
}