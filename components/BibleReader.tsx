import React, { useState, useEffect, useRef } from 'react';
import { getBooks, getChapter } from '../services/bibleService';
import type { Book, Chapter, BibleVersion } from '../types';
import { BIBLE_VERSIONS } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface BibleReaderProps {
  initialBookAbbrev: string | null;
  initialChapter: number | null;
  verseToHighlight: number | null;
  version: BibleVersion;
  onVersionChange: (version: BibleVersion) => void;
}

const VersionSelector: React.FC<{ version: BibleVersion, onVersionChange: (v: BibleVersion) => void }> = ({ version, onVersionChange }) => {
  return (
    <div>
      <label htmlFor="version-select" className="sr-only">Selecionar Versão da Bíblia</label>
      <select 
        id="version-select"
        value={version}
        onChange={(e) => onVersionChange(e.target.value as BibleVersion)}
        className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-slate-300 bg-white focus:outline-none focus:ring-slate-500 focus:border-slate-500 rounded-md shadow-sm"
      >
        {(Object.keys(BIBLE_VERSIONS) as BibleVersion[]).map(key => (
          <option key={key} value={key}>{BIBLE_VERSIONS[key]}</option>
        ))}
      </select>
    </div>
  );
};

export default function BibleReader({ initialBookAbbrev, initialChapter, verseToHighlight, version, onVersionChange }: BibleReaderProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [chapterContent, setChapterContent] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const verseRef = useRef<HTMLDivElement>(null);

  // Effect 1: Load the list of books on initial mount.
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const loadBooks = async () => {
        setLoading(true);
        setError(null);
        try {
            const bookData = await getBooks(signal);
            if (!signal.aborted) {
                setBooks(bookData);
            }
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError('Falha ao carregar livros.');
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    };
    
    loadBooks();

    return () => controller.abort();
  }, []);

  // Effect 2: Set the initial book and chapter from props, but only after books have been loaded.
  useEffect(() => {
    if (books.length > 0 && initialBookAbbrev) {
        const initialBook = books.find(b => b.abbrev.pt === initialBookAbbrev);
        if (initialBook) {
            setSelectedBook(initialBook);
            if (initialChapter) {
                setSelectedChapter(initialChapter);
            }
        } else {
            setError(`O livro com abreviação "${initialBookAbbrev}" não foi encontrado.`);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [books, initialBookAbbrev, initialChapter]);


  // Effect 3: Load chapter content whenever book/chapter/version selection changes.
  useEffect(() => {
    if (!selectedBook || !selectedChapter) {
        return;
    };

    const controller = new AbortController();
    const { signal } = controller;

    const fetchContent = async () => {
        setLoading(true);
        setError(null);
        setChapterContent(null); // Clear previous content
        try {
            const data = await getChapter(selectedBook.abbrev.pt, selectedChapter, version, signal);
            if (!signal.aborted) setChapterContent(data);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') setError('Falha ao carregar o capítulo.');
        } finally {
            if (!signal.aborted) setLoading(false);
        }
    };

    fetchContent();
    
    return () => controller.abort();
  }, [selectedBook, selectedChapter, version]);


  // Effect 4: Scroll to highlighted verse
  useEffect(() => {
    if (verseToHighlight && verseRef.current) {
      verseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [chapterContent, verseToHighlight]);

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setChapterContent(null);
  };

  const handleChapterSelect = (chapter: number) => {
    setSelectedChapter(chapter);
  };
  
  const resetSelection = () => {
      setSelectedBook(null);
      setSelectedChapter(null);
      setChapterContent(null);
  }

  const backToChapters = () => {
    setSelectedChapter(null);
    setChapterContent(null);
  }

  if (loading && books.length === 0) {
    return <div className="flex justify-center items-center h-96"><LoadingSpinner /></div>;
  }
  
  if (error) {
    return <div className="text-center text-red-600 bg-red-100 p-6 rounded-lg border border-red-200">
        <h3 className="font-bold text-lg mb-2">Ocorreu um Erro</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors">
            Recarregar a Página
        </button>
    </div>;
  }

  if (chapterContent) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md relative">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
           <button onClick={backToChapters} className="text-slate-600 hover:text-slate-900 transition-colors">&larr; Voltar aos Capítulos</button>
           <VersionSelector version={version} onVersionChange={onVersionChange} />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-1">{chapterContent.book.name}</h2>
        <h3 className="text-xl text-slate-600 font-semibold mb-2">Capítulo {chapterContent.chapter.number}</h3>
        <p className="text-sm text-slate-500 mb-6">Versão: {BIBLE_VERSIONS[version]}</p>
        
        {loading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg"><LoadingSpinner /></div>}

        <div className={`space-y-4 font-serif text-lg leading-relaxed ${loading ? 'opacity-50' : ''}`}>
          {chapterContent.verses.map(verse => (
            <p key={verse.number} ref={verse.number === verseToHighlight ? verseRef : null}
              className={` ${verse.number === verseToHighlight ? 'bg-yellow-100 p-2 rounded' : ''}`}>
              <sup className="font-sans font-bold text-slate-500 mr-2">{verse.number}</sup>
              {verse.text}
            </p>
          ))}
        </div>
      </div>
    );
  }

  if (selectedBook) {
    return (
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <button onClick={resetSelection} className="text-slate-600 hover:text-slate-900 transition-colors">&larr; Voltar aos Livros</button>
          <VersionSelector version={version} onVersionChange={onVersionChange} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Selecione um Capítulo de {selectedBook.name}</h2>
        {loading ? <div className="flex justify-center items-center h-40"><LoadingSpinner/></div> :
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapter => (
                <button key={chapter} onClick={() => handleChapterSelect(chapter)} 
                className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 text-slate-700 font-semibold hover:bg-slate-800 hover:text-white transition-all duration-200">
                {chapter}
                </button>
            ))}
            </div>
        }
      </div>
    );
  }

  const oldTestamentBooks = books.filter(book => book.testament === 'VT');
  const newTestamentBooks = books.filter(book => book.testament === 'NT');

  return (
    <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md space-y-8">
      <div className="flex justify-end">
        <VersionSelector version={version} onVersionChange={onVersionChange} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b-2 border-slate-200 pb-2">Antigo Testamento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {oldTestamentBooks.map(book => (
            <button key={book.name} onClick={() => handleBookSelect(book)}
              className="text-left p-4 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors duration-200">
              <span className="font-semibold text-slate-800">{book.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-4 border-b-2 border-slate-200 pb-2">Novo Testamento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {newTestamentBooks.map(book => (
            <button key={book.name} onClick={() => handleBookSelect(book)}
              className="text-left p-4 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors duration-200">
              <span className="font-semibold text-slate-800">{book.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
