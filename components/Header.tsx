
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 py-4 px-6 mb-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center">
            <span className="text-white font-serif text-xl">L</span>
          </div>
          <h1 className="text-2xl font-serif font-semibold tracking-tight">Lumière</h1>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-500 uppercase tracking-widest">
          <a href="#" className="text-zinc-900">Stylist</a>
          <a href="#" className="hover:text-zinc-900 transition-colors">Wardrobe</a>
          <a href="#" className="hover:text-zinc-900 transition-colors">Collection</a>
        </nav>
        <button className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors">
          My Account
        </button>
      </div>
    </header>
  );
};

export default Header;
