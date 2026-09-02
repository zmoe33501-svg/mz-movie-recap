import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Loader2, Mic, Activity, Gauge, Clock, Pause, Trash2, Download, Volume2, AlertCircle, Upload, FastForward, Zap, Sun, Moon, Music, Film, Eraser, FileText, Headphones } from 'lucide-react';

const VOICES = [
  { id: 'Charon', name: 'အောင်အောင်', gender: 'Male' }, { id: 'Fenrir', name: 'ရဲရင့်', gender: 'Male' },
  { id: 'Orus', name: 'မင်းခန့်', gender: 'Male' }, { id: 'Enceladus', name: 'ဇေယျာ', gender: 'Male' },
  { id: 'Iapetus', name: 'ထက်မြတ်', gender: 'Male' }, { id: 'Algenib', name: 'မျိုးမင်း', gender: 'Male' },
  { id: 'Rasalgethi', name: 'စည်သူ', gender: 'Male' }, { id: 'Schedar', name: 'ကောင်းကင်', gender: 'Male' },
  { id: 'Alnilam', name: 'သီဟ', gender: 'Male' }, { id: 'Sadachbia', name: 'ဝေယံ', gender: 'Male' },
  { id: 'Kore', name: 'စုစု', gender: 'Female' }, { id: 'Aoede', name: 'သန္တာ', gender: 'Female' },
  { id: 'Leda', name: 'လှိုင်', gender: 'Female' }, { id: 'Callirrhoe', name: 'အေးအေး', gender: 'Female' },
  { id: 'Autonoe', name: 'မြမြ', gender: 'Female' }, { id: 'Despina', name: 'နန်းဆု', gender: 'Female' },
  { id: 'Erinome', name: 'ရွှေရည်', gender: 'Female' }, { id: 'Laomedeia', name: 'သီရိ', gender: 'Female' },
  { id: 'Achernar', name: 'မေမီ', gender: 'Female' }, { id: 'Gacrux', name: 'နှင်းနှင်း', gender: 'Female' }
];

const EMOTIONS = [
  { id: 'Neutral', label: 'ပုံမှန်', emoji: '😐' }, { id: 'Happy', label: 'ပျော်ရွှင်သော', emoji: '😊' },
  { id: 'Sad', label: 'ဝမ်းနည်းသော', emoji: '😢' }, { id: 'Angry', label: 'ဒေါသထွက်သော', emoji: '😠' },
  { id: 'Calm', label: 'တည်ငြိမ်သော', emoji: '😌' }, { id: 'Energetic', label: 'တက်ကြွသော', emoji: '⚡️' },
  { id: 'Whisper', label: 'တိုးတိုးပြော', emoji: '🤫' }, { id: 'Storytelling', label: 'ပုံပြင်ပြော', emoji: '📖' },
  { id: 'Professional', label: 'လုပ်ငန်းသုံး', emoji: '👔' }, { id: 'Casual', label: 'ပေါ့ပေါ့ပါးပါး', emoji: '☕️' },
  { id: 'Fearful', label: 'ကြောက်ရွံသော', emoji: '😨' }, { id: 'Surprised', label: 'အံ့သြသော', emoji: '😲' },
  { id: 'Excited', label: 'စိတ်လှုပ်ရှားသော', emoji: '🤩' }, { id: 'Romantic', label: 'ချစ်စရာကောင်းသော', emoji: '🥰' },
  { id: 'Sarcastic', label: 'ခနဲ့တဲ့တဲ့', emoji: '😏' }, { id: 'Serious', label: 'လေးနက်သော', emoji: '🧐' },
  { id: 'Confident', label: 'ယုံကြည်မှုရှိသော', emoji: '😎' }, { id: 'Shy', label: 'ရှက်တတ်သော', emoji: '😳' },
  { id: 'Hopeful', label: 'မျှော်လင့်ချက်ရှိသော', emoji: '🤞' }, { id: 'Tired', label: 'ပင်ပန်းနေသော', emoji: '😫' }
];

const BGM_OPTIONS = [
  { id: 'none', label: 'နောက်ခံတေးဂီတ မပါ', url: '' },
  { id: 'suspense', label: 'သည်းထိတ်ရင်ဖို (Suspense)', url: 'https://ia802500.us.archive.org/6/items/KevinMacLeod-PreludeAndAction/Prelude%20and%20Action.mp3' },
  { id: 'epic', label: 'အက်ရှင် (Epic)', url: 'https://ia801309.us.archive.org/21/items/KevinMacLeod-VolatileReaction/Volatile%20Reaction.mp3' },
  { id: 'mystery', label: 'လျှို့ဝှက်ဆန်းကြယ် (Mystery)', url: 'https://ia801402.us.archive.org/16/items/KevinMacLeod-SneakySnitch/Sneaky%20Snitch.mp3' },
  { id: 'horror', label: 'ခြောက်ခြားဖွယ် (Horror)', url: 'https://ia801300.us.archive.org/22/items/KevinMacLeod-ClassicHorror1/Classic%20Horror%201.mp3' },
  { id: 'sad', label: 'လွမ်းဆွေးဖွယ် (Sad)', url: 'https://ia802905.us.archive.org/20/items/KevinMacLeod-DespairAndTriumph/Despair%20and%20Triumph.mp3' },
  { id: 'chill', label: 'အေးချမ်းသော (Chill)', url: 'https://ia902202.us.archive.org/23/items/KevinMacLeod-Carefree/Carefree.mp3' }
];

const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds)) return "0:00";
  const m = Math.floor(timeInSeconds / 60);
  const s = Math.floor(timeInSeconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const formatSrtTime = (timeInSeconds) => {
  const pad = (num, size) => ('000' + num).slice(size * -1);
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.round((timeInSeconds % 1) * 1000);
  return `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)},${pad(milliseconds, 3)}`;
};

const chunkText = (text, maxLength = 1200) => {
  const chunks = [];
  let currentIdx = 0;
  while (currentIdx < text.length) {
    let endIdx = currentIdx + maxLength;
    if (endIdx < text.length) {
      let breakPoint = Math.max(text.lastIndexOf('\n', endIdx), text.lastIndexOf('။', endIdx));
      if (breakPoint <= currentIdx) breakPoint = text.lastIndexOf('၊', endIdx);
      if (breakPoint <= currentIdx) breakPoint = text.lastIndexOf(' ', endIdx);
      if (breakPoint > currentIdx) endIdx = breakPoint + 1;
    }
    const chunk = text.slice(currentIdx, endIdx).trim();
    if (chunk) chunks.push(chunk);
    currentIdx = endIdx;
  }
  return chunks;
};

const createWavFile = (pcmData, sampleRate) => {
  const numChannels = 1; const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const writeString = (view, offset, string) => { for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i)); };
  writeString(view, 0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true); view.setUint32(24, sampleRate, true); view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true); view.setUint16(34, bitsPerSample, true); writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);
  const pcmBytes = new Uint8Array(buffer, 44); pcmBytes.set(pcmData);
  return new Blob([view], { type: 'audio/wav' });
};

const AdvancedPlayer = ({ item, onDelete, theme }) => {
  const mainAudioRef = useRef(null);
  const bgmAudioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [showDownloads, setShowDownloads] = useState(false);
  const [customFileName, setCustomFileName] = useState("");

  const togglePlay = () => { isPlaying ? mainAudioRef.current.pause() : mainAudioRef.current.play(); };
  const handleTimeUpdate = () => setProgress(mainAudioRef.current.currentTime);
  const handleSeek = (e) => {
    const time = Number(e.target.value);
    mainAudioRef.current.currentTime = time;
    if (bgmAudioRef.current) bgmAudioRef.current.currentTime = time % bgmAudioRef.current.duration || 0;
    setProgress(time);
  };
  const changeSpeed = () => {
    const s = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(s); mainAudioRef.current.playbackRate = s;
  };

  useEffect(() => { if (bgmAudioRef.current) { bgmAudioRef.current.volume = 0.04; bgmAudioRef.current.loop = true; } }, []);

  const handleDownload = (format) => {
    const finalName = customFileName.trim() || `MZ_Recap_${item.id}`;
    
    if (format === 'wav' || format === 'mp3') {
      const audioLink = document.createElement("a");
      audioLink.href = item.audioUrl;
      audioLink.download = `${finalName}.${format}`;
      document.body.appendChild(audioLink);
      audioLink.click();
      document.body.removeChild(audioLink);
    } else if (format === 'srt') {
      if (item.subtitlesData && item.subtitlesData.length > 0) {
        const srtContent = item.subtitlesData.map(sub => `${sub.id}\n${sub.start} --> ${sub.end}\n${sub.text}\n`).join('\n');
        const srtBlob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
        const srtUrl = URL.createObjectURL(srtBlob);
        const srtLink = document.createElement("a");
        srtLink.href = srtUrl;
        srtLink.download = `${finalName}.srt`;
        document.body.appendChild(srtLink);
        srtLink.click();
        document.body.removeChild(srtLink);
        URL.revokeObjectURL(srtUrl);
      } else {
        alert("SRT Data မရှိပါ။");
      }
    }
  };

  const isDark = theme === 'dark';
  return (
    <div className={`${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-5 flex flex-col gap-4 transition-colors`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-xs font-medium border border-blue-500/20">{item.voice.name}</span>
            <span className="bg-pink-500/20 text-pink-500 px-3 py-1 rounded-full text-xs font-medium border border-pink-500/20">{item.emotion.emoji} {item.emotion.label}</span>
            {item.bgm && item.bgm.id !== 'none' && <span className="bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-amber-500/20"><Music className="w-3 h-3"/> {item.bgm.label}</span>}
            <span className="text-xs text-gray-500 ml-auto flex items-center gap-1"><Clock className="w-3 h-3" /> {item.timestamp}</span>
          </div>
          <p className={`${isDark ? 'text-gray-100' : 'text-gray-800'} text-sm line-clamp-2 leading-relaxed mt-3`}>{item.text}</p>
        </div>
      </div>
      
      <div className={`flex items-center gap-4 ${isDark ? 'bg-black/40' : 'bg-gray-100'} p-3 rounded-2xl border ${isDark ? 'border-white/5' : 'border-transparent'}`}>
        <button onClick={togglePlay} className="w-12 h-12 shrink-0 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30">
          {isPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-1" />}
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex justify-between text-xs font-medium text-gray-500 px-1"><span>{formatTime(progress)}</span><span>{formatTime(duration)}</span></div>
          <input type="range" min="0" max={duration || 100} value={progress} onChange={handleSeek} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500" />
        </div>
        <button onClick={changeSpeed} className={`w-12 text-xs font-bold ${isDark ? 'text-gray-400 hover:text-blue-400' : 'text-gray-600 hover:text-blue-600'}`}>{speed}x</button>
        
        <div className="relative">
          <button onClick={() => setShowDownloads(!showDownloads)} className={`p-2.5 rounded-xl transition-colors ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
            <Download className="w-4 h-4" />
          </button>
          
          {showDownloads && (
            <div className={`absolute right-0 bottom-full mb-3 w-64 rounded-xl shadow-xl border p-3 z-20 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <p className={`text-xs font-bold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ဖိုင်နာမည်ပေးရန်</p>
              <input 
                type="text" 
                value={customFileName} 
                onChange={(e) => setCustomFileName(e.target.value)} 
                placeholder={`MZ_Recap_${item.id}`}
                className={`w-full text-sm p-2 rounded-lg mb-3 outline-none border ${isDark ? 'bg-gray-900 border-gray-600 text-white focus:border-blue-500' : 'bg-gray-50 border-gray-300 focus:border-blue-500'}`}
              />
              
              <div className="flex flex-col gap-2">
                <p className={`text-[10px] font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>သီးခြားစီ ဒေါင်းလုဒ်လုပ်ရန်</p>
                <button onClick={() => handleDownload('wav')} className="flex items-center justify-between px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">
                  <span>🎵 WAV Audio (HQ)</span> <Download className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDownload('mp3')} className={`flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-colors border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                  <span>🎵 MP3 Audio (Small)</span> <Download className="w-3.5 h-3.5" />
                </button>
                {item.subtitlesData && item.subtitlesData.length > 0 && (
                  <button onClick={() => handleDownload('srt')} className="flex items-center justify-between px-3 py-2 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-lg transition-colors mt-1">
                    <span>📝 SRT Subtitle</span> <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <button onClick={() => onDelete(item.id)} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
        <audio ref={mainAudioRef} src={item.audioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={() => setDuration(mainAudioRef.current.duration)} onPlay={() => { setIsPlaying(true); if(bgmAudioRef.current) bgmAudioRef.current.play(); }} onPause={() => { setIsPlaying(false); if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} onEnded={() => { setIsPlaying(false); if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} />
        {item.bgm && item.bgm.url && <audio ref={bgmAudioRef} src={item.bgm.url} />}
      </div>
    </div>
  );
};

const App = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

  const [theme, setTheme] = useState(() => localStorage.getItem('mz_theme') || 'dark');
  const [activeTab, setActiveTab] = useState('generator');
  const [text, setText] = useState(() => localStorage.getItem('mz_text') || "");
  const [selectedVoice, setSelectedVoice] = useState(() => localStorage.getItem('mz_voice') || 'Charon');
  const [selectedEmotion, setSelectedEmotion] = useState(() => localStorage.getItem('mz_emotion') || 'Neutral');
  const [selectedBGM, setSelectedBGM] = useState(() => localStorage.getItem('mz_bgm') || 'none');
  
  useEffect(() => {
    localStorage.setItem('mz_theme', theme);
    localStorage.setItem('mz_text', text);
    localStorage.setItem('mz_voice', selectedVoice);
    localStorage.setItem('mz_emotion', selectedEmotion);
    localStorage.setItem('mz_bgm', selectedBGM);
  }, [theme, text, selectedVoice, selectedEmotion, selectedBGM]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState(''); 
  const [genTimer, setGenTimer] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('mz_history');
    return saved ? JSON.parse(saved) : [];
  });
  
  useEffect(() => {
    localStorage.setItem('mz_history', JSON.stringify(history));
  }, [history]);

  const fileInputRef = useRef(null);

  const [previewCache, setPreviewCache] = useState({});
  const [previewState, setPreviewState] = useState('idle');
  const previewAudioRef = useRef(new Audio());

  useEffect(() => {
    let interval;
    if (isGenerating) { setGenTimer(0); interval = setInterval(() => setGenTimer(prev => prev + 1), 1000); } 
    else clearInterval(interval);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    const audio = previewAudioRef.current;
    audio.onended = () => setPreviewState('idle');
    audio.onpause = () => setPreviewState('idle');
  }, []);

  const handleClearText = () => {
    if(window.confirm("ရိုက်ထားသော စာသားများအားလုံးကို ဖျက်ပစ်မည်မှာ သေချာပါသလား?")) {
        setText("");
    }
  };

  const handleClearHistory = () => { 
    if(window.confirm("မှတ်တမ်းများအားလုံးကို ရှင်းလင်းမည်မှာ သေချာပါသလား? (ဤလုပ်ဆောင်ချက်ကို ပြန်ပြောင်း၍မရပါ)")) {
        setHistory([]);
    }
  };

  const handlePreview = async () => {
    if(!apiKey) return setErrorMsg("Vercel တွင် VITE_GEMINI_API_KEY ကို ထည့်ပေးပါ။");
    if (previewState === 'playing') { previewAudioRef.current.pause(); setPreviewState('idle'); return; }
    const voice = VOICES.find(v => v.id === selectedVoice);
    const introText = `မင်္ဂလာပါ၊ ${voice.gender === 'Male' ? 'ကျွန်တော်' : 'ကျွန်မ'} ကတော့ ${voice.name} ပါ။`;
    if (previewCache[selectedVoice]) { previewAudioRef.current.src = previewCache[selectedVoice]; previewAudioRef.current.play(); setPreviewState('playing'); return; }
    setPreviewState('loading'); setErrorMsg('');
    try {
      const payload = { contents: [{ parts: [{ text: introText }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } } }, model: "gemini-2.5-flash-preview-tts" };
      let attempt = 0, delay = 1000;
      let response, data;
      while (attempt < 5) {
          try {
              response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
              data = await response.json();
              if (!response.ok) throw new Error(data.error?.message);
              break;
          } catch(err) {
              attempt++;
              if(attempt >= 5) throw err;
              await new Promise(r => setTimeout(r, delay));
              delay *= 2;
          }
      }
      const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
      const binaryString = atob(inlineData.data);
      const bytes = new Uint8Array(binaryString.length);
      for (let j = 0; j < binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
      let finalSampleRate = 24000; const rateMatch = inlineData.mimeType.match(/rate=(\d+)/);
      if (rateMatch) finalSampleRate = parseInt(rateMatch[1], 10);
      const wavBlob = createWavFile(bytes, finalSampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      setPreviewCache(prev => ({...prev, [selectedVoice]: audioUrl}));
      previewAudioRef.current.src = audioUrl; previewAudioRef.current.play(); setPreviewState('playing');
    } catch (err) { setErrorMsg("နမူနာအသံ ယူရာတွင် အမှားဖြစ်နေပါသည်။ API Key စစ်ဆေးပါ။"); setPreviewState('idle'); }
  };

  const fetchChunkData = async (chunkText, index) => {
    const promptText = selectedEmotion !== 'Neutral' ? `Say in a ${selectedEmotion.toLowerCase()} tone: ${chunkText}` : chunkText;
    const payload = { contents: [{ parts: [{ text: promptText }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } } }, model: "gemini-2.5-flash-preview-tts" };
    let attempt = 0, delay = 1000;
    while (attempt < 5) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message);
        const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        const binaryString = atob(inlineData.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
        return { bytes, mimeType: inlineData.mimeType, index };
      } catch (err) { 
        attempt++; 
        if (attempt >= 5) throw new Error(`အပိုင်း (${index + 1}) အား ဖန်တီးရာတွင် အမှားဖြစ်နေပါသည်။ ခဏစောင့်ပြီး ပြန်စမ်းကြည့်ပါ။`); 
        await new Promise(r => setTimeout(r, delay)); 
        delay *= 2; 
      }
    }
  };

  const handleGenerate = async () => {
    if(!apiKey) return setErrorMsg("Vercel တွင် VITE_GEMINI_API_KEY ကို ထည့်ပေးပါ။");
    if (!text.trim()) return setErrorMsg("ကျေးဇူးပြု၍ စာသားထည့်ပေးပါ။");
    setIsGenerating(true); setErrorMsg('');
    const textChunks = chunkText(text, 1200); 
    
    try {
      const results = [];
      // တစ်ပြိုင်နက်တည်း အကုန်မတောင်းဘဲ Free API ကန့်သတ်ချက်ကို ရှောင်ရှားရန် တစ်ပိုဒ်ချင်းစီ တောင်းပါမည်
      for(let i=0; i < textChunks.length; i++) {
         setProgressText(`အပိုင်း (${textChunks.length}) ပိုင်းအနက် (${i+1}) ပိုင်းမြောက် ဖန်တီးနေပါသည် ⚡`);
         const res = await fetchChunkData(textChunks[i], i);
         results.push(res);
         // API ကန့်သတ်ချက် (Rate limit) မထိအောင် ၂ စက္ကန့် စောင့်ပေးပါမည်
         if(i < textChunks.length - 1) {
             await new Promise(resolve => setTimeout(resolve, 2000));
         }
      }
      
      let allPcmBytes = new Uint8Array(0);
      let finalSampleRate = 24000;
      let currentTimeSeconds = 0;
      let subtitlesData = [];

      for (let i = 0; i < results.length; i++) {
        if (!results[i]) continue;
        if (results[i].index === 0 && results[i].mimeType.match(/rate=(\d+)/)) {
          finalSampleRate = parseInt(results[i].mimeType.match(/rate=(\d+)/)[1], 10);
        }
        const silenceBytesLength = i > 0 ? Math.floor((finalSampleRate * 2) * 0.3) : 0; 
        const mergedBytes = new Uint8Array(allPcmBytes.length + silenceBytesLength + results[i].bytes.length);
        mergedBytes.set(allPcmBytes);
        if (silenceBytesLength > 0) mergedBytes.set(new Uint8Array(silenceBytesLength), allPcmBytes.length);
        mergedBytes.set(results[i].bytes, allPcmBytes.length + silenceBytesLength);
        allPcmBytes = mergedBytes;

        const silenceDuration = i > 0 ? 0.3 : 0;
        const chunkDuration = results[i].bytes.length / (finalSampleRate * 2); 
        const startTime = currentTimeSeconds + silenceDuration;
        const endTime = startTime + chunkDuration;
        
        subtitlesData.push({ id: i + 1, start: formatSrtTime(startTime), end: formatSrtTime(endTime), text: textChunks[i] });
        currentTimeSeconds = endTime;
      }

      const wavBlob = createWavFile(allPcmBytes, finalSampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      const newItem = { 
        id: Date.now(), text: text, voice: VOICES.find(v => v.id === selectedVoice), emotion: EMOTIONS.find(e => e.id === selectedEmotion), bgm: BGM_OPTIONS.find(b => b.id === selectedBGM), audioUrl, subtitlesData, timestamp: new Date().toLocaleString() 
      };
      
      setHistory(prev => [newItem, ...prev]); 
      setActiveTab('history'); 
    } catch (err) { setErrorMsg(err.message || "အမှားအယွင်းဖြစ်ပေါ်နေပါသည်။"); } 
    finally { setIsGenerating(false); setProgressText(''); }
  };

  const isDark = theme === 'dark';
  const appBg = isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900';
  const panelBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200 shadow-xl shadow-gray-200/50';

  return (
    <div className={`min-h-screen ${appBg} p-4 md:p-6 font-sans transition-colors duration-300 selection:bg-blue-500/30`}>
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 pb-8 border-b border-gray-500/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/20"><Film className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center flex-wrap gap-2">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">Text to Voice</span>
            <span className={`text-xl ${isDark ? 'text-gray-600' : 'text-gray-300'} font-light`}>|</span>
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 bg-clip-text text-transparent drop-shadow-sm">MZ Movie Recap</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`p-2.5 rounded-full transition-all ${isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-white text-gray-700 shadow-md hover:bg-gray-50'}`}>
            {isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>
          <div className={`flex gap-2 p-1 rounded-full text-sm font-bold border ${isDark ? 'bg-gray-900 border-white/5' : 'bg-white border-gray-200 shadow-sm'}`}>
              <button onClick={() => setActiveTab('generator')} className={`px-6 py-2.5 rounded-full transition-all ${activeTab === 'generator' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20' : 'text-gray-500 hover:text-gray-400'}`}>ဖန်တီးရန်</button>
              <button onClick={() => setActiveTab('history')} className={`px-6 py-2.5 rounded-full transition-all ${activeTab === 'history' ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-500/20' : 'text-gray-500 hover:text-gray-400'}`}>မှတ်တမ်း</button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-10">
        {activeTab === 'generator' && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className={`relative ${panelBg} rounded-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all overflow-hidden`}>
                <div className={`flex justify-between items-center px-5 py-4 border-b ${isDark ? 'border-white/5 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
                  <span className="text-sm font-bold text-gray-400 flex items-center gap-2"><Mic className="w-4 h-4"/> ဇာတ်လမ်းစာသား ထည့်သွင်းပါ</span>
                  <div className="flex gap-2">
                    <button onClick={handleClearText} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`} title="စာသားများ ဖျက်ရန်"><Eraser className="w-4 h-4" /> ရှင်းမည်</button>
                    <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl border transition-all ${isDark ? 'bg-gray-800 text-blue-400 border-blue-500/20 hover:bg-gray-700' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}><Upload className="w-4 h-4" /> ဖိုင်မှယူရန်</button>
                    <input type="file" accept=".txt" ref={fileInputRef} onChange={(e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = (e) => setText(e.target.result); r.readAsText(f); e.target.value = null; } }} className="hidden" />
                  </div>
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="MZ Movie Recap အတွက် ဇာတ်လမ်းပြန်ပြောစာသားများကို ဤနေရာတွင် ရိုက်ထည့်ပါ..." className={`w-full h-[380px] bg-transparent p-6 outline-none resize-none text-lg leading-relaxed custom-scrollbar ${isDark ? 'text-gray-100' : 'text-gray-800'}`} />
                <div className={`absolute bottom-4 right-4 text-xs font-bold px-3 py-1.5 rounded-lg border flex items-center gap-2 ${isDark ? 'bg-gray-950/80 text-gray-400 border-white/10 backdrop-blur-sm' : 'bg-white/80 text-gray-600 border-gray-200 backdrop-blur-sm shadow-sm'}`}>
                  📝 စာလုံးရေ: {text.length} <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse ml-1" title="Auto-saving enabled"></span>
                </div>
              </div>

              {errorMsg && <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl flex items-center gap-3"><AlertCircle className="w-5 h-5" /> <p className="text-sm font-medium">{errorMsg}</p></div>}

              <button onClick={handleGenerate} disabled={isGenerating || text.trim().length === 0}
                className={`w-full py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 transition-all ${isGenerating ? 'bg-gray-600 text-white/50 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-xl shadow-blue-500/25 transform hover:-translate-y-1'}`}>
                {isGenerating ? <><Zap className="w-6 h-6 text-yellow-300 animate-pulse" /> <span>{progressText} ({formatTime(genTimer)})</span></> : <><Play className="w-6 h-6 fill-white" /> <span>Recap အသံ ဖန်တီးရန်</span></>}
              </button>
            </div>
            
            <div className="space-y-6">
              <div className={`${panelBg} rounded-2xl p-6`}>
                <div className="mb-6">
                  <label className="text-sm font-black mb-3 flex items-center gap-2"><Activity className="w-4 h-4 text-blue-500" /> အသံသရုပ်ဆောင်</label>
                  <div className="flex gap-2 items-center">
                    <select value={selectedVoice} onChange={(e) => { setSelectedVoice(e.target.value); setPreviewState('idle'); previewAudioRef.current.pause(); }} className={`flex-1 p-3.5 rounded-xl border outline-none font-medium ${isDark ? 'bg-gray-950 border-white/10 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}>
                        {VOICES.map(v => <option key={v.id} value={v.id}>{v.name} ({v.gender})</option>)}
                    </select>
                    <button onClick={handlePreview} disabled={previewState === 'loading'} className={`flex flex-col items-center justify-center p-2 rounded-xl border w-[72px] h-[54px] transition-colors ${previewState === 'playing' ? 'bg-blue-500/20 border-blue-500 text-blue-500' : isDark ? 'bg-gray-950 border-white/10 text-blue-400 hover:border-blue-500/50' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'}`} title="အသံနမူနာ နားထောင်ရန်">
                      {previewState === 'loading' ? <Loader2 className="w-4 h-4 animate-spin mb-1" /> : previewState === 'playing' ? <Pause className="w-4 h-4 mb-1" /> : <Volume2 className="w-4 h-4 mb-1" />}
                      <span className="text-[10px] font-bold">နမူနာ</span>
                    </button>
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="text-sm font-black mb-3 flex items-center gap-2"><Gauge className="w-4 h-4 text-pink-500" /> စိတ်ခံစားချက်</label>
                  <div className="grid grid-cols-2 gap-2 h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {EMOTIONS.map(e => (
                      <button key={e.id} onClick={() => setSelectedEmotion(e.id)} className={`p-3 text-sm rounded-xl border flex items-center justify-start px-3 gap-3 transition-all ${selectedEmotion === e.id ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-pink-500 font-bold shadow-sm' : isDark ? 'bg-gray-950 border-white/5 text-gray-400 hover:bg-gray-800' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-white'}`}>
                        <span className="text-lg">{e.emoji}</span> <span className="truncate">{e.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-black mb-3 flex items-center gap-2"><Music className="w-4 h-4 text-amber-500" /> နောက်ခံတေးဂီတ (BGM)</label>
                  <select value={selectedBGM} onChange={(e) => setSelectedBGM(e.target.value)} className={`w-full p-4 rounded-xl border outline-none font-medium ${isDark ? 'bg-gray-950 border-white/10 text-white focus:border-amber-500/50' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-amber-500'}`}>
                      {BGM_OPTIONS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 pb-20">
            {history.length > 0 && (
              <div className="flex justify-between items-center mb-4 px-2">
                <h2 className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>ဖန်တီးထားသော အသံများ ({history.length})</h2>
                <button onClick={handleClearHistory} className={`text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${isDark ? 'text-red-400 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-50'}`}>
                  <Trash2 className="w-4 h-4"/> မှတ်တမ်းအားလုံးဖျက်မည်
                </button>
              </div>
            )}
            
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-gray-500">
                <Headphones className="w-20 h-20 mb-6 opacity-20" /> 
                <p className="text-lg font-medium">မှတ်တမ်း မရှိသေးပါ။ အသံစတင်ဖန်တီးပါ။</p>
              </div>
            ) : (
              history.map((item) => <AdvancedPlayer key={item.id} item={item} theme={theme} onDelete={(id) => setHistory(prev => prev.filter(i => i.id !== id))} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
