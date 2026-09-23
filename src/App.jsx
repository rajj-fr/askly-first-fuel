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
  ChevronRight, 
  Instagram, 
  ExternalLink,
  Sun,
  Moon,
  Palette,
  User
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const [questions, setQuestions] = useState([
    {
      id: 'q1',
      slug: '8xK29Lm',
      text: "Tell me something you've never told me 👀",
      views: 384,
      createdAt: '2 hours ago',
      answers: [
        { id: 'a1', text: "You are actually really funny 😂", author: "@arjun_dev", time: "2 min ago" },
        { id: 'a2', text: "I've had a crush on you since last year...", author: "Anonymous", time: "8 min ago" }
      ]
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openPublicView = (q) => {
    setSelectedQuestion(q);
    setActiveTab('public');
  };

  const openStoryGenerator = (q) => {
    setSelectedQuestion(q);
    setActiveTab('story');
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] text-gray-100 font-sans flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-purple-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-purple-400/30 animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0F0F12]/80 border-b border-white/10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div onClick={() => setActiveTab('home')} className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-pink-400 to-amber-300 p-[2px]">
              <div className="w-full h-full bg-[#0F0F12] rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-400" />
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

          <nav className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <button 
              onClick={() => setActiveTab('home')} 
              className={`hover:text-white ${activeTab === 'home' ? 'text-white font-semibold' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => setActiveTab('create')} 
              className={`hover:text-white ${activeTab === 'create' ? 'text-white font-semibold' : ''}`}
            >
              Create
            </button>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className={`hover:text-white ${activeTab === 'dashboard' ? 'text-white font-semibold' : ''}`}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT ROUTER */}
      <main className="flex-grow">
        {activeTab === 'home' && (
          <LandingPage 
            onStart={() => setActiveTab('create')} 
            onDemo={() => openPublicView(questions[0])}
          />
        )}

        {activeTab === 'create' && (
          <CreateQuestionPage 
            onCreated={(newQ) => {
              setQuestions([newQ, ...questions]);
              showToast("Question created! Copy your link below 🎉");
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
            onAnswerSubmit={(ansText, instaUser) => {
              const updated = questions.map(q => {
                if (q.id === selectedQuestion.id) {
                  return {
                    ...q,
                    answers: [{
                      id: 'a' + Date.now(),
                      text: ansText,
                      author: instaUser ? (instaUser.startsWith('@') ? instaUser : `@${instaUser}`) : "Anonymous",
                      time: "Just now"
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

      <footer className="border-t border-white/10 py-6 px-6 text-center text-xs text-gray-500">
        <p>© 2026 First Fuel. Premium Social Q&A Platform.</p>
      </footer>
    </div>
  );
}

// --- LANDING PAGE ---
function LandingPage({ onStart, onDemo }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-widest mb-6">
        <Sparkles className="w-4 h-4 text-purple-400" /> CREATED BY FIRST FUEL
      </div>

      <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-6">
        Ask anything. <br />
        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
          Hear everything.
        </span>
      </h1>

      <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-8">
        Create beautiful question cards, download for Instagram stories, and receive answers with Instagram usernames!
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button 
          onClick={onStart}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all"
        >
          Create Your Question →
        </button>
      </div>
    </div>
  );
}

// --- CREATE QUESTION PAGE ---
function CreateQuestionPage({ onCreated }) {
  const [questionText, setQuestionText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQuestion = {
      id: 'q_' + Date.now(),
      slug: Math.random().toString(36).substring(2, 8),
      text: questionText,
      views: 1,
      createdAt: 'Just now',
      answers: []
    };

    onCreated(newQuestion);
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
        <h2 className="text-2xl font-bold text-white mb-2">Create New Ask</h2>
        <p className="text-gray-400 text-sm mb-6">Type a question you want people to answer.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <textarea 
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Tell me something you've never told me 👀"
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 h-32 resize-none"
              maxLength={150}
            />
            <span className="text-xs text-gray-500 float-right mt-1">{questionText.length}/150</span>
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 transition-all"
          >
            Generate Story & Link →
          </button>
        </form>
      </div>
    </div>
  );
}

// --- OWNER DASHBOARD ---
function OwnerDashboard({ questions, onOpenStory, onOpenPublic, showToast, onDeleteQuestion }) {
  const copyLink = (slug) => {
    const url = `${window.location.origin}?q=${slug}`;
    navigator.clipboard.writeText(url);
    showToast("Answer Link copied! Share on IG Story Sticker 🔗");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-black text-white mb-6">Your Questions & Answers</h1>

      <div className="space-y-6">
        {questions.map((q) => {
          return (
            <div key={q.id} className="bg-white/5 border border-white/10 rounded-3xl p-6">
              
              <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">"{q.text}"</h3>
                  <span className="text-xs text-gray-400 mt-1 block">Slug: {q.slug}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button 
                    onClick={() => copyLink(q.slug)}
                    className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Link
                  </button>
                  <button 
                    onClick={() => onOpenStory(q)}
                    className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5"
                  >
                    <Instagram className="w-3.5 h-3.5" /> Story Card
                  </button>
                  <button 
                    onClick={() => onDeleteQuestion(q.id)}
                    className="bg-red-500/10 text-red-400 text-xs p-2 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Answers with Instagram Usernames */}
              <div className="mt-4">
                <span className="text-xs font-semibold text-gray-400 mb-3 block">
                  Answers ({q.answers.length})
                </span>
                {q.answers.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">No answers yet. Share your link on IG Story!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.answers.map((ans) => (
                      <div key={ans.id} className="bg-black/40 border border-white/10 p-3.5 rounded-2xl">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-pink-400 flex items-center gap-1">
                            <Instagram className="w-3 h-3 text-pink-400" /> {ans.author}
                          </span>
                          <span className="text-[10px] text-gray-500">{ans.time}</span>
                        </div>
                        <p className="text-xs text-gray-200">{ans.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- STORY CARD GENERATOR ---
function StoryCardGenerator({ question, showToast, onBack }) {
  const canvasRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState('lightPink');
  const [generatedImgUrl, setGeneratedImgUrl] = useState('');

  const themes = {
    lightPink: { name: 'Pastel Pink 🌸', bg1: '#FFE5EC', bg2: '#FFB3C6', text: '#590D22', cardBg: '#FFFFFF', cardText: '#590D22', badgeBg: '#FF80A0', isLight: true },
    lightMint: { name: 'Fresh Mint 🍃', bg1: '#E8F5E9', bg2: '#C8E6C9', text: '#1B5E20', cardBg: '#FFFFFF', cardText: '#1B5E20', badgeBg: '#66BB6A', isLight: true },
    lightMinimal: { name: 'Clean White 🤍', bg1: '#F8FAFC', bg2: '#E2E8F0', text: '#0F172A', cardBg: '#FFFFFF', cardText: '#0F172A', badgeBg: '#64748B', isLight: true },
    darkPurple: { name: 'Neon Purple 🔮', bg1: '#2E1065', bg2: '#090514', text: '#FFFFFF', cardBg: 'rgba(255,255,255,0.12)', cardText: '#FFFFFF', badgeBg: '#A855F7', isLight: false },
    darkMidnight: { name: 'Midnight 🌌', bg1: '#0F172A', bg2: '#020617', text: '#FFFFFF', cardBg: 'rgba(255,255,255,0.08)', cardText: '#FFFFFF', badgeBg: '#38BDF8', isLight: false },
  };

  const currentAnswerUrl = `${window.location.origin}?q=${question.slug}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = 1080;
    canvas.height = 1920;

    const theme = themes[selectedTheme];

    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, theme.bg1);
    gradient.addColorStop(1, theme.bg2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.fillStyle = theme.cardBg;
    ctx.roundRect(120, 620, 840, 580, 48);
    ctx.fill();

    if (theme.isLight) {
      ctx.shadowColor = 'rgba(0,0,0,0.08)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;
    }

    ctx.fillStyle = theme.badgeBg;
    ctx.font = 'bold 38px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ASKLY', 540, 730);

    ctx.fillStyle = theme.cardText;
    ctx.font = 'bold 50px Inter, sans-serif';
    
    const words = question.text.split(' ');
    let line = '';
    let y = 850;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > 720 && n > 0) {
        ctx.fillText(line, 540, y);
        line = words[n] + ' ';
        y += 70;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 540, y);

    ctx.fillStyle = theme.isLight ? '#64748B' : 'rgba(255,255,255,0.8)';
    ctx.font = '32px Inter, sans-serif';
    ctx.fillText('Tap Link Sticker to Answer 💬', 540, 1110);

    ctx.fillStyle = theme.isLight ? '#94A3B8' : '#6B7280';
    ctx.font = 'bold 28px Inter, sans-serif';
    ctx.fillText('CREATED BY FIRST FUEL', 540, 1800);

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setGeneratedImgUrl(url);
      }
    });

  }, [selectedTheme, question]);

  const copyAnswerLink = () => {
    navigator.clipboard.writeText(currentAnswerUrl);
    showToast("Question link copied! Paste on Instagram Link Sticker 🔗");
  };

  const handleDownload = () => {
    if (!generatedImgUrl) return;

    const a = document.createElement('a');
    a.href = generatedImgUrl;
    a.download = `askly-${question.slug}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("Downloading image! Long press card below if needed 📸");
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-xs font-bold text-gray-400 hover:text-white mb-6 block">
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} className="hidden" />
          {generatedImgUrl && (
            <img 
              src={generatedImgUrl} 
              alt="Story Card" 
              className="w-72 h-[512px] rounded-3xl shadow-2xl border border-white/20 object-cover"
            />
          )}
          <span className="text-[11px] text-gray-400 mt-2 text-center">
            💡 Long press image to save directly to Photos
          </span>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Story Customizer</h2>
            <p className="text-xs text-gray-400">Choose colors & copy link for your IG Story Sticker</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-purple-400 uppercase mb-3">Select Color Theme</label>
            <div className="flex flex-wrap gap-2">
              {Object.keys(themes).map((key) => (
                <button 
                  key={key}
                  onClick={() => setSelectedTheme(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
                    selectedTheme === key 
                      ? 'border-purple-500 bg-purple-500/20 text-white' 
                      : 'border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  {themes[key].name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase block">Step 1: Copy Question Link</span>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={currentAnswerUrl} 
                className="bg-black/50 text-xs text-gray-300 p-2.5 rounded-xl border border-white/10 flex-grow font-mono"
              />
              <button 
                onClick={copyAnswerLink}
                className="bg-amber-500 text-black font-bold text-xs px-3 py-2.5 rounded-xl hover:bg-amber-400"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-purple-400 uppercase block">Step 2: Save Image</span>
            <button 
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl hover:opacity-90"
            >
              <Download className="w-5 h-5" /> Download Story Image
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- PUBLIC ANSWER PAGE WITH INSTAGRAM USERNAME INPUT ---
function PublicQuestionPage({ question, showToast, onAnswerSubmit }) {
  const [answerText, setAnswerText] = useState('');
  const [instaUser, setInstaUser] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;

    onAnswerSubmit(answerText, instaUser.trim());
    setSubmitted(true);
    showToast("Answer sent successfully! ✨");
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16 text-center">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest block mb-4">ASKLY Q&A</span>

        <h2 className="text-xl font-bold text-white mb-6">"{question.text}"</h2>

        {submitted ? (
          <div className="py-8 space-y-2">
            <span className="text-4xl block">✨</span>
            <p className="text-lg font-bold text-white">Answer Sent!</p>
            <p className="text-xs text-gray-400">Your response has been sent to the owner.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Instagram Username Field */}
            <div className="relative">
              <Instagram className="w-4 h-4 text-pink-400 absolute left-4 top-3.5" />
              <input 
                type="text"
                value={instaUser}
                onChange={(e) => setInstaUser(e.target.value)}
                placeholder="Your Instagram handle (e.g. @username)"
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Answer Text Area */}
            <textarea 
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 h-32 resize-none text-sm"
            />

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition-all text-sm shadow-lg"
            >
              Send Answer ✨
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
