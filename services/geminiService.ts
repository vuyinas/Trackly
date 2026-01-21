
import { GoogleGenAI, Type } from "@google/genai";
import { Task, Email, MenuItem } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY}); and use it directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getSmartTaskSuggestions = async (tasks: Task[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Given these tasks, suggest which one is most urgent and provide 3 sub-tasks for it: ${JSON.stringify(tasks.map(t => ({ title: t.title, due: t.dueDate })))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            urgentTaskId: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const analyzeEmails = async (emails: Email[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Review these pending emails and identify the most critical one that needs a response: ${JSON.stringify(emails.filter(e => !e.isResponded).map(e => ({ subject: e.subject, sender: e.sender })))}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            criticalEmailId: { type: Type.STRING },
            reason: { type: Type.STRING },
            suggestedReplyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getEventStrategySuggestions = async (holidays: any[], topSellingItems: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Suggest 3 high-impact themed nights or events for a venue. 
      Consider these upcoming South African holidays: ${JSON.stringify(holidays)}. 
      Consider these high-performing menu items: ${JSON.stringify(topSellingItems)}. 
      Venue zones: The Yard Main Floor, The Yard Deck, Sunday Theory Zone 1, Sunday Theory Zone 2 (VIP).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  theme: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  recommendedZone: { type: Type.STRING },
                  featuredSpecial: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Event Strategy Error:", error);
    return null;
  }
};
