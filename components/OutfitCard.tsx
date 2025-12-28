
import React, { useState } from 'react';
import { OutfitSuggestion } from '../types';
import { editOutfitImage } from '../services/gemini';

interface OutfitCardProps {
  outfit: OutfitSuggestion;
  onUpdate: (newUrl: string) => void;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPrompt.trim() || !outfit.imageUrl) return;

    setIsProcessing(true);
    try {
      const updatedUrl = await editOutfitImage(outfit.imageUrl, editPrompt);
      onUpdate(updatedUrl);
      setEditPrompt('');
      setIsEditing(false);
    } catch (err) {
      console.error("Edit failed", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 transition-all hover:shadow-xl">
      <div className="relative aspect-[4/5] bg-zinc-50 overflow-hidden">
        {outfit.imageUrl ? (
          <img 
            src={outfit.imageUrl} 
            alt={outfit.category} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-zinc-200 border-t-zinc-800 rounded-full mx-auto mb-4"></div>
              <p className="text-sm text-zinc-400 font-medium">Curating your {outfit.category.toLowerCase()} look...</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-100 shadow-sm">
            {outfit.category}
          </span>
        </div>

        {outfit.imageUrl && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-6">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-white text-zinc-900 px-6 py-2 rounded-full font-medium text-sm transform translate-y-4 group-hover:translate-y-0 transition-transform"
              >
                Refine with AI
              </button>
            ) : (
              <form onSubmit={handleEdit} className="w-full space-y-3 bg-white p-4 rounded-xl shadow-2xl">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">Edit Command</p>
                <input 
                  autoFocus
                  type="text"
                  placeholder="e.g. 'Add a retro film filter' or 'Make it more edgy'"
                  className="w-full text-sm border-b border-zinc-200 py-2 focus:outline-none focus:border-zinc-900"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  disabled={isProcessing}
                />
                <div className="flex gap-2">
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 bg-zinc-900 text-white text-xs py-2 rounded-lg hover:bg-zinc-800 disabled:opacity-50"
                  >
                    {isProcessing ? 'Styling...' : 'Apply'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 text-xs font-medium text-zinc-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-serif text-xl mb-2">{outfit.category} Look</h3>
        <p className="text-zinc-500 text-sm leading-relaxed mb-4">{outfit.description}</p>
        <div className="flex flex-wrap gap-2">
          {outfit.pieces.map((piece, i) => (
            <span key={i} className="text-[10px] bg-zinc-50 border border-zinc-100 px-2 py-0.5 rounded text-zinc-600">
              {piece}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OutfitCard;
