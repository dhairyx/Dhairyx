import { GoogleGenAI, Type, Modality } from "@google/genai";
import { DifficultyLevel, WordCardData, PhraseContext } from "../types";

const apiKey = process.env.API_KEY || '';

const getClient = () => {
    return new GoogleGenAI({ apiKey });
};

/**
 * Generates vocabulary cards based on level and topic.
 */
export const generateVocabulary = async (
  level: DifficultyLevel,
  topic: string
): Promise<WordCardData[]> => {
  const ai = getClient();
  
  const prompt = `Generate 3 distinct French vocabulary words or short phrases related to "${topic}" suitable for a learner at ${level} level. 
  For each word, provide:
  1. The core word/phrase.
  2. English meaning.
  3. Three variations/usages: Formal (Professional/Polite), Informal (Friends/Family), and Slang (Street/Youth).
  4. IPA phonetic transcription for the French phrase in each variation.
  
  Ensure the slang is authentic modern French slang (verlan, argot, etc.) where appropriate.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING, description: "The main French word or phrase" },
              meaning: { type: Type.STRING, description: "English definition" },
              variations: {
                type: Type.OBJECT,
                properties: {
                  formal: {
                    type: Type.OBJECT,
                    properties: {
                      french: { type: Type.STRING },
                      phonetic: { type: Type.STRING, description: "IPA pronunciation" },
                      english: { type: Type.STRING },
                      context: { type: Type.STRING, description: "When to use this formal version" },
                      example: { type: Type.STRING, description: "A full sentence example" },
                      pronunciationTips: { type: Type.STRING }
                    },
                    required: ["french", "phonetic", "english", "context", "example", "pronunciationTips"]
                  },
                  informal: {
                    type: Type.OBJECT,
                    properties: {
                      french: { type: Type.STRING },
                      phonetic: { type: Type.STRING, description: "IPA pronunciation" },
                      english: { type: Type.STRING },
                      context: { type: Type.STRING },
                      example: { type: Type.STRING },
                      pronunciationTips: { type: Type.STRING }
                    },
                     required: ["french", "phonetic", "english", "context", "example", "pronunciationTips"]
                  },
                  slang: {
                    type: Type.OBJECT,
                    properties: {
                      french: { type: Type.STRING },
                      phonetic: { type: Type.STRING, description: "IPA pronunciation" },
                      english: { type: Type.STRING },
                      context: { type: Type.STRING },
                      example: { type: Type.STRING },
                      pronunciationTips: { type: Type.STRING }
                    },
                     required: ["french", "phonetic", "english", "context", "example", "pronunciationTips"]
                  }
                },
                 required: ["formal", "informal", "slang"]
              }
            },
            required: ["word", "meaning", "variations"]
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    return JSON.parse(jsonText) as WordCardData[];

  } catch (error) {
    console.error("Error generating vocab:", error);
    return [];
  }
};

/**
 * Generates audio for a specific phrase with a specific persona/style.
 */
export const generatePronunciation = async (
  text: string,
  context: PhraseContext
): Promise<string | null> => {
  const ai = getClient();
  
  // Select voice based on context
  let voiceName = 'Kore'; // Default/Formal
  if (context === PhraseContext.INFORMAL) voiceName = 'Puck';
  if (context === PhraseContext.SLANG) voiceName = 'Fenrir';

  const prompt = `Say the following French phrase naturally: "${text}"`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return audioData || null;

  } catch (error) {
    console.error("Error generating audio:", error);
    return null;
  }
};