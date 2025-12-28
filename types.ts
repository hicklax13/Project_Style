
export type OutfitCategory = 'Casual' | 'Business' | 'Night Out';

export interface OutfitSuggestion {
  category: OutfitCategory;
  description: string;
  pieces: string[];
  imageUrl?: string;
}

export interface ItemAnalysis {
  type: string;
  colorPalette: string[];
  style: string;
  description: string;
}

export interface StylingState {
  originalImage: string | null;
  analysis: ItemAnalysis | null;
  outfits: OutfitSuggestion[];
  isAnalyzing: boolean;
  isGenerating: boolean;
  error: string | null;
}
