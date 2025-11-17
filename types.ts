export interface Devotional {
  verse: string;
  verseText: string;
  reflection: string;
  prayer: string;
}

// Fix: Add definitions for bible-related types and constants.
export interface Book {
  abbrev: {
    pt: string;
    en: string;
  };
  author: string;
  chapters: number;
  group: string;
  name: string;
  testament: 'VT' | 'NT';
}

export interface Chapter {
  book: {
    abbrev: { pt: string };
    name: string;
    author: string;
    group: string;
    version: string;
  };
  chapter: {
    number: number;
    verses: number;
  };
  verses: {
    number: number;
    text: string;
  }[];
}

export interface SearchResult {
  occurrence: number;
  verses: {
    book: {
      abbrev: { pt: string };
      name: string;
    };
    chapter: number;
    number: number;
    text: string;
  }[];
}

export const BIBLE_VERSIONS = {
  acf: 'Almeida Corrigida Fiel',
  nvi: 'Nova Versão Internacional',
  ra: 'Almeida Revista e Atualizada',
};

export type BibleVersion = keyof typeof BIBLE_VERSIONS;

export interface OfflineVerse {
  id?: number;
  version: string;
  book_abbrev: string;
  chapter: number;
  verse: number;
  text: string;
}
