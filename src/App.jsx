import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Sparkles, 
  Copy, 
  Download, 
  Trash2, 
  Instagram,
  MessageSquare
} from 'lucide-react';

// SUPABASE CONFIGURATION
const SUPABASE_URL = "https://grpbhwguqledavbnvfdq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_fho8BxaObbSxFlm5VFmJGg_Aagd7zzE"; // 👈 Apni anon key paste karein
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [activeTab, setActiveTabState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['home', 'create', 'dashboard', 'story', 'answerStory', 'public'].includes(hash) ? hash : 'home';
  });

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [questions, setQuestions] = useState([]);

  const setActiveTab = (tabName) => {
    setActiveTabState(tabName);
    if (tabName !== 'public') {
      window.location.hash = tabName;
    }
  };

  const loadData = async () => {
    const { data: qData } = await supabase.from('questions').select('*').order('created_at', { ascending: false });
    const { data: aData } = await supabase.from('answers').select('*').order('created_at', { ascending: false });

    if (qData) {
      const combined = qData.map(q => ({
        ...q,
        answers: aData ? aData.filter(a => a.question_slug === q.slug) : []
      }));
      setQuestions(combined);
    }
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        loadData();
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const qSlug = params.get('q');

    if (qSlug) {
      supabase.from('questions').select('*').eq('slug', qSlug).single().then(({ data }) => {
        if (data) {
          setSelectedQuestion(data);
          setActiveTabState('public');
        } else {
          setSelectedQuestion({ slug: qSlug, text: "Answer this question! 👀" });
          setActiveTabState('public');
        }
      });
    }
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0F0F12] text-gray-100 font-sans flex flex-col justify-between">
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
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-gray-200 to-purple-400 bg-clip-text text-transparent">ASKLY</span>
              <span className="block text-[10px] uppercase tracking-widest text-purple-400 font-bold -mt-1">By First Fuel</span>
            </div>
          </div>

          <nav className="flex items-center gap-4 text-sm font-medium text-gray-400">
            <button onClick={() => setActiveTab('home')} className={activeTab === 'home' ? 'text-white font-semibold' : ''}>Home</button>
            <button onClick={() => setActiveTab('create')} className={activeTab === 'create' ? 'text-white font-semibold' : ''}>Create</button>
            <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-white font-semibold' : ''}>Dashboard</button>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT ROUTER */}
      <main className="flex-grow">
        {activeTab === 'home' && <LandingPage onStart={() => setActiveTab('create')} />}
        
        {activeTab === 'create' && (
          <CreateQuestionPage 
            onCreated={async (qText) => {
              const slug = Math.random().toString(36).substring(2, 8);
              const { data } = await supabase.from('questions').insert([{ slug, text: qText }]).select().single();
              if (data) {
                showToast("Question Live! 🎉");
                setSelectedQuestion(data);
                setActiveTab('story');
                loadData();
              }
            }} 
          />
        )}

        {activeTab === 'dashboard' && (
          <OwnerDashboard 
            questions={questions} 
            showToast={showToast}
            onOpenStory={(q) => { setSelectedQuestion(q); setActiveTab('story'); }}
            onOpenAnswerStory={(q, a) => {
              setSelectedQuestion(q);
              setSelectedAnswer(a);
              setActiveTab('answerStory');
            }}
            onDeleteQuestion={async (slug) => {
              await supabase.from('questions').delete().eq('slug', slug);
              showToast("Deleted");
              loadData();
            }}
          />
        )}

        {activeTab === 'story' && selectedQuestion && (
          <StoryCardGenerator question={selectedQuestion} showToast={showToast} onBack={() => setActiveTab('dashboard')} />
        )}

        {activeTab === 'answerStory' && selectedQuestion && selectedAnswer && (
          <AnswerStoryCardGenerator 
            question={selectedQuestion} 
            answer={selectedAnswer} 
            showToast={showToast} 
            onBack={() => setActiveTab('dashboard')} 
          />
        )}

        {activeTab === 'public' && selectedQuestion && (
          <PublicQuestionPage 
            question={selectedQuestion} 
            showToast={showToast}
            onCreateOwn={() => setActiveTab('create')}
            onAnswerSubmit={async (text, author) => {
              await supabase.from('answers').insert([{
                question_slug: selectedQuestion.slug,
                text,
                author: author || "Anonymous"
              }]);
              showToast("Answer Sent! ✨");
              loadData();
            }}
          />
        )}
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
        © 2026 First Fuel. Premium Social Q&A Platform.
      </footer>
    </div>
  );
}

function LandingPage({ onStart }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 text-center">
      <h1 className="text-5xl font-black mb-6">Ask anything. <br /><span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">Hear everything.</span></h1>
      <button onClick={onStart} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold px-8 py-4 rounded-2xl">Create Your Question →</button>
    </div>
  );
}

function CreateQuestionPage({ onCreated }) {
  const [text, setText] = useState('');
  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
        <h2 className="text-2xl font-bold mb-4">Create New Ask</h2>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type question..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white h-32 mb-4" />
        <button onClick={() => onCreated(text)} className="w-full bg-purple-600 font-bold py-4 rounded-2xl">Generate Link →</button>
      </div>
    </div>
  );
}

function OwnerDashboard({ questions, showToast, onOpenStory, onOpenAnswerStory, onDeleteQuestion }) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-black mb-6">Realtime Answers Dashboard</h1>
      <div className="space-y-6">
        {questions.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No questions created yet. Click "Create" to start!</p>
        ) : (
          questions.map(q => (
            <div key={q.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <h3 className="font-bold text-lg">"{q.text}"</h3>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?q=${q.slug}`); showToast("Link Copied!"); }} className="bg-amber-500/20 text-amber-300 px-3 py-2 rounded-xl text-xs font-bold flex gap-1"><Copy className="w-3.5 h-3.5"/> Copy Link</button>
                  <button onClick={() => onOpenStory(q)} className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex gap-1"><Instagram className="w-3.5 h-3.5"/> Question Story</button>
                  <button onClick={() => onDeleteQuestion(q.slug)} className="bg-red-500/20 text-red-400 p-2 rounded-xl text-xs"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-400 block mb-2">Realtime Answers ({q.answers?.length || 0})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.answers?.map(a => (
                    <div key={a.id} className="bg-black/40 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-pink-400 block mb-1">{a.author}</span>
                        <p className="text-xs text-gray-200 mb-3">{a.text}</p>
                      </div>
                      <button 
                        onClick={() => onOpenAnswerStory(q, a)}
                        className="bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/30 text-[11px] font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 self-start transition-all"
                      >
                        <Instagram className="w-3 h-3 text-pink-400" /> Share Answer Story
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StoryCardGenerator({ question, showToast, onBack }) {
  const canvasRef = useRef(null);
  const [imgUrl, setImgUrl] = useState('');
  const currentUrl = `${window.location.origin}?q=${question.slug}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1080; canvas.height = 1920;
    
    ctx.fillStyle = '#FFE5EC';
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(120, 620, 840, 580, 48);
    ctx.fill();

    ctx.fillStyle = '#FF80A0';
    ctx.font = 'bold 38px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('ASKLY', 540, 730);

    ctx.fillStyle = '#590D22';
    ctx.font = 'bold 50px Inter';
    ctx.fillText(question.text, 540, 900);

    canvas.toBlob(blob => setImgUrl(URL.createObjectURL(blob)));
  }, [question]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-xs text-gray-400 mb-6">← Back</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} className="hidden" />
          {imgUrl && <img src={imgUrl} className="w-64 h-[450px] rounded-3xl object-cover shadow-2xl" />}
        </div>
        <div className="space-y-4">
          <button onClick={() => { navigator.clipboard.writeText(currentUrl); showToast("Link Copied!"); }} className="w-full bg-amber-500 text-black font-bold py-3 rounded-2xl">1. Copy Link</button>
          <a href={imgUrl} download={`askly-${question.slug}.png`} className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl block text-center">2. Download Story Image</a>
        </div>
      </div>
    </div>
  );
}

// NEW: ANSWER RESPONSE STORY CARD GENERATOR
function AnswerStoryCardGenerator({ question, answer, showToast, onBack }) {
  const canvasRef = useRef(null);
  const [imgUrl, setImgUrl] = useState('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1080; canvas.height = 1920;

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 1920);
    gradient.addColorStop(0, '#2E1065');
    gradient.addColorStop(1, '#090514');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);

    // Question Box (Top)
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.roundRect(120, 450, 840, 320, 36);
    ctx.fill();

    ctx.fillStyle = '#A855F7';
    ctx.font = 'bold 30px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('QUESTION', 540, 520);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 40px Inter';
    ctx.fillText(`"${question.text}"`, 540, 620);

    // Answer Box (Main Center)
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(120, 850, 840, 520, 48);
    ctx.fill();

    ctx.fillStyle = '#EC4899';
    ctx.font = 'bold 34px Inter';
    ctx.fillText(`ANSWER FROM ${answer.author.toUpperCase()}`, 540, 930);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 46px Inter';
    ctx.fillText(`"${answer.text}"`, 540, 1080);

    // Watermark
    ctx.fillStyle = '#9CA3AF';
    ctx.font = 'bold 28px Inter';
    ctx.fillText('ASKLY BY FIRST FUEL', 540, 1800);

    canvas.toBlob(blob => setImgUrl(URL.createObjectURL(blob)));
  }, [question, answer]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-xs text-gray-400 mb-6">← Back to Dashboard</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} className="hidden" />
          {imgUrl && <img src={imgUrl} className="w-64 h-[450px] rounded-3xl object-cover shadow-2xl border border-white/10" />}
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Share Answer to IG Story</h2>
          <p className="text-xs text-gray-400">Download this card and post it to your Instagram Story to show everyone the answer!</p>
          <a 
            href={imgUrl} 
            download={`askly-answer-${question.slug}.png`} 
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-2xl block text-center shadow-lg"
          >
            Download Answer Story Image 📸
          </a>
        </div>
      </div>
    </div>
  );
}

function PublicQuestionPage({ question, showToast, onAnswerSubmit, onCreateOwn }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
        <h2 className="text-xl font-bold mb-6">"{question.text}"</h2>
        {sent ? (
          <div>
            <p className="text-green-400 font-bold mb-4">✨ Answer Sent Live!</p>
            <button onClick={onCreateOwn} className="bg-purple-600 px-4 py-2 rounded-xl text-xs font-bold">Create Your Own Ask →</button>
          </div>
        ) : (
          <div className="space-y-4">
            <input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="@your_instagram" className="w-full bg-black/40 border border-white/10 rounded-2xl p-3 text-xs text-white" />
            <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Type answer..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white h-32" />
            <button onClick={() => { if(text.trim()){ onAnswerSubmit(text, author); setSent(true); } }} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold py-3.5 rounded-2xl">Send Answer ✨</button>
          </div>
        )}
      </div>
    </div>
  );
}
