import React, { useState, useEffect } from 'react';
import { DifficultyLevel, WordCardData, UserStats } from './types';
import { generateVocabulary } from './services/geminiService';
import { checkStreak, addXp } from './services/storage';
import { requestNotificationPermission, scheduleReminder } from './services/notifications';
import Flashcard from './components/Flashcard';
import GamificationBar from './components/GamificationBar';

enum View {
  LEARN = 'learn',
  PRACTICE = 'practice',
  PROFILE = 'profile'
}

const TOPICS = [
  "Café & Restaurant",
  "Public Transport",
  "Making Friends",
  "Job Interview",
  "Shopping",
  "Emergency",
  "Romance",
  "Technology"
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LEARN);
  const [level, setLevel] = useState<DifficultyLevel>(DifficultyLevel.A2);
  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);
  
  const [vocabList, setVocabList] = useState<WordCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Gamification State
  const [userStats, setUserStats] = useState<UserStats>({ xp: 0, streak: 0, lastLogin: '', cardsLearned: 0, level: 1 });

  // Quiz State
  const [quizIndex, setQuizIndex] = useState(0);

  // Initial Load: Check Streak & Load Data
  useEffect(() => {
    const stats = checkStreak();
    setUserStats(stats);
    fetchVocab();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch when filters change
  useEffect(() => {
    if (currentView === View.LEARN) {
        fetchVocab();
    }
  }, [level, selectedTopic, currentView]);

  const fetchVocab = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateVocabulary(level, selectedTopic);
      if (data.length === 0) {
        setError("Could not generate content. Please check API key.");
      }
      setVocabList(data);
      // Reset quiz index when new data loads
      setQuizIndex(0);
    } catch (e) {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizResult = (score: number) => {
      const newStats = addXp(score);
      setUserStats(newStats);
      
      // Move to next card or cycle
      if (quizIndex < vocabList.length - 1) {
          setQuizIndex(quizIndex + 1);
      } else {
          alert(`Great job! You've practiced all cards for this topic. Total XP earned this round!`);
          setQuizIndex(0); // Restart
      }
  };

  const handleNotificationSetup = async () => {
      const granted = await requestNotificationPermission();
      if (granted) {
          scheduleReminder();
          alert("Reminder set! We'll notify you to practice.");
      }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="w-12 h-12 border-4 border-french-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Consulting the French Professor...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-8 text-center">
            <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
                {error}
                <button onClick={fetchVocab} className="block w-full mt-2 text-sm underline font-bold">Retry</button>
            </div>
        </div>
      );
    }

    if (currentView === View.PRACTICE) {
        if (vocabList.length === 0) return <div className="p-8 text-center text-gray-500">No cards to practice. Go to Learn mode first.</div>;
        
        const card = vocabList[quizIndex];
        return (
            <div className="flex flex-col items-center justify-center py-8 px-4 h-full">
                <div className="w-full max-w-md mb-4 text-center">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                        Card {quizIndex + 1} / {vocabList.length}
                    </span>
                </div>
                <div className="h-[550px] w-full max-w-md">
                    <Flashcard 
                        data={card} 
                        isQuizMode={true} 
                        onResult={handleQuizResult} 
                        currentIndex={quizIndex}
                        totalCount={vocabList.length}
                    />
                </div>
            </div>
        );
    }

    if (currentView === View.PROFILE) {
        return (
            <div className="max-w-md mx-auto p-6 space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-french-blue rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                        {userStats.level}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Student Level {userStats.level}</h2>
                    <p className="text-gray-500">Total XP: {userStats.xp}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center">
                        <div className="text-3xl font-bold text-orange-500 mb-1">{userStats.streak}</div>
                        <div className="text-xs font-bold text-orange-300 uppercase">Day Streak</div>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 text-center">
                        <div className="text-3xl font-bold text-blue-500 mb-1">{userStats.cardsLearned}</div>
                        <div className="text-xs font-bold text-blue-300 uppercase">Cards Reviewed</div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <button 
                        onClick={handleNotificationSetup}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center space-x-3">
                            <span className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                            </span>
                            <span className="font-medium text-gray-700">Daily Study Reminders</span>
                        </div>
                        <span className="text-blue-500 font-bold text-sm">Enable</span>
                    </button>
                </div>
            </div>
        );
    }

    // Default: Learn View
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 pb-24">
        {vocabList.map((card, idx) => (
          <div key={idx} className="h-[550px]">
            <Flashcard data={card} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      
      {/* Gamification Top Bar */}
      <GamificationBar stats={userStats} />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 via-white to-red-600 shadow-sm flex items-center justify-center text-xs font-bold border border-gray-200">
                LF
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800">LinguaFranca</h1>
          </div>
          
          <select 
            value={level} 
            onChange={(e) => setLevel(e.target.value as DifficultyLevel)}
            className="bg-gray-100 border-none text-sm font-semibold rounded-lg py-2 px-3 focus:ring-2 focus:ring-french-blue"
          >
            {Object.values(DifficultyLevel).map(l => (
              <option key={l} value={l}>Level {l}</option>
            ))}
          </select>
        </div>
        
        {/* Topic Scroller - Only show in Learn mode */}
        {currentView === View.LEARN && (
            <div className="overflow-x-auto no-scrollbar py-2 border-t border-gray-100">
            <div className="flex space-x-2 px-4 w-max">
                {TOPICS.map(topic => (
                <button
                    key={topic}
                    onClick={() => setSelectedTopic(topic)}
                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    selectedTopic === topic 
                        ? 'bg-french-blue text-white shadow-md shadow-blue-200' 
                        : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
                >
                    {topic}
                </button>
                ))}
            </div>
            </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Mobile Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe pt-2 px-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <div className="max-w-md mx-auto flex justify-around items-center">
          <button 
            onClick={() => setCurrentView(View.LEARN)}
            className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === View.LEARN ? 'text-french-blue' : 'text-gray-400'}`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Learn</span>
          </button>

          <button 
             onClick={() => setCurrentView(View.PRACTICE)}
             className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === View.PRACTICE ? 'text-french-blue' : 'text-gray-400'}`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Practice</span>
          </button>

          <button 
             onClick={() => setCurrentView(View.PROFILE)}
             className={`flex flex-col items-center p-2 rounded-xl transition-colors ${currentView === View.PROFILE ? 'text-french-blue' : 'text-gray-400'}`}
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;