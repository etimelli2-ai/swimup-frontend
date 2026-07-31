// ============================================================
// 📁 frontend/src/components/AvisCard.jsx — NOUVEAU (redesign)
// ============================================================

import { useState } from 'react';
import { Star, MapPin, Clock, ExternalLink, Copy, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AvisCard({ avis, onReserve, isReserving, index = 0 }) {
  const [copied, setCopied] = useState(false);
  const nbEtoiles = parseInt(avis.nb_etoiles) || 5;

  const handleCopy = () => {
    navigator.clipboard.writeText(avis.texte);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const etoileColor = nbEtoiles <= 2 ? 'text-red-500' : nbEtoiles === 3 ? 'text-amber-500' : 'text-emerald-500';
  const etoileBg = nbEtoiles <= 2 ? 'bg-red-50 border-red-100' : nbEtoiles === 3 ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all duration-200 group"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-800 text-base truncate">{avis.nom_societe}</h3>
          <div className="flex items-center gap-1 mt-1 text-slate-400 text-xs">
            <MapPin size={11} />
            <span className="truncate max-w-[220px]">{avis.lien_maps}</span>
          </div>
        </div>
        <span className="text-lg font-extrabold text-sky-600 ml-3 shrink-0">
          +{parseFloat(avis.prix).toFixed(2)} €
        </span>
      </div>

      {/* Étoiles */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${etoileBg} mb-3`}>
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(n => (
            <Star 
              key={n} 
              size={13} 
              className={n <= nbEtoiles ? `${etoileColor} fill-current` : 'text-slate-300'} 
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${etoileColor}`}>
          {nbEtoiles} étoile{nbEtoiles > 1 ? 's' : ''}
        </span>
      </div>

      {/* Texte */}
      <div className="bg-slate-50 rounded-lg p-3 mb-3 relative group/text">
        <p className="text-sm text-slate-600 italic leading-relaxed pr-8 line-clamp-3">
          &ldquo;{avis.texte}&rdquo;
        </p>
        <button 
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md bg-white border border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-200 transition-all"
          title="Copier le texte"
        >
          {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
        </button>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock size={11} />
          <span>Délai : {avis.delai_paiement}j</span>
        </div>
        <div className="flex gap-2">
          <a 
            href={avis.lien_maps} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <ExternalLink size={11} />
            Maps
          </a>
          <button
            onClick={() => onReserve(avis.id)}
            disabled={isReserving}
            className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-semibold text-white bg-sky-500 rounded-lg hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
          >
            {isReserving ? (
              <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Réserver
                <ArrowRight size={11} />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
