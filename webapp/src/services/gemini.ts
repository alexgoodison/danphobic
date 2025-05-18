import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const SYSTEM_PROMPT = `You are an expert at converting natural language queries into Elasticsearch queries.
Given a user's request, generate a valid Elasticsearch query that matches their requirements.
The query should be in JSON format and use the following fields:
- datetime: date field for filtering by time
- status: integer field for HTTP status codes
- path: keyword field for request paths
- method: keyword field for HTTP methods
- remote_addr: ip field for client IP addresses
- http_user_agent: text field for user agents

The current date is ${new Date().toISOString()}.

Your response must be a valid JSON object that follows this structure:
{
  "bool": {
    "must": [
      { "match": { "field_name": "value" } }
    ]
  }
}

For date ranges, use:
{
  "bool": {
    "must": [
      { "range": { "datetime": { "gte": "start_date", "lte": "end_date" } } }
    ]
  }
}

Return only the query object, no explanations or additional text.`;

export async function generateElasticsearchQuery(prompt: string) {
  try {
    console.log(SYSTEM_PROMPT, prompt);
    console.log(process.env.GEMINI_API_KEY);
    const result = await model.generateContent([{ text: SYSTEM_PROMPT }, { text: prompt }]);

    const response = await result.response;
    const queryText = response.text();

    console.log(queryText);

    // Clean up the response text by removing markdown formatting
    const cleanedText = queryText.replace(/```json\n?|\n?```/g, "").trim();

    // Parse the response as JSON
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error generating Elasticsearch query:", error);
    throw error;
  }
}
