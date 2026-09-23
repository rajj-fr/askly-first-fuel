import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Sparkles, 
  Copy, 
  Trash2, 
  Instagram,
  Image as ImageIcon,
  Sliders,
  Mic,
  Square
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
            showToast={showToast}
            onCreated={async (qText, file, audioBlob) => {
              let imageUrl = null;
              let audioUrl = null;

              if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `q_img_${Date.now()}.${fileExt}`;
                const { data: uploadData } = await supabase.storage.from('askly-media').upload(fileName, file);
                if (uploadData) {
                  const { data: publicUrlData } = supabase.storage.from('askly-media').getPublicUrl(fileName);
                  imageUrl = publicUrlData.publicUrl;
                }
              }

              if (audioBlob) {
                const audioName = `q_audio_${Date.now()}.webm`;
                const { data: uploadAudioData } = await supabase.storage.from('askly-media').upload(audioName, audioBlob, {
                  contentType: 'audio/webm',
                  upsert: true
                });
                if (uploadAudioData) {
                  const { data: publicAudioUrl } = supabase.storage.from('askly-media').getPublicUrl(audioName);
                  audioUrl = publicAudioUrl.publicUrl;
                }
              }

              const slug = Math.random().toString(36).substring(2, 8);
              const { data } = await supabase.from('questions').insert([{ slug, text: qText, image_url: imageUrl, audio_url: audioUrl }]).select().single();
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
            onAnswerSubmit={async (text, author, file, audioBlob) => {
              let imageUrl = null;
              let audioUrl = null;

              if (file) {
                const fileExt = file.name.split('.').pop();
                const fileName = `a_img_${Date.now()}.${fileExt}`;
                const { data: uploadData } = await supabase.storage.from('askly-media').upload(fileName, file);
                if (uploadData) {
                  const { data: publicUrlData } = supabase.storage.from('askly-media').getPublicUrl(fileName);
                  imageUrl = publicUrlData.publicUrl;
                }
              }

              if (audioBlob) {
                const audioName = `a_audio_${Date.now()}.webm`;
                const { data: uploadAudioData } = await supabase.storage.from('askly-media').upload(audioName, audioBlob, {
                  contentType: 'audio/webm',
                  upsert: true
                });
                if (uploadAudioData) {
                  const { data: publicAudioUrl } = supabase.storage.from('askly-media').getPublicUrl(audioName);
                  audioUrl = publicAudioUrl.publicUrl;
                }
              }

              await supabase.from('answers').insert([{
                question_slug: selectedQuestion.slug,
                text,
                author,
                image_url: imageUrl,
                audio_url: audioUrl
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

// ROBUST VOICE RECORDER WITH BLOB HANDLING
function VoiceRecorder({ onAudioReady }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [effect, setEffect] = useState('normal');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const rawBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const processedBlob = await applyAudioEffect(rawBlob, effect);
        
        // Create an object URL specifically for HTML5 audio playback
        const playableUrl = URL.createObjectURL(processedBlob);
        setAudioUrl(playableUrl);
        onAudioReady(processedBlob);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      alert("Microphone permission denied or not supported.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
    }
  };

  const applyAudioEffect = async (blob, effectType) => {
    if (effectType === 'normal') return blob;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
      );

      const source = offlineCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = effectType === 'chipmunk' ? 1.4 : 0.75;

      source.connect(offlineCtx.destination);
      source.start(0);
      const renderedBuffer = await offlineCtx.startRendering();
      return new Blob([renderedBuffer.getChannelData(0)], { type: 'audio/webm' });
    } catch (e) {
      return blob;
    }
  };

  return (
    <div className="p-4 bg-black/40 border border-white/10 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-purple-300 flex items-center gap-1.5"><Mic className="w-4 h-4"/> Voice Note Recorder</span>
        <select value={effect} onChange={(e) => setEffect(e.target.value)} className="bg-black/60 border border-white/10 text-[11px] text-white rounded-xl px-2.5 py-1">
          <option value="normal">Normal Voice</option>
          <option value="chipmunk">🐿️ Chipmunk</option>
          <option value="deep">🎙️ Deep Voice</option>
        </select>
      </div>
      <div className="flex items-center gap-3">
        {!recording ? (
          <button type="button" onClick={startRecording} className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
            <Mic className="w-3.5 h-3.5" /> Start Recording
          </button>
        ) : (
          <button type="button" onClick={stopRecording} className="bg-red-600 text-white animate-pulse text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2">
            <Square className="w-3.5 h-3.5" /> Stop 🔴
          </button>
        )}
        {audioUrl && (
          <audio 
            controls 
            src={audioUrl} 
            className="h-8 w-full max-w-[180px]" 
            onError={() => alert("Audio playback failed. Please try re-recording.")} 
          />
        )}
      </div>
    </div>
  );
}

function CreateQuestionPage({ onCreated, showToast }) {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if(!text.trim() && !audioBlob) {
      showToast("Please type text or record voice note!");
      return;
    }
    setLoading(true);
    await onCreated(text, file, audioBlob);
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
        <h2 className="text-2xl font-bold">Create New Ask</h2>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type question..." className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-white h-28" />
        <VoiceRecorder onAudioReady={(blob) => setAudioBlob(blob)} />
        <div>
          <label className="text-xs font-semibold text-gray-400 block mb-2">Attach Image (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-300" />
        </div>
        <button disabled={loading} onClick={handleSubmit} className="w-full bg-purple-600 font-bold py-4 rounded-2xl">
          {loading ? "Publishing..." : "Generate Link →"}
        </button>
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
          <p className="text-gray-400 text-center py-8">No questions created yet.</p>
        ) : (
          questions.map(q => (
            <div key={q.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <div>
                  <h3 className="font-bold text-lg">"{q.text || "🎙️ Voice Question"}"</h3>
                  {q.audio_url && (
                    <audio 
                      controls 
                      src={q.audio_url} 
                      className="h-8 mt-2 max-w-[240px]" 
                      onError={(e) => console.error("Cloud audio load error:", e)} 
                    />
                  )}
                  {q.image_url && <a href={q.image_url} target="_blank" rel="noreferrer" className="text-xs text-purple-400 underline flex items-center gap-1 mt-1"><ImageIcon className="w-3 h-3"/> Attached Image</a>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}?q=${q.slug}`); showToast("Link Copied!"); }} className="bg-amber-500/20 text-amber-300 px-3 py-2 rounded-xl text-xs font-bold flex gap-1"><Copy className="w-3.5 h-3.5"/> Copy Link</button>
                  <button onClick={() => onOpenStory(q)} className="bg-purple-600 text-white px-3 py-2 rounded-xl text-xs font-bold flex gap-1"><Instagram className="w-3.5 h-3.5"/> Story</button>
                  <button onClick={() => onDeleteQuestion(q.slug)} className="bg-red-500/20 text-red-400 p-2 rounded-xl text-xs"><Trash2 className="w-3.5 h-3.5"/></button>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-xs text-gray-400 block mb-2">Answers ({q.answers?.length || 0})</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {q.answers?.map(a => (
                    <div key={a.id} className="bg-black/40 border border-white/10 p-3.5 rounded-2xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-pink-400 block mb-1">{a.author}</span>
                        <p className="text-xs text-gray-200 mb-2">{a.text || "🎙️ Voice Answer"}</p>
                        {a.audio_url && (
                          <audio 
                            controls 
                            src={a.audio_url} 
                            className="h-7 my-2 w-full" 
                            onError={(e) => console.error("Cloud audio load error:", e)} 
                          />
                        )}
                        {a.image_url && <a href={a.image_url} target="_blank" rel="noreferrer" className="text-[11px] text-pink-400 underline flex items-center gap-1 mb-3"><ImageIcon className="w-3 h-3"/> Photo</a>}
                      </div>
                      <button onClick={() => onOpenAnswerStory(q, a)} className="bg-purple-600/30 hover:bg-purple-600 text-purple-200 border border-purple-500/30 text-[11px] font-bold py-1.5 px-3 rounded-xl flex items-center justify-center gap-1.5 self-start">
                        <Instagram className="w-3 h-3 text-pink-400" /> Share Story
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

  const [bgColor, setBgColor] = useState('#FFE5EC');
  const [cardColor, setCardColor] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#590D22');
  const [fontSize, setFontSize] = useState(48);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1080; canvas.height = 1920;
    
    const drawCard = (qImg = null) => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 1080, 1920);

      const boxY = qImg ? 450 : 600;
      const boxHeight = qImg ? 950 : 650;

      ctx.fillStyle = cardColor;
      ctx.roundRect(120, boxY, 840, boxHeight, 48);
      ctx.fill();

      ctx.fillStyle = '#FF80A0';
      ctx.font = 'bold 38px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ASKLY', 540, boxY + 90);

      if (qImg) {
        ctx.drawImage(qImg, 240, boxY + 140, 600, 400);
      }

      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px Inter, sans-serif`;

      const textY = qImg ? boxY + 620 : boxY + 220;
      const displayTxt = question.text ? `"${question.text}"` : "🎙️ Voice Question";
      const words = displayTxt.split(' ');
      let line = '';
      let curY = textY;
      for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > 720 && n > 0) {
          ctx.fillText(line, 540, curY);
          line = words[n] + ' ';
          curY += fontSize + 15;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 540, curY);

      canvas.toBlob(blob => setImgUrl(URL.createObjectURL(blob)));
    };

    if (question.image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = question.image_url;
      img.onload = () => drawCard(img);
      img.onerror = () => drawCard(null);
    } else {
      drawCard(null);
    }
  }, [question, bgColor, cardColor, textColor, fontSize]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-xs text-gray-400 mb-6 block">← Back to Dashboard</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} className="hidden" />
          {imgUrl && <img src={imgUrl} className="w-64 h-[450px] rounded-3xl object-cover shadow-2xl border border-white/10" />}
        </div>
        <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-3xl">
          <h2 className="text-lg font-bold text-white flex items-center gap-2"><Sliders className="w-4 h-4 text-purple-400"/> Customize</h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div><label className="text-gray-400 block mb-1">Background</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded-xl bg-transparent" /></div>
            <div><label className="text-gray-400 block mb-1">Card Color</label><input type="color" value={cardColor} onChange={e => setCardColor(e.target.value)} className="w-full h-10 rounded-xl bg-transparent" /></div>
            <div><label className="text-gray-400 block mb-1">Text Color</label><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-xl bg-transparent" /></div>
            <div><label className="text-gray-400 block mb-1">Font Size ({fontSize}px)</label><input type="range" min="32" max="64" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full mt-2" /></div>
          </div>
          <div className="space-y-3 pt-4 border-t border-white/10">
            <button onClick={() => { navigator.clipboard.writeText(currentUrl); showToast("Link Copied!"); }} className="w-full bg-amber-500 text-black font-bold py-3 rounded-2xl text-xs">1. Copy Link</button>
            <a href={imgUrl} download={`askly-${question.slug}.png`} className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl block text-center text-xs">2. Download Story Image 📸</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnswerStoryCardGenerator({ question, answer, showToast, onBack }) {
  const canvasRef = useRef(null);
  const [imgUrl, setImgUrl] = useState('');

  const [bgColor, setBgColor] = useState('#1E1B4B');
  const [qBoxColor, setQBoxColor] = useState('rgba(255, 255, 255, 0.12)');
  const [qTextColor, setQTextColor] = useState('#FFFFFF');
  const [qFontSize, setQFontSize] = useState(34);
  const [qBoxHeight, setQBoxHeight] = useState(300);

  const [aBoxColor, setABoxColor] = useState('#FFFFFF');
  const [aTextColor, setATextColor] = useState('#111827');
  const [aFontSize, setAFontSize] = useState(40);
  const [aBoxHeight, setABoxHeight] = useState(650);

  const drawWrappedText = (ctx, text, startX, startY, maxWidth, lineHeight, fSize, tColor) => {
    ctx.fillStyle = tColor;
    ctx.font = `bold ${fSize}px Inter, sans-serif`;
    const words = text.split(' ');
    let line = '';
    let currentY = startY;
    for (let n = 0; n < words.length; n++) {
      let testLine = line + words[n] + ' ';
      if (ctx.measureText(testLine).width > maxWidth && n > 0) {
        ctx.fillText(line, startX, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, startX, currentY);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 1080; canvas.height = 1920;

    const drawAnswerCard = (aImg = null) => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, 1080, 1920);

      const qBoxY = 150;
      ctx.fillStyle = qBoxColor;
      ctx.roundRect(100, qBoxY, 880, qBoxHeight, 36);
      ctx.fill();

      ctx.fillStyle = '#C084FC';
      ctx.font = 'bold 24px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QUESTION', 540, qBoxY + 50);

      const qTextContent = question.text ? `"${question.text}"` : "🎙️ Voice Question";
      drawWrappedText(ctx, qTextContent, 540, qBoxY + 110, 780, qFontSize + 10, qFontSize, qTextColor);

      const aBoxY = qBoxY + qBoxHeight + 50;
      const actualABoxHeight = aImg ? aBoxHeight + 300 : aBoxHeight;

      ctx.fillStyle = aBoxColor;
      ctx.roundRect(100, aBoxY, 880, actualABoxHeight, 48);
      ctx.fill();

      ctx.fillStyle = '#DB2777';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`ANSWER FROM ${answer.author.toUpperCase()}`, 540, aBoxY + 60);

      if (aImg) {
        ctx.drawImage(aImg, 180, aBoxY + 100, 720, 380);
      }

      const ansTextY = aImg ? aBoxY + 520 : aBoxY + 140;
      const aTextContent = answer.text ? `"${answer.text}"` : "🎙️ Voice Note Answer";
      drawWrappedText(ctx, aTextContent, 540, ansTextY, 780, aFontSize + 10, aFontSize, aTextColor);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 26px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ASKLY BY FIRST FUEL', 540, 1840);

      canvas.toBlob(blob => setImgUrl(URL.createObjectURL(blob)));
    };

    if (answer.image_url) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = answer.image_url;
      img.onload = () => drawAnswerCard(img);
      img.onerror = () => drawAnswerCard(null);
    } else {
      drawAnswerCard(null);
    }
  }, [question, answer, bgColor, qBoxColor, qTextColor, qFontSize, qBoxHeight, aBoxColor, aTextColor, aFontSize, aBoxHeight]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <button onClick={onBack} className="text-xs text-gray-400 mb-6 block">← Back to Dashboard</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col items-center">
          <canvas ref={canvasRef} className="hidden" />
          {imgUrl && <img src={imgUrl} className="w-64 h-[450px] rounded-3xl object-cover shadow-2xl border border-white/10" />}
        </div>
        
        <div className="space-y-6 bg-white/5 border border-white/10 p-6 rounded-3xl text-xs max-h-[85vh] overflow-y-auto">
          <h2 className="text-sm font-bold text-white flex items-center gap-2"><Sliders className="w-4 h-4 text-purple-400"/> Customization Studio</h2>
          
          <div>
            <label className="text-gray-400 block mb-1">Page Background Color</label>
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-9 rounded-xl bg-transparent cursor-pointer" />
          </div>

          <div className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-3">
            <h3 className="font-bold text-purple-300">Question Box Customization</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">Box Height ({qBoxHeight}px)</label>
                <input type="range" min="180" max="500" value={qBoxHeight} onChange={e => setQBoxHeight(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Font Size ({qFontSize}px)</label>
                <input type="range" min="24" max="48" value={qFontSize} onChange={e => setQFontSize(Number(e.target.value))} className="w-full accent-purple-500" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Text Color</label>
                <input type="color" value={qTextColor} onChange={e => setQTextColor(e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/30 rounded-2xl border border-white/10 space-y-3">
            <h3 className="font-bold text-pink-300">Answer Box Customization</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-gray-400 block mb-1">Box Height ({aBoxHeight}px)</label>
                <input type="range" min="400" max="900" value={aBoxHeight} onChange={e => setABoxHeight(Number(e.target.value))} className="w-full accent-pink-500" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Font Size ({aFontSize}px)</label>
                <input type="range" min="28" max="54" value={aFontSize} onChange={e => setAFontSize(Number(e.target.value))} className="w-full accent-pink-500" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Card Color</label>
                <input type="color" value={aBoxColor} onChange={e => setABoxColor(e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Text Color</label>
                <input type="color" value={aTextColor} onChange={e => setATextColor(e.target.value)} className="w-full h-8 rounded-lg bg-transparent cursor-pointer" />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a 
              href={imgUrl} 
              download={`askly-answer-${question.slug}.png`} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3.5 rounded-2xl block text-center shadow-lg text-xs"
            >
              Download Custom Story Image 📸
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function PublicQuestionPage({ question, showToast, onAnswerSubmit, onCreateOwn }) {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [file, setFile] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if(!author.trim()) {
      showToast("Instagram username is COMPULSORY! ⚠️");
      return;
    }
    if(!text.trim() && !audioBlob) {
      showToast("Please write an answer or record a voice note!");
      return;
    }

    setLoading(true);
    const formattedAuthor = author.startsWith('@') ? author : `@${author}`;
    await onAnswerSubmit(text, formattedAuthor, file, audioBlob);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto px-6 py-12 text-center">
      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold mb-2">"{question.text || "🎙️ Voice Question"}"</h2>
        {question.audio_url && <audio controls src={question.audio_url} className="w-full h-9 mb-2" />}
        {question.image_url && <img src={question.image_url} alt="Question media" className="w-full h-40 object-cover rounded-2xl mb-4 border border-white/10" />}

        {sent ? (
          <div>
            <p className="text-green-400 font-bold mb-4">✨ Answer Sent Live!</p>
            <button onClick={onCreateOwn} className="bg-purple-600 px-4 py-2 rounded-xl text-xs font-bold">Create Your Own Ask →</button>
          </div>
        ) : (
          <div className="space-y-4 text-left">
            <div>
              <input 
                type="text" 
                value={author} 
                onChange={e => setAuthor(e.target.value)} 
                placeholder="Your Instagram handle (Compulsory)*" 
                className="w-full bg-black/40 border border-pink-500/40 focus:border-pink-500 rounded-2xl p-3 text-xs text-white" 
              />
              <span className="text-[10px] text-pink-400 ml-1">* Required field</span>
            </div>

            <textarea 
              value={text} 
              onChange={e => setText(e.target.value)} 
              placeholder="Type your answer here..." 
              className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm text-white h-28" 
            />

            <VoiceRecorder onAudioReady={(blob) => setAudioBlob(blob)} />

            <div>
              <label className="text-[11px] font-semibold text-gray-400 block mb-1">Attach a photo (Optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-600/20 file:text-purple-300" />
            </div>

            <button 
              disabled={loading} 
              onClick={handleSubmit} 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 font-bold py-3.5 rounded-2xl shadow-lg mt-2 text-center"
            >
              {loading ? "Sending..." : "Send Answer ✨"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
