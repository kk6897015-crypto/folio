import { GoogleGenAI } from "@google/genai";
import { Task, JournalEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getAIInsights(tasks: Task[], journalEntries: JournalEntry[], prompt: string) {
  const context = `
    Current Tasks: ${JSON.stringify(tasks.map(t => ({ title: t.title, tag: t.tag, dueDate: t.dueDate, completed: t.completed })))}
    Recent Journal Entries: ${JSON.stringify(journalEntries.slice(0, 5).map(j => ({ content: j.content, mood: j.mood, tags: j.tags })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `You are an AI productivity and wellness coach. Based on the following data, answer the user's prompt.
          
          Data:
          ${context}
          
          User Prompt: ${prompt}` }]
        }
      ],
      config: {
        systemInstruction: "You provide concise, actionable, and empathetic insights. Use markdown for formatting.",
      }
    });

    return response.text || "I couldn't generate an insight at this moment.";
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Error generating insights. Please check your connection or API key.";
  }
}
