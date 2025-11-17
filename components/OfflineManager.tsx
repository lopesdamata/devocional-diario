import React, { useState, useEffect, useCallback } from 'react';
import { isVersionAvailableOffline, syncVersion } from '../services/bibleService';
import type { BibleVersion } from '../types';
import LoadingSpinner from './LoadingSpinner';
import { DownloadIcon } from './icons/DownloadIcon';

interface OfflineManagerProps {
  version: BibleVersion;
}

type SyncStatus = 'checking' | 'unavailable' | 'syncing' | 'synced' | 'error';

export default function OfflineManager({ version }: OfflineManagerProps) {
  const [status, setStatus] = useState<SyncStatus>('checking');
  const [progress, setProgress] = useState(0);

  const checkStatus = useCallback(async () => {
    if (version !== 'acf') {
      setStatus('synced'); // Non-acf versions don't have offline mode
      return;
    }
    setStatus('checking');
    try {
      const isAvailable = await isVersionAvailableOffline(version);
      setStatus(isAvailable ? 'synced' : 'unavailable');
    } catch (error) {
      console.error("Failed to check offline status:", error);
      setStatus('error');
    }
  }, [version]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleSync = async () => {
    if (version !== 'acf') return;
    setStatus('syncing');
    setProgress(0);
    try {
      await syncVersion(version, (p) => setProgress(p));
      setStatus('synced');
    } catch (error) {
      console.error("Failed to sync Bible:", error);
      setStatus('error');
    }
  };

  if (status === 'synced' || status === 'checking' || version !== 'acf') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'unavailable' && (
          <>
            <DownloadIcon className="w-16 h-16 mx-auto text-slate-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Acesso Offline Disponível</h2>
            <p className="text-slate-600 mb-6">
              Baixe a versão Almeida Corrigida Fiel (ACF) para ler e pesquisar a Bíblia a qualquer momento, mesmo sem internet.
            </p>
            <button
              onClick={handleSync}
              className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-lg hover:bg-slate-900 transition-colors"
            >
              Baixar para Uso Offline
            </button>
          </>
        )}
        {status === 'syncing' && (
          <>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Sincronizando...</h2>
            <p className="text-slate-600 mb-6">
              Por favor, aguarde enquanto baixamos os dados da Bíblia. Isso pode levar alguns instantes.
            </p>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div
                className="bg-slate-700 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.round(progress * 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-slate-500 mt-2">{Math.round(progress * 100)}%</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Ocorreu um Erro</h2>
            <p className="text-slate-600 mb-6">
              Não foi possível baixar os dados. Verifique sua conexão com a internet e tente novamente.
            </p>
            <button
              onClick={handleSync}
              className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              Tentar Novamente
            </button>
          </>
        )}
      </div>
    </div>
  );
}
