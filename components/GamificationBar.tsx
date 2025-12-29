import React from 'react';
import { UserStats } from '../types';

interface Props {
  stats: UserStats;
}

const GamificationBar: React.FC<Props> = ({ stats }) => {
  const progress = (stats.xp % 100); // Progress to next level (assuming 100xp per level)

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shadow-sm sticky top-[60px] z-40">
      <div className="flex items-center space-x-4">
        {/* Level Badge */}
        <div className="flex items-center space-x-1 bg-french-blue/10 text-french-blue px-3 py-1 rounded-full">
            <span className="text-xs font-bold uppercase">Lvl</span>
            <span className="font-extrabold text-sm">{stats.level}</span>
        </div>
        
        {/* XP Progress */}
        <div className="hidden md:flex flex-col w-32">
            <div className="flex justify-between text-[10px] text-gray-500 font-semibold mb-1">
                <span>{stats.xp} XP</span>
                <span>Next: {stats.level * 100}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-gradient-to-r from-french-blue to-blue-400 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
      </div>

      {/* Streak */}
      <div className="flex items-center space-x-1 text-orange-500">
        <svg className="w-5 h-5 fill-current animate-pulse" viewBox="0 0 24 24">
            <path d="M17.657 5.304c-3.125-3.125-8.189-3.125-11.313 0a8.003 8.003 0 000 11.313L12 22.284l5.657-5.657a8.003 8.003 0 000-11.313zM12 18.042l-4.243-4.243a6 6 0 118.485 0L12 18.042z"/>
            <path d="M12 2.75a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5a.75.75 0 01.75-.75zM5.636 4.636a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061z" opacity="0.5"/>
            <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
        </svg>
        <span className="font-bold">{stats.streak} Day Streak</span>
      </div>
    </div>
  );
};

export default GamificationBar;