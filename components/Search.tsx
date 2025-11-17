import React, { useState } from 'react';
import { searchBible } from '../services/bibleService';
import type { SearchResult, BibleVersion } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { SearchIcon } from './icons/SearchIcon';

interface SearchProps {
  onVerseSelect: (bookAbbrev: string, chapter: number, verse: number) => void;
  version: BibleVersion;
}

const bookAbbrevMap: { [key: string]: string } = {
  'gn': 'gn', 'genesis': 'gn', 'gênesis': 'gn',
  'ex': 'ex', 'exodo': 'ex', 'êxodo': 'ex',
  'lv': 'lv', 'levitico': 'lv', 'levítico': 'lv',
  'nm': 'nm', 'numeros': 'nm', 'números': 'nm',
  'dt': 'dt', 'deuteronomio': 'dt', 'deuteronômio': 'dt',
  'js': 'js', 'josue': 'js', 'josué': 'js',
  'jz': 'jz', 'juizes': 'jz', 'juízes': 'jz',
  'rt': 'rt', 'rute': 'rt',
  '1sm': '1sm', '1 samuel': '1sm',
  '2sm': '2sm', '2 samuel': '2sm',
  '1rs': '1rs', '1 reis': '1rs',
  '2rs': '2rs', '2 reis': '2rs',
  '1cr': '1cr', '1 cronicas': '1cr', '1 crônicas': '1cr',
  '2cr': '2cr', '2 cronicas': '2cr', '2 crônicas': '2cr',
  'ed': 'ed', 'esdras': 'ed',
  'ne': 'ne', 'neemias': 'ne',
  'et': 'et', 'ester': 'et',
  'jo': 'job', 'jó': 'job',
  'sl': 'sl', 'salmos': 'sl',
  'pv': 'pv', 'proverbios': 'pv', 'provérbios': 'pv',
  'ec': 'ec', 'eclesiastes': 'ec',
  'ct': 'ct', 'cantares': 'ct',
  'is': 'is', 'isaias': 'is', 'isaías': 'is',
  'jr': 'jr', 'jeremias': 'jr',
  'lm': 'lm', 'lamentacoes': 'lm', 'lamentações': 'lm',
  'ez': 'ez', 'ezequiel': 'ez',
  'dn': 'dn', 'daniel': 'dn',
  'os': 'os', 'oseias': 'os', 'oséias': 'os',
  'jl': 'jl', 'joel': 'jl',
  'am': 'am', 'amos': 'am', 'amós': 'am',
  'ob': 'ob', 'obadias': 'ob',
  'jn': 'jn', 'jonas': 'jn',
  'mq': 'mq', 'miqueias': 'mq', 'miquéias': 'mq',
  'na': 'na', 'naum': 'na',
  'hc': 'hc', 'habacuque': 'hc',
  'sf': 'sf', 'sofonias': 'sf',
  'ag': 'ag', 'ageu': 'ag',
  'zc': 'zc', 'zacarias': 'zc',
  'ml': 'ml', 'malaquias': 'ml',
  'mt': 'mt', 'mateus': 'mt',
  'mc': 'mc', 'marcos': 'mc',
  'lc': 'lc', 'lucas': 'lc',
  'joao': 'jo', 'joão': 'jo',
  'atos': 'atos', 'at': 'atos',
  'rm': 'rm', 'romanos': 'rm',
  '1co': '1co', '1 corintios': '1co', '1 coríntios': '1co',
  '2co': '2co', '2 corintios': '2co', '2 coríntios': '2co',
  'gl': 'gl', 'galatas': 'gl', 'gálatas': 'gl',
  'ef': 'ef', 'efesios': 'ef', 'efésios': 'ef',
  'fp': 'fp', 'filipenses': 'fp',
  'cl': 'cl', 'colossenses': 'cl',
  '1ts': '1ts', '1 tessalonicenses': '1ts',
  '2ts': '2ts', '2 tessalonicenses': '2ts',
  '1tm': '1tm', '1 timoteo': '1tm', '1 timóteo': '1tm',
  '2tm': '2tm', '2 timoteo': '2tm', '2 timóteo': '2tm',
  'tt': 'tt', 'tito': 'tt',
  'fm': 'fm', 'filemom': 'fm',
  'hb': 'hb', 'hebreus': 'hb',
  'tg': 'tg', 'tiago': 'tg',
  '1pe': '1pe', '1 pedro': '1pe',
  '2pe': '2pe', '2 pedro': '2pe',
  '1jo': '1jo', '1 joao': '1jo', '1 joão': '1jo',
  '2jo': '2jo', '2 joao': '2jo', '2 joão': '2jo',
  '3jo': '3jo', '3 joao': '3jo', '3 joão': '3jo',
  'jd': 'jd', 'judas': 'jd',
  'ap': 'ap', 'apocalipse': 'ap',
};


export default function Search({ onVerseSelect, version }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Verse reference check
    const verseRegex = /^(?:([1-3])\s)?([\w\u00C0-\u017F]+)\s(\d+)(?:[:.](\d+))?$/i;
    const match = query.trim().match(verseRegex);
    
    if (match) {
      const [, bookNumber, bookName, chapter, verse] = match;
      const fullBookName = (bookNumber ? `${bookNumber} ` : '') + bookName.toLowerCase();
      const bookAbbrev = bookAbbrevMap[fullBookName.replace(/\s+/g, '')];

      if (bookAbbrev && chapter && verse) {
        onVerseSelect(bookAbbrev, parseInt(chapter), parseInt(verse));
        return;
      }
    }

    // Keyword search
    setLoading(true);
    setSearched(true);
    setError(null);
    setResults(null);
    try {
      const data = await searchBible(query, version);
      setResults(data);
    } catch (err) {
      setError('Não foi possível realizar a busca. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Pesquisar na Bíblia</h2>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ex: 'amor ao próximo' ou 'João 3:16'"
            className="flex-grow w-full px-4 py-3 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 text-white font-semibold rounded-md hover:bg-slate-900 transition-colors disabled:bg-slate-400"
          >
            {loading ? <LoadingSpinner /> : <SearchIcon className="h-5 w-5" />}
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {loading && <div className="flex justify-center items-center h-40"><LoadingSpinner /></div>}
        {error && <div className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</div>}
        
        {results && (
          <div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">
              {results.occurrence} {results.occurrence === 1 ? 'resultado encontrado' : 'resultados encontrados'}
            </h3>
            <div className="space-y-4">
              {results.verses.map((verse, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-md border border-slate-200">
                  <p className="font-serif text-lg text-slate-700">"{verse.text}"</p>
                  <button 
                    onClick={() => onVerseSelect(verse.book.abbrev.pt, verse.chapter, verse.number)}
                    className="mt-2 font-semibold text-slate-600 hover:text-slate-900 transition-colors">
                    {verse.book.name} {verse.chapter}:{verse.number}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {searched && !loading && !results && !error && (
            <p className="text-center text-slate-600 mt-8">Nenhum resultado encontrado para sua busca.</p>
        )}
      </div>
    </div>
  );
}
