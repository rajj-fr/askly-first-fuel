import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Share2, 
  Copy, 
  Download, 
  Eye, 
  MessageSquare, 
  Trash2, 
  Check, 
  Lock, 
  ChevronRight, 
  User, 
  Plus, 
  ExternalLink,
  ShieldAlert,
  Instagram,
  BarChart3,
  LogOut,
  RefreshCw,
  QrCode
} from 'lucide-react';

// --- MAIN APPLICATION COMPONENT ---
export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'create', 'dashboard', 'story', 'public'
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // User Authentication State (Demo Mock)
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState({
    username: 'firstfuel_creator',
    displayName: 'First Fuel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  });

  // Sample Database State
  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      slug: '8xK29Lm',
      text: "Tell me something you've never told me 👀",
      views: 384,
      createdAt: '2 hours ago',
      anonymousOnly: true,
      answers: [
        { id: 'a1', text: "You are actually really funny 😂", author: "Anonymous", time: "2 min ago", isRead: false },
        { id: 'a2', text: "I've had a crush on you since last year...", author: "Anonymous", time: "8 min ago", isRead: false },
        { id: 'a3', text: "Bro you're totally underrated 🔥", author: "Anonymous", time: "15 min ago", isRead: true },
        { id: 'a4', text: "Your aesthetic and design sense is insane!", author: "Anonymous", time: "1 hour ago", isRead: true },
      ]
    },
    {
      id: 'q2',
      slug: '9pM34Xy',
      text: "What's one thing I should improve about myself? 💭",
      views: 120,
      createdAt: '1 day ago',
      anonymousOnly: false,
      answers: [
        { id: 'a5', text: "Post more on Instagram! Love your content.", author: "@arjun_dev", time: "5 hours ago", isRead: true }
      ]
    }
  ]);

  // Toast Notification Helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Switch to Public Question View Handler
  const openPublicView = (q) => {
    setSelectedQuestion(q);
    setActiveTab('public');
  };

  // Switch to Story Generator View Handler
  const openStoryGenerator = (q) => {
    setSelectedQuestion(q);
    setActiveTab('story');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-gray-100 font-sans selection:bg-purple-500 selection:text-white flex flex-col justify-between">
      
      {/* Dynamic Toast System */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-purple-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-purple-400/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER / NAVIGATION BAR */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0A0A0C]/80 border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-blue-500 p-[2px] transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0A0A0C] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-gray-200 to-purple-400 bg-clip-text text-transparent">
                ASKLY
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-purple-400 font-bold -mt-1">
                By First Fuel
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <button 
              onClick={() => setActiveTab('home')} 
              className={`hover:text-white transition-colors ${activeTab === 'home' ? 'text-white font-semibold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('create')} 
              className={`hover:text-white transition-colors ${activeTab === 'create' ? 'text-white font-semibold' : ''}`}
            >
              Create Ask
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`hover:text-white transition-colors ${activeTab === 'dashboard' ? 'text-white font-semibold' : ''}`}
            >
              Dashboard
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1.5 pr-4 rounded-full">
                <img src={currentUser.avatar} alt="Profile" className="w-7 h-7 rounded-full object-cover" />
                <span className="text-xs font-semibold text-gray-200 hidden sm:inline">@{currentUser.username}</span>
                <button 
                  onClick={() => setActiveTab('dashboard')} 
                  className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1 rounded-full font-medium transition-all"
                >
                  Inbox
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsLoggedIn(true)} 
                className="bg-white text-black font-semibold text-sm px-5 py-2 rounded-full hover:bg-gray-200 transition-all"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT ROUTER */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <LandingPage 
            onStart={() => setActiveTab('create')} 
            onDemo={() => openPublicView(questions[0])}
            questions={questions}
          />
        )}

        {activeTab === 'create' && (
          <CreateQuestionPage 
            onCreated={(newQ) => {
              setQuestions([newQ, ...questions]);
              showToast("Question created successfully! 🎉");
              openStoryGenerator(newQ);
            }} 
          />
        )}

        {activeTab === 'dashboard' && (
          <OwnerDashboard 
            questions={questions} 
            onOpenStory={openStoryGenerator}
            onOpenPublic={openPublicView}
            showToast={showToast}
            onDeleteQuestion={(id) => {
              setQuestions(questions.filter(q => q.id !== id));
              showToast("Question deleted");
            }}
          />
        )}

        {activeTab === 'story' && selectedQuestion && (
          <StoryCardGenerator 
            question={selectedQuestion} 
            showToast={showToast}
            onBack={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'public' && selectedQuestion && (
          <PublicQuestionPage 
            question={selectedQuestion} 
            showToast={showToast}
            onAnswerSubmit={(ansText) => {
              const updated = questions.map(q => {
                if (q.id === selectedQuestion.id) {
                  return {
                    ...q,
                    answers: [{
                      id: 'a' + Date.now(),
                      text: ansText,
                      author: "Anonymous",
                      time: "Just now",
                      isRead: false
                    }, ...q.answers]
                  }
                }
                return q;
              });
              setQuestions(updated);
            }}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 px-6 bg-[#070709]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-300">ASKLY</span>
            <span>—</span>
            <span className="text-purple-400 font-semibold">Created by First Fuel</span>
          </div>
          <p>© 2026 First Fuel. Premium Social Q&A Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- LANDING PAGE COMPONENT ---
function LandingPage({ onStart, onDemo }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center">
      
      {/* First Fuel Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-8 animate-pulse">
        <Sparkles className="w-4 h-4 text-purple-400" />
        YOUR QUESTIONS. THEIR ANSWERS. — CREATED BY FIRST FUEL
      </div>

      {/* Hero Heading */}
      <h1 className="text-5xl sm:text-7xl font-black text-center tracking-tight leading-tight max-w-4xl mb-6">
        Ask anything. <br />
        <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-400 bg-clip-text text-transparent">
          Hear everything.
        </span>
      </h1>

      <p className="text-gray-400 text-lg sm:text-xl text-center max-w-2xl mb-10 leading-relaxed">
        Create a customized question card, share it seamlessly to your Instagram Story, and collect honest answers in your private dashboard.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
        <button 
          onClick={onStart}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-purple-600/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          Create a Question <ChevronRight className="w-5 h-5" />
        </button>
        <button 
          onClick={onDemo}
          className="bg-white/5 hover:bg-white/10 text-white font-semibold text-lg px-8 py-4 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2"
        >
          Explore Demo
        </button>
      </div>

      {/* Interactive Story Mockup Banner */}
      <div className="w-full max-w-4xl bg-gradient-to-b from-purple-900/20 to-black/40 p-8 rounded-3xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-purple-400">Live Mock Preview</span>
          <h3 className="text-2xl font-bold text-white mt-1">Instagram Story Integration</h3>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          
          {/* Card Mockup */}
          <div className="w-72 h-[420px] bg-gradient-to-b from-purple-900 via-indigo-950 to-black rounded-3xl p-6 border border-purple-500/30 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:scale-105 transition-all">
            <div className="flex justify-between items-center text-xs text-purple-300 font-bold">
              <span>ASKLY</span>
              <span className="text-[10px] opacity-70">First Fuel</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center">
              <span className="text-3xl mb-2 block">👀</span>
              <p className="text-white font-bold text-sm leading-snug">
                "Tell me something you've never told me 👀"
              </p>
            </div>

            <div className="text-center">
              <span className="bg-white/20 text-white text-[11px] font-semibold px-4 py-1.5 rounded-full backdrop-blur-sm">
                Tap link to answer anonymously
              </span>
            </div>
          </div>

          {/* Incoming Answers Floating List */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md animate-fade-in">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-purple-400">@arjun</span>
                <span className="text-[10px] text-gray-500">2 min ago</span>
              </div>
              <p className="text-sm text-gray-200">"You are actually really funny 😂"</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-pink-400">@simran</span>
                <span className="text-[10px] text-gray-500">8 min ago</span>
              </div>
              <p className="text-sm text-gray-200">"I've had a crush on you..."</p>
            </div>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-blue-400">@rahul</span>
                <span className="text-[10px] text-gray-500">15 min ago</span>
              </div>
              <p className="text-sm text-gray-200">"Bro you're underrated 🔥"</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- CREATE QUESTION PAGE ---
function CreateQuestionPage({ onCreated }) {
  const [questionText, setQuestionText] = useState('');
  const [anonymousOnly, setAnonymousOnly] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQuestion = {
      id: 'q_' + Date.now(),
      slug: Math.random().toString(36).substring(2, 9),
      text: questionText,
      views: 1,
      createdAt: 'Just now',
      anonymousOnly: anonymousOnly,
      answers: []
    };

    onCreated(newQuestion);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-16">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Create your Question</h2>
        <p className="text-gray-400 text-sm mb-6">Ask your friends and followers anything secretly.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
              What's on your mind?
            </label>
            <textarea 
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Tell me something you've never told me 👀"
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all h-32 resize-none"
              maxLength={150}
            />
            <span className="text-xs text-gray-500 float-right mt-1">{questionText.length}/150</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Anonymous Answers Only</p>
              <p className="text-xs text-gray-500">Hide the names of users who respond</p>
            </div>
            <input 
              type="checkbox" 
              checked={anonymousOnly}
              onChange={(e) => setAnonymousOnly(e.target.checked)}
              className="w-5 h-5 accent-purple-600 cursor-pointer"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-2xl shadow-lg transition-all"
          >
            Create Question →
          </button>
        </form>
      </div>
    </div>
  );
}

// --- OWNER DASHBOARD ---
function OwnerDashboard({ questions, onOpenStory, onOpenPublic, showToast, onDeleteQuestion }) {
  const totalQuestions = questions.length;
  const totalAnswers = questions.reduce((acc, q) => acc + q.answers.length, 0);
  const totalViews = questions.reduce((acc, q) => acc + q.views, 0);

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      
      {/* Title & Stats */}
      <div className="mb-10">
        <h1 className="text-3xl font-black text-white mb-2">Private Owner Dashboard</h1>
        <p className="text-gray-400 text-sm">Created by First Fuel — Private response viewer</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Questions</span>
            <p className="text-3xl font-black text-white mt-1">{totalQuestions}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
            <span className="text-xs font-bold text-purple-400 uppercase">Answers Received</span>
            <p className="text-3xl font-black text-purple-400 mt-1">{totalAnswers}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
            <span className="text-xs font-bold text-gray-400 uppercase">Total Views</span>
            <p className="text-3xl font-black text-white mt-1">{totalViews}</p>
          </div>
        </div>
      </div>

      {/* Questions & Responses Inbox */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" /> My Questions & Answers
        </h2>

        {questions.map((q) => (
          <div key={q.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl">
            
            {/* Question Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Active Ask</span>
                <h3 className="text-lg font-bold text-white mt-1">"{q.text}"</h3>
                <span className="text-xs text-gray-500 mt-1 block">Created {q.createdAt} • {q.views} Views</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button 
                  onClick={() => onOpenStory(q)}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <Instagram className="w-4 h-4" /> Story Card
                </button>
                <button 
                  onClick={() => onOpenPublic(q)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" /> Link
                </button>
                <button 
                  onClick={() => onDeleteQuestion(q.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs p-2.5 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Answers List */}
            <div className="mt-6">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-4">
                Received Answers ({q.answers.length})
              </span>

              {q.answers.length === 0 ? (
                <p className="text-gray-500 text-sm py-4 italic">No answers yet 👀 Share your link on Instagram!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.answers.map((ans) => (
                    <div key={ans.id} className="bg-black/40 border border-white/10 p-4 rounded-2xl relative">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-purple-300">{ans.author}</span>
                        <span className="text-[10px] text-gray-500">{ans.time}</span>
                      </div>
                      <p className="text-sm text-gray-200">{ans.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

// --- STORY CARD GENERATOR COMPONENT (1080x1920 CANVAS) ---
function StoryCardGenerator({ question, showToast, onBack }) {
  const canvasRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState('purple');

  const themes = {
    purple: { bg1: '#3b0764', bg2: '#000000', text: '#ffffff', cardBg: 'rgba(255,255,255,0.1)' },
    midnight: { bg1: '#0f172a', bg2: '#020617', text: '#ffffff', cardBg: 'rgba(255,255,255,0.05)' },
    neon: { bg1: '#831843', bg2: '#000000', text: '#ffffff', cardBg: 'rgba(255,255,255,0.12)' },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Canvas Dimensions 1080x1920
    canvas.width = 1080;
    canvas.height = 1920;

    const theme = themes[selectedTheme];

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, theme.bg1);
    gradient.addColorStop(1, theme.bg2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Question Box (Glassmorphic Mock)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.roundRect(140, 600, 800, 620, 40);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Top Branding
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASKLY', 540, 720);

    // Question Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px Inter, sans-serif';
    
    // Multi-line Text Wrap Helper
    const words = question.text.split(' ');
    let line = '';
    let y = 860;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > 700 && n > 0) {
        ctx.fillText(line, 540, y);
        line = words[n] + ' ';
        y += 70;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    // Instruction Tag
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText('Tap link to answer anonymously 💬', 540, 1120);

    // Footer Watermark
    ctx.fillStyle = '#6b7280';
    ctx.font = '28px Inter, sans-serif';
    ctx.fillText('Created by First Fuel', 540, 1800);

  }, [selectedTheme, question]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `askly-story-${question.slug}.png`;
    link.href = canvas.toDataURL();
    link.click();
    showToast("Story card downloaded! Ready to post on Instagram 📸");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <button onClick={onBack} className="text-xs font-bold text-gray-400 hover:text-white mb-6 block">
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Canvas Render Area */}
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef} 
            className="w-72 h-[512px] rounded-3xl border border-white/20 shadow-2xl"
          />
        </div>

        {/* Story Customizer Controls */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Story Card Generator</h2>
            <p className="text-xs text-gray-400">1080 × 1920 Instagram Story Ready • First Fuel Edition</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-400 uppercase mb-3">Select Theme</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setSelectedTheme('purple')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${selectedTheme === 'purple' ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-white/10 text-gray-400'}`}
              >
                Purple Glow
              </button>
              <button 
                onClick={() => setSelectedTheme('midnight')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${selectedTheme === 'midnight' ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-white/10 text-gray-400'}`}
              >
                Midnight
              </button>
              <button 
                onClick={() => setSelectedTheme('neon')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border ${selectedTheme === 'neon' ? 'border-purple-500 bg-purple-500/20 text-white' : 'border-white/10 text-gray-400'}`}
              >
                Neon Cyber
              </button>
            </div>
          </div>

          <button 
            onClick={handleDownload}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl"
          >
            <Download className="w-5 h-5" /> Download Story Image
          </button>
        </div>

      </div>
    </div>
  );
}

// --- PUBLIC QUESTION ANSWER PORTAL ---
function PublicQuestionPage({ question, showToast, onAnswerSubmit }) {
  const [answerText, setAnswerText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    onAnswerSubmit(answerText);
    setSubmitted(true);
    showToast("Answer sent successfully! ✨");
  };

  return (
    <div className="max-w-md mx-auto px-6 py-20">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl text-center">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" /> ASKLY Portal
        </div>

        <h2 className="text-xl font-bold text-white mb-6">"{question.text}"</h2>

        {submitted ? (
          <div className="py-8 space-y-4">
            <span className="text-4xl block">✨</span>
            <p className="text-lg font-bold text-white">Answer Sent!</p>
            <p className="text-xs text-gray-400">Your response has been sent anonymously to the owner.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea 
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Send an anonymous answer..."
              className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 transition-all h-32 resize-none"
            />
            <button 
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-2xl transition-all"
            >
              Send Answer ✨
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
