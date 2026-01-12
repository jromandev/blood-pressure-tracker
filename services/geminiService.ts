
import { GoogleGenAI, Type } from "@google/genai";
import { BPLog, InsightData, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getHealthInsights = async (logs: BPLog[], profile: UserProfile): Promise<InsightData> => {
  if (logs.length === 0) {
    return {
      summary: "No logs available yet. Start tracking your blood pressure to receive personalized insights.",
      recommendations: ["Log your BP twice daily.", "Keep your readings consistent."],
      trend: "insufficient"
    };
  }

  const logData = logs.slice(0, 15).map(l => 
    `Date: ${new Date(l.timestamp).toLocaleString()}, Sys: ${l.systolic}, Dia: ${l.diastolic}, Pulse: ${l.pulse}`
  ).join('\n');

  const profileContext = `User Profile: ${profile.age} year old ${profile.gender}, Weight: ${profile.weight}kg. Medical history: ${profile.conditions || 'None'}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${profileContext}\n\nAnalyze the following blood pressure logs for this user. Provide a summary of their health status, actionable health recommendations, and a trend status.\n\nLogs:\n${logData}\n\nIMPORTANT: You are an AI, not a doctor. Always include a medical disclaimer.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            trend: { type: Type.STRING, enum: ["improving", "declining", "stable", "insufficient"] }
          },
          required: ["summary", "recommendations", "trend"]
        }
      }
    });

    return JSON.parse(response.text) as InsightData;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      summary: "We couldn't generate insights right now. Please check your data or try again later.",
      recommendations: ["Consult with a medical professional regarding your readings."],
      trend: "stable"
    };
  }
};

export const scanBPDevice = async (base64Image: string): Promise<{systolic: number, diastolic: number, pulse: number} | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image.split(',')[1] || base64Image
          }
        },
        { text: "Extract the blood pressure readings (systolic, diastolic) and pulse rate from this blood pressure monitor screen. Return ONLY a JSON object." }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            systolic: { type: Type.NUMBER },
            diastolic: { type: Type.NUMBER },
            pulse: { type: Type.NUMBER }
          },
          required: ["systolic", "diastolic", "pulse"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch (e) {
    console.error("OCR Error:", e);
    return null;
  }
};
