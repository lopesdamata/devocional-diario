import { GoogleGenAI, Type } from "@google/genai";
import type { Devotional } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const devotionalSchema = {
  type: Type.OBJECT,
  properties: {
    verse: {
      type: Type.STRING,
      description: "A referência do versículo bíblico. Exemplo: 'João 3:16'",
    },
    verseText: {
      type: Type.STRING,
      description: "O texto completo do versículo bíblico.",
    },
    reflection: {
      type: Type.STRING,
      description: "Uma reflexão curta e inspiradora sobre o versículo, com cerca de 3-4 frases.",
    },
    prayer: {
      type: Type.STRING,
      description: "Uma oração curta baseada na reflexão, com cerca de 2-3 frases.",
    },
  },
  required: ["verse", "verseText", "reflection", "prayer"],
};

export const generateDevotional = async (): Promise<Devotional> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Gere um devocional diário curto. O devocional deve ser inspirador e aplicável à vida cotidiana. Escolha um versículo encorajador da Bíblia.",
      config: {
        responseMimeType: "application/json",
        responseSchema: devotionalSchema,
      },
    });

    const jsonText = response.text.trim();
    const devotionalData = JSON.parse(jsonText);
    return devotionalData as Devotional;

  } catch (error) {
    console.error("Error generating devotional:", error);
    throw new Error("Não foi possível gerar o devocional. Tente novamente mais tarde.");
  }
};
