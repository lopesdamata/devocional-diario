import React, { useEffect } from 'react';

/**
 * Declara a propriedade window.adsbygoogle para o TypeScript.
 * Isso é necessário para que o script do AdSense funcione corretamente em um ambiente TypeScript.
 */
declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

/**
 * Componente de banner de anúncio para o Google AdSense.
 * 
 * PASSO 2: INTEGRE O CÓDIGO DO ANÚNCIO
 * Substitua os valores de espaço reservado abaixo pelos seus IDs reais do AdSense
 * depois que seu bloco de anúncios for criado.
 */
export default function AdBanner() {
  useEffect(() => {
    // Este efeito aciona o script do AdSense para carregar um anúncio no espaço <ins>.
    // O try-catch está aqui para evitar que o aplicativo quebre se houver
    // um problema com o script do AdSense (por exemplo, bloqueadores de anúncios).
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <div className="mt-8 flex justify-center" aria-label="Anúncio">
      {/* 
        Este é o seu bloco de anúncios.
        - Substitua 'ca-pub-XXXXXXXXXXXXXXXX' pelo seu ID de cliente do AdSense.
        - Substitua 'YYYYYYYYYY' pelo ID do slot do seu bloco de anúncios.
      */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: '728px', minHeight: '90px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // <-- SUBSTITUA PELO SEU ID DE CLIENTE
        data-ad-slot="YYYYYYYYYY"             // <-- SUBSTITUA PELO SEU ID DE SLOT DE ANÚNCIO
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
