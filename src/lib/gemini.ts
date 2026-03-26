import { GoogleGenAI } from "@google/genai";

export async function getMathExplanation(problem: string, userAnswer?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return "API Key not found. Please set GEMINI_API_KEY in your environment variables (e.g., on Vercel).";
  }
  const genAI = new GoogleGenAI({ apiKey });
  const model = "gemini-3-flash-preview";
  
  let prompt = `You are a friendly and encouraging math tutor for kids. 
  Explain the following math problem simply: "${problem}".`;
  
  if (userAnswer) {
    prompt += ` The student answered "${userAnswer}". If it's wrong, explain why and guide them to the correct answer without just giving it away immediately. If it's right, praise them and explain the logic briefly.`;
  }

  try {
    const response = await genAI.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "Keep explanations short, fun, and easy to understand for a 10-year-old. Use emojis.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Oops! My AI brain is a bit tired. Let's try that again! 🧠✨";
  }
}
