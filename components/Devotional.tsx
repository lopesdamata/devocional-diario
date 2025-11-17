import React, { useState, useEffect, useCallback } from 'react';
import { generateDevotional } from '../services/geminiService';
import type { Devotional } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { SparklesIcon } from './icons/SparklesIcon';
import { ShareIcon } from './icons/ShareIcon';
import AdBanner from './AdBanner';

export default function DevotionalComponent() {
  const [devotional, setDevotional] = useState<Devotional | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fetchDevotional = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const devotionalData = await generateDevotional();
      setDevotional(devotionalData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevotional();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleShare = async () => {
    if (!devotional) return;

    const shareText = `*Devocional Diário: ${devotional.verse}*\n\n"${devotional.verseText}"\n\n*Reflexão:*\n${devotional.reflection}\n\n*Oração:*\n${devotional.prayer}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Devocional Diário',
          text: shareText,
        });
      } catch (err) {
        console.error('Erro ao compartilhar:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Falha ao copiar para a área de transferência:', err);
        alert('Não foi possível copiar o devocional. Por favor, copie manualmente.');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-6 gap-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <SparklesIcon className="h-8 w-8 text-yellow-500" />
            Devocional Diário
          </h2>
          <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
            {devotional && !loading && (
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                <ShareIcon className="h-5 w-5" />
                {isCopied ? 'Copiado!' : 'Partilhar'}
              </button>
            )}
            <button 
              onClick={fetchDevotional}
              disabled={loading}
              className="px-4 py-2 bg-slate-700 text-white font-semibold rounded-md hover:bg-slate-800 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed">
              {loading ? 'Gerando...' : 'Novo'}
            </button>
          </div>
        </div>
        
        {loading && (
          <div className="flex flex-col items-center justify-center h-80">
            <LoadingSpinner />
            <p className="mt-4 text-slate-600">Gerando seu devocional...</p>
          </div>
        )}

        {error && (
          <div className="text-center text-red-600 bg-red-100 p-4 rounded-md border border-red-200">
            <h3 className="font-bold mb-2">Erro ao Gerar Devocional</h3>
            <p>{error}</p>
          </div>
        )}

        {devotional && !loading && (
          <div className="animate-fade-in space-y-6">
            <div className="bg-slate-100 p-6 rounded-lg">
              <blockquote className="font-serif text-xl sm:text-2xl text-slate-800 italic border-l-4 border-slate-400 pl-4">
                "{devotional.verseText}"
              </blockquote>
              <cite className="block text-right mt-2 font-semibold text-slate-600 not-italic">
                &mdash; {devotional.verse}
              </cite>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Reflexão</h3>
              <p className="text-slate-700 leading-relaxed font-serif text-lg">{devotional.reflection}</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Oração</h3>
              <p className="text-slate-700 leading-relaxed font-serif text-lg">{devotional.prayer}</p>
            </div>
          </div>
        )}
      </div>
      <AdBanner />
    </div>
  );
}
