import React, { useState } from 'react';
import { generatePronunciation } from '../services/geminiService';
import { playAudio as playAudioUtil } from '../services/audioUtils';
import { PhraseContext } from '../types';

interface AudioButtonProps {
  text: string;
  context: PhraseContext;
  size?: 'sm' | 'md' | 'lg';
}

const AudioButton: React.FC<AudioButtonProps> = ({ text, context, size = 'md' }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const base64Audio = await generatePronunciation(text, context);
      if (base64Audio) {
        await playAudioUtil(base64Audio);
      }
    } catch (error) {
      console.error("Playback failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`rounded-full p-2 transition-all duration-200 ${
        isLoading ? 'bg-gray-200 cursor-wait' : 'bg-french-blue/10 hover:bg-french-blue/20 text-french-blue'
      }`}
      aria-label="Play pronunciation"
    >
      {isLoading ? (
        <svg className={`animate-spin ${iconSize}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg className={iconSize} fill="currentColor" viewBox="0 0 24 24">
           <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 6.5 6.5 0 000-9.192.75.75 0 010-1.06z" />
           <path d="M16.463 8.288a.75.75 0 011.06 0 2.409 2.409 0 010 3.408.75.75 0 11-1.06-1.06 1.009 1.009 0 000-1.428.75.75 0 010-1.06z" />
        </svg>
      )}
    </button>
  );
};

export default AudioButton;