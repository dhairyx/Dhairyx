import React, { useState, useEffect } from 'react';
import { WordCardData, PhraseContext } from '../types';
import AudioButton from './AudioButton';

interface FlashcardProps {
  data: WordCardData;
  isQuizMode?: boolean;
  onResult?: (score: number) => void;
  currentIndex?: number;
  totalCount?: number;
}

const Flashcard: React.FC<FlashcardProps> = ({ 
  data, 
  isQuizMode = false, 
  onResult,
  currentIndex = 0,
  totalCount = 0
}) => {
  const [activeTab, setActiveTab] = useState<PhraseContext>(PhraseContext.FORMAL);
  const [isRevealed, setIsRevealed] = useState(!isQuizMode);

  // Reset revealed state when data changes in quiz mode
  useEffect(() => {
    if (isQuizMode) {
      setIsRevealed(false);
    } else {
      setIsRevealed(true);
    }
  }, [data, isQuizMode]);

  const currentVariant = 
    activeTab === PhraseContext.FORMAL ? data.variations.formal :
    activeTab === PhraseContext.INFORMAL ? data.variations.informal :
    data.variations.slang;

  const handleRate = (score: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onResult) onResult(score);
  };

  const progressPercentage = totalCount > 0 ? ((currentIndex + 1) / totalCount) * 100 : 0;

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-full relative group">
      
      {/* Quiz Overlay / Header */}
      <div className={`bg-gradient-to-r from-french-blue to-blue-600 p-6 text-white text-center transition-all duration-300 ${isQuizMode && !isRevealed ? 'h-full flex flex-col justify-center items-center' : ''}`}>
        <h2 className={`font-bold mb-1 transition-all ${isQuizMode && !isRevealed ? 'text-4xl' : 'text-3xl'}`}>
          {data.word}
        </h2>
        {(!isQuizMode || isRevealed) && (
             <p className="text-blue-100 italic animate-fadeIn">{data.meaning}</p>
        )}
        
        {isQuizMode && !isRevealed && (
            <div className="mt-8">
                <button 
                    onClick={() => setIsRevealed(true)}
                    className="bg-white text-french-blue font-bold py-3 px-8 rounded-full shadow-lg hover:scale-105 transition-transform"
                >
                    Reveal Answer
                </button>
            </div>
        )}
      </div>

      {/* Tabs - Hide in quiz mode until revealed */}
      <div className={`flex bg-gray-50 border-b border-gray-200 ${isQuizMode && !isRevealed ? 'hidden' : ''}`}>
        {Object.values(PhraseContext).map((context) => (
          <button
            key={context}
            onClick={() => setActiveTab(context)}
            className={`flex-1 py-3 text-sm font-semibold tracking-wide transition-colors duration-200 ${
              activeTab === context 
                ? 'text-french-blue border-b-2 border-french-blue bg-white' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {context}
          </button>
        ))}
      </div>

      {/* Content - Hidden in quiz mode until revealed */}
      <div className={`p-6 flex-1 flex flex-col justify-between space-y-4 ${isQuizMode && !isRevealed ? 'hidden' : ''}`}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
              activeTab === PhraseContext.FORMAL ? 'bg-blue-100 text-blue-800' :
              activeTab === PhraseContext.INFORMAL ? 'bg-green-100 text-green-800' :
              'bg-purple-100 text-purple-800'
            }`}>
              {currentVariant.context}
            </span>
            <AudioButton text={currentVariant.french} context={activeTab} />
          </div>

          <div className="mb-6">
            <div className="flex items-baseline flex-wrap gap-2 mb-1">
              <p className="text-2xl font-medium text-gray-800">{currentVariant.french}</p>
              <span className="text-gray-400 font-mono text-sm">/{currentVariant.phonetic}/</span>
            </div>
            <p className="text-gray-500 text-sm">{currentVariant.english}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
             <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Example</h4>
             <p className="text-gray-700 italic">"{currentVariant.example}"</p>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-1">Pronunciation Tip</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {currentVariant.pronunciationTips}
          </p>
        </div>
        
        {/* Gamification Buttons for Quiz Mode */}
        {isQuizMode && isRevealed && (
             <div className="pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                 <button onClick={(e) => handleRate(10, e)} className="bg-red-100 text-red-700 py-2 rounded-lg text-sm font-bold hover:bg-red-200">Hard</button>
                 <button onClick={(e) => handleRate(15, e)} className="bg-yellow-100 text-yellow-700 py-2 rounded-lg text-sm font-bold hover:bg-yellow-200">Okay</button>
                 <button onClick={(e) => handleRate(25, e)} className="bg-green-100 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-200">Easy!</button>
             </div>
        )}
      </div>

      {/* Visual Progress Bar (Quiz mode only) */}
      {isQuizMode && (
        <div className="h-1.5 w-full bg-gray-100">
          <div 
            className="h-full bg-french-blue transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Flashcard;