import type { Book, Chapter, SearchResult, BibleVersion, OfflineVerse } from '../types';
import { BIBLE_VERSIONS } from '../types';
import { db } from './db';

const API_BASE_URL = 'https://www.abibliadigital.com.br/api';
const ACF_JSON_URL = 'https://raw.githubusercontent.com/thiagobodruk/biblia/master/json/acf.json';

export const getBooks = async (signal?: AbortSignal): Promise<Book[]> => {
  const response = await fetch(`${API_BASE_URL}/books`, { signal });
  if (!response.ok) {
    throw new Error('Falha ao buscar os livros da Bíblia.');
  }
  return response.json();
};

export const isVersionAvailableOffline = async (version: BibleVersion): Promise<boolean> => {
  if (version !== 'acf') return false;
  const count = await db.verses.where({ version }).count();
  return count > 0;
};

export const syncVersion = async (version: BibleVersion, onProgress: (progress: number) => void): Promise<void> => {
  if (version !== 'acf') {
    throw new Error('Apenas a versão ACF pode ser sincronizada para uso offline.');
  }

  onProgress(0);

  const response = await fetch(ACF_JSON_URL);
  if (!response.ok) {
    throw new Error('Falha ao baixar o arquivo da Bíblia.');
  }
  const bibleData = await response.json();

  const allVerses: OfflineVerse[] = [];
  let totalVerses = 0;
  bibleData.forEach((book: any) => {
    book.chapters.forEach((chapter: any[]) => {
      totalVerses += chapter.length;
    });
  });

  let processedVerses = 0;
  for (const book of bibleData) {
    for (let i = 0; i < book.chapters.length; i++) {
      const chapterNum = i + 1;
      const chapterVerses = book.chapters[i];
      for (let j = 0; j < chapterVerses.length; j++) {
        const verseNum = j + 1;
        const verseText = chapterVerses[j];
        allVerses.push({
          version: 'acf',
          book_abbrev: book.abbrev,
          chapter: chapterNum,
          verse: verseNum,
          text: verseText,
        });
      }
      // Fix: Moved this line inside the chapter loop to fix the ReferenceError, as 'i' was out of scope.
      processedVerses += book.chapters[i].length;
    }
    onProgress(processedVerses / totalVerses);
  }

  await db.transaction('rw', db.verses, async () => {
    await db.verses.where({ version: 'acf' }).delete();
    await db.verses.bulkAdd(allVerses);
  });

  onProgress(1);
};


export const getChapter = async (bookAbbrev: string, chapter: number, version: string, signal?: AbortSignal): Promise<Chapter> => {
  if (await isVersionAvailableOffline(version as BibleVersion)) {
    const versesFromDb = await db.verses.where({ version, book_abbrev: bookAbbrev, chapter }).sortBy('verse');
    if (versesFromDb.length > 0) {
      const books = await getBooks(signal);
      const bookDetails = books.find(b => b.abbrev.pt === bookAbbrev);

      if (!bookDetails) throw new Error("Livro não encontrado.");

      return {
        book: {
          abbrev: { pt: bookDetails.abbrev.pt },
          name: bookDetails.name,
          author: bookDetails.author,
          group: bookDetails.group,
          version: BIBLE_VERSIONS[version as BibleVersion],
        },
        chapter: {
          number: chapter,
          verses: versesFromDb.length,
        },
        verses: versesFromDb.map(v => ({ number: v.verse, text: v.text })),
      };
    }
  }

  const response = await fetch(`${API_BASE_URL}/verses/${version}/${bookAbbrev}/${chapter}`, { signal });
  if (!response.ok) {
    throw new Error('Falha ao buscar o capítulo.');
  }
  return response.json();
};

export const searchBible = async (query: string, version: string): Promise<SearchResult> => {
  if (await isVersionAvailableOffline(version as BibleVersion)) {
    const matchingVerses = await db.verses
      .where({ version })
      .filter(v => v.text.toLowerCase().includes(query.toLowerCase()))
      .toArray();

    if (matchingVerses.length > 0) {
      const books = await getBooks();
      const versesForResponse = matchingVerses.map(v => {
        const bookDetails = books.find(b => b.abbrev.pt === v.book_abbrev);
        return {
          book: {
            abbrev: { pt: v.book_abbrev },
            name: bookDetails?.name || v.book_abbrev,
          },
          chapter: v.chapter,
          number: v.verse,
          text: v.text,
        };
      });
      return {
        occurrence: versesForResponse.length,
        verses: versesForResponse.slice(0, 100), // Limita a 100 resultados
      };
    }
    return { occurrence: 0, verses: [] };
  }

  const response = await fetch(`${API_BASE_URL}/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      version: version,
      search: query,
    }),
  });
  if (!response.ok) {
    throw new Error('Falha ao realizar a busca.');
  }
  return response.json();
};

export const getVerse = async (bookAbbrev: string, chapter: number, verse: number, version: string): Promise<Chapter> => {
    return getChapter(bookAbbrev, chapter, version);
}
