export enum DifficultyLevel {
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2'
}

export enum PhraseContext {
  FORMAL = 'Formal',
  INFORMAL = 'Informal',
  SLANG = 'Slang'
}

export interface VocabularyItem {
  french: string;
  phonetic: string;
  english: string;
  context: string; // Description of when to use it
  example: string;
  pronunciationTips: string;
}

export interface WordCardData {
  word: string;
  meaning: string;
  variations: {
    formal: VocabularyItem;
    informal: VocabularyItem;
    slang: VocabularyItem;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  translation?: string;
  audio?: boolean;
}

export interface UserStats {
  xp: number;
  streak: number;
  lastLogin: string;
  cardsLearned: number;
  level: number;
}
