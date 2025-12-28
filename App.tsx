
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import OutfitCard from './components/OutfitCard';
import { StylingState, OutfitCategory } from './types';
import { analyzeItem, planOutfits, generateOutfitVisual } from './services/gemini';

const App: React.FC = () => {
  const [state, setState] = useState<StylingState>({
    originalImage: null,
    analysis: null,
    outfits: [],
    isAnalyzing: false,
    isGenerating: false,
    error: null,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setState(prev => ({ 
        ...prev, 
        originalImage: base64, 
        isAnalyzing: true, 
        error: null,
        outfits: [],
        analysis: null
      }));

      try {
        const analysis = await analyzeItem(base64);
        const plannedOutfits = await planOutfits(analysis);
        
        setState(prev => ({ 
          ...prev, 
          analysis, 
          outfits: plannedOutfits, 
          isAnalyzing: false, 
          isGenerating: true 
        }));

        // Generate visuals sequentially or in parallel
        plannedOutfits.forEach(async (outfit, index) => {
          try {
            const imageUrl = await generateOutfitVisual(analysis, outfit.category as OutfitCategory, outfit.pieces);
            setState(prev => ({
              ...prev,
              outfits: prev.outfits.map((o, i) => i === index ? { ...o, imageUrl } : o)
            }));
          } catch (err) {
            console.error(`Failed to generate visual for ${outfit.category}`, err);
          }
        });

      } catch (err) {
        setState(prev => ({ ...prev, isAnalyzing: false, error: "Styling engine failed to initialize. Please try again." }));
      }
    };
    reader.readAsDataURL(file);
  };

  const updateOutfitImage = (index: number, newUrl: string) => {
    setState(prev => ({
      ...prev,
      outfits: prev.outfits.map((o, i) => i === index ? { ...o, imageUrl: newUrl } : o)
    }));
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-20">
      <Header />

      <main className="max-w-6xl mx-auto px-6">
        <section className="text-center mb-16 space-y-4">
          <h2 className="text-5xl md:text-6xl font-serif leading-tight">
            Wear your wardrobe <br />
            <span className="italic">beautifully.</span>
          </h2>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg font-light">
            Upload a difficult-to-style item and let our AI curate a collection of looks tailored to your unique piece.
          </p>
        </section>

        {!state.originalImage ? (
          <div className="max-w-xl mx-auto">
            <label className="group relative block cursor-pointer">
              <div className="aspect-[4/3] bg-white border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center p-12 transition-all hover:border-zinc-900 hover:bg-zinc-50">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Upload your piece</h3>
                <p className="text-zinc-400 text-sm">Drag and drop or click to browse</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        ) : (
          <div className="space-y-16">
            <div className="flex flex-col md:flex-row gap-12 items-start bg-white p-8 rounded-3xl border border-zinc-100">
              <div className="w-full md:w-1/3">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl relative">
                  <img src={state.originalImage} alt="Your item" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setState({ originalImage: null, analysis: null, outfits: [], isAnalyzing: false, isGenerating: false, error: null })}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 space-y-6 py-4">
                {state.isAnalyzing ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-8 bg-zinc-100 rounded-lg w-1/3"></div>
                    <div className="h-4 bg-zinc-100 rounded-lg w-full"></div>
                    <div className="h-4 bg-zinc-100 rounded-lg w-5/6"></div>
                    <div className="h-12 bg-zinc-100 rounded-lg w-1/2 mt-8"></div>
                  </div>
                ) : state.analysis ? (
                  <>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Stylist Analysis</h3>
                      <h4 className="text-3xl font-serif">{state.analysis.type}</h4>
                    </div>
                    <p className="text-zinc-600 leading-relaxed text-lg italic">"{state.analysis.description}"</p>
                    <div className="flex items-center gap-6">
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Palette</p>
                        <div className="flex gap-2">
                          {state.analysis.colorPalette.map((color, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border border-zinc-100 shadow-sm" style={{ backgroundColor: color }}></div>
                          ))}
                        </div>
                      </div>
                      <div className="h-10 w-px bg-zinc-100"></div>
                      <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Vibe</p>
                        <span className="bg-zinc-900 text-white px-3 py-1 rounded text-xs font-medium uppercase tracking-tighter">
                          {state.analysis.style}
                        </span>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {state.outfits.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {state.outfits.map((outfit, index) => (
                  <OutfitCard 
                    key={index} 
                    outfit={outfit} 
                    onUpdate={(newUrl) => updateOutfitImage(index, newUrl)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {state.error && (
          <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-center text-sm border border-red-100">
            {state.error}
          </div>
        )}
      </main>

      {/* Persistent Call to Action */}
      {state.originalImage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-white/80 backdrop-blur-xl border border-zinc-100 shadow-2xl rounded-full px-8 py-4 flex items-center gap-6">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-xs font-bold">C</div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 flex items-center justify-center text-xs font-bold">B</div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-300 flex items-center justify-center text-xs font-bold">N</div>
            </div>
            <div className="h-6 w-px bg-zinc-200"></div>
            <p className="text-sm font-medium text-zinc-800">
              {state.isAnalyzing ? "Analyzing your style..." : 
               state.outfits.some(o => !o.imageUrl) ? "Visualizing outfits..." : 
               "Looks ready for review"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
