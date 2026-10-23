import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

interface AdBannerProps {
  className?: string;
  isStickyBottom?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = '', isStickyBottom = false }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous contents
    container.innerHTML = '';

    // Create iframe with full permissions to run highperformanceformat invoke.js
    const iframe = document.createElement('iframe');
    iframe.width = '320';
    iframe.height = '50';
    iframe.frameBorder = '0';
    iframe.scrolling = 'no';
    iframe.title = 'Highperformanceformat Ad 42318c49642be1616ea04c63d904ed6e';
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.className = 'w-[320px] h-[50px] border-0 mx-auto';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <base target="_blank">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: transparent;
              width: 320px;
              height: 50px;
              overflow: hidden;
            }
          </style>
        </head>
        <body>
          <script type="text/javascript">
            atOptions = {
              'key' : '42318c49642be1616ea04c63d904ed6e',
              'format' : 'iframe',
              'height' : 50,
              'width' : 320,
              'params' : {}
            };
          </script>
          <script type="text/javascript" src="https://www.highperformanceformat.com/42318c49642be1616ea04c63d904ed6e/invoke.js"></script>
        </body>
      </html>
    `;

    iframe.srcdoc = html;
    container.appendChild(iframe);
    setAdLoaded(true);
  }, []);

  if (isStickyBottom) {
    return (
      <aside aria-label="Sponsored advertisement" className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-1.5 flex flex-col items-center justify-center shadow-2xl">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Aapka Live Ad (Key: 42318c49642be1616ea04c63d904ed6e)
          </span>
          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30">
            Active 320x50
          </span>
        </div>
        <div ref={containerRef} className="w-[320px] h-[50px] overflow-hidden flex items-center justify-center bg-slate-900 rounded border border-slate-800" />
      </aside>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center my-4 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-400">
          Aapka Live Banner Ad (Highperformanceformat)
        </span>
        <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
          320x50
        </span>
      </div>

      <div className="w-[324px] p-0.5 rounded-xl bg-gradient-to-r from-emerald-500/30 via-slate-700/50 to-emerald-500/30 shadow-lg">
        <div 
          ref={containerRef}
          className="w-[320px] h-[50px] bg-slate-950 rounded-lg overflow-hidden flex items-center justify-center relative"
        />
      </div>

      <p className="text-[10px] text-slate-500 mt-1">
        Ad Key: <span className="font-mono text-slate-400">42318c49642be1616ea04c63d904ed6e</span>
      </p>
    </div>
  );
};
