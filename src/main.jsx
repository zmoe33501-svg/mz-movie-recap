import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Play, Loader2, Mic, Activity, Gauge, Clock, Pause, Trash2, Download, Volume2, AlertCircle, Upload, Zap, Sun, Moon, Music, Film, Eraser, Headphones } from 'lucide-react';

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
  { id: 'Whisper', label: 'တိုးတိုးပြော', emoji: '🤫' }, { id: 'Storytelling', label: 'ပုံပြင်ပြော', emoji: '📖' }
];

const BGM_OPTIONS = [
  { id: 'none', label: 'နောက်ခံတေးဂီတ မပါ', url: '' },
  { id: 'suspense', label: 'သည်းထိတ်ရင်ဖို (Suspense)', url: 'https://ia802500.us.archive.org/6/items/KevinMacLeod-PreludeAndAction/Prelude%20and%20Action.mp3' }
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
      }
    }
  };

  const isDark = theme === 'dark';
  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border rounded-2xl p-5 mb-4`}>
      <div className="flex-1 min-w-0">
         <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="bg-blue-500/20 text-blue-500 px-3 py-1 rounded-full text-xs font-bold">{item.voice.name}</span>
            <span className="text-xs text-gray-500 ml-auto">{item.timestamp}</span>
         </div>
         <p className={`${isDark ? 'text-gray-200' : 'text-gray-800'} text-sm line-clamp-2`}>{item.text}</p>
      </div>
      
      <div className={`flex items-center gap-4 mt-4 ${isDark ? 'bg-black/40' : 'bg-gray-100'} p-3 rounded-2xl`}>
        <button onClick={togglePlay} className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <input type="range" min="0" max={duration || 100} value={progress} onChange={handleSeek} className="w-full h-1.5 bg-gray-300 rounded-lg accent-blue-500" />
          <div className="flex justify-between text-[10px] text-gray-500"><span>{formatTime(progress)}</span><span>{formatTime(duration)}</span></div>
        </div>
        
        <div className="relative">
          <button onClick={() => setShowDownloads(!showDownloads)} className="p-2 bg-blue-600 text-white rounded-lg">
            <Download className="w-4 h-4" />
          </button>
          {showDownloads && (
            <div className={`absolute right-0 bottom-full mb-2 w-40 rounded-xl shadow-xl border p-2 z-20 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <button onClick={() => handleDownload('wav')} className="w-full text-left px-3 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg mb-1">🎵 WAV Audio</button>
              {item.subtitlesData && item.subtitlesData.length > 0 && (
                  <button onClick={() => handleDownload('srt')} className="w-full text-left px-3 py-2 text-xs font-bold text-white bg-amber-500 rounded-lg">📝 SRT Sub</button>
              )}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(item.id)} className="p-2 text-red-500 bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        
        <audio ref={mainAudioRef} src={item.audioUrl} onTimeUpdate={handleTimeUpdate} onLoadedMetadata={() => setDuration(mainAudioRef.current.duration)} onPlay={() => { setIsPlaying(true); if(bgmAudioRef.current) bgmAudioRef.current.play(); }} onPause={() => { setIsPlaying(false); if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} onEnded={() => { setIsPlaying(false); if(bgmAudioRef.current) bgmAudioRef.current.pause(); }} />
        {item.bgm && item.bgm.url && <audio ref={bgmAudioRef} src={item.bgm.url} />}
      </div>
    </div>
  );
};

const App = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('generator');
  const [text, setText] = useState("");
  const [selectedVoice, setSelectedVoice] = useState('Charon');
  const [selectedEmotion, setSelectedEmotion] = useState('Neutral');
  const [selectedBGM, setSelectedBGM] = useState('none');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressText, setProgressText] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');
  const [history, setHistory] = useState([]);

  const handleGenerate = async () => {
    if(!apiKey) return setErrorMsg("Vercel တွင် VITE_GEMINI_API_KEY ကို ထည့်ပေးပါ။");
    if (!text.trim()) return setErrorMsg("ကျေးဇူးပြု၍ စာသားထည့်ပေးပါ။");
    setIsGenerating(true); setErrorMsg('');
    const textChunks = chunkText(text, 1200); 
    
    try {
      setProgressText('အသံဖန်တီးနေပါသည်...');
      const results = [];
      for(let i=0; i<textChunks.length; i++) {
        const payload = { contents: [{ parts: [{ text: textChunks[i] }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } } } }, model: "gemini-2.5-flash-preview-tts" };
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const data = await response.json();
        const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        const binaryString = atob(inlineData.data);
        const bytes = new Uint8Array(binaryString.length);
        for (let j = 0; j < binaryString.length; j++) bytes[j] = binaryString.charCodeAt(j);
        results.push({ bytes, mimeType: inlineData.mimeType, index: i });
      }
      
      let allPcmBytes = new Uint8Array(0);
      let finalSampleRate = 24000;
      let currentTimeSeconds = 0;
      let subtitlesData = [];

      for (let i = 0; i < results.length; i++) {
        if (results[i].index === 0 && results[i].mimeType.match(/rate=(\d+)/)) finalSampleRate = parseInt(results[i].mimeType.match(/rate=(\d+)/)[1], 10);
        const mergedBytes = new Uint8Array(allPcmBytes.length + results[i].bytes.length);
        mergedBytes.set(allPcmBytes);
        mergedBytes.set(results[i].bytes, allPcmBytes.length);
        allPcmBytes = mergedBytes;

        const chunkDuration = results[i].bytes.length / (finalSampleRate * 2); 
        subtitlesData.push({ id: i + 1, start: formatSrtTime(currentTimeSeconds), end: formatSrtTime(currentTimeSeconds + chunkDuration), text: textChunks[i] });
        currentTimeSeconds += chunkDuration;
      }

      const wavBlob = createWavFile(allPcmBytes, finalSampleRate);
      const audioUrl = URL.createObjectURL(wavBlob);
      
      setHistory(prev => [{ id: Date.now(), text, voice: VOICES.find(v => v.id === selectedVoice), emotion: EMOTIONS.find(e => e.id === selectedEmotion), bgm: BGM_OPTIONS.find(b => b.id === selectedBGM), audioUrl, subtitlesData, timestamp: new Date().toLocaleString() }, ...prev]); 
      setActiveTab('history'); 
    } catch (err) { setErrorMsg("အမှားအယွင်းဖြစ်ပေါ်နေပါသည်။ API Key စစ်ဆေးပါ။"); } 
    finally { setIsGenerating(false); setProgressText(''); }
  };

  const isDark = theme === 'dark';
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900'} p-4 md:p-6 font-sans`}>
      <header className="max-w-4xl mx-auto flex justify-between items-center pb-6 border-b border-gray-500/20">
        <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-2"><Film className="w-6 h-6 text-blue-500"/> MZ Movie Recap</h1>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab('generator')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeTab === 'generator' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>ဖန်တီးရန်</button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-full text-sm font-bold ${activeTab === 'history' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>မှတ်တမ်း</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-6">
        {activeTab === 'generator' && (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
               <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="ဇာတ်လမ်းပြန်ပြောစာသားများကို ဤနေရာတွင် ရိုက်ထည့်ပါ..." className={`w-full h-[250px] bg-transparent outline-none resize-none text-base ${isDark ? 'text-gray-100' : 'text-gray-800'}`} />
            </div>
            {errorMsg && <div className="bg-red-500/10 text-red-500 p-3 rounded-xl text-sm font-bold flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {errorMsg}</div>}
            
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} grid grid-cols-2 gap-4`}>
                <div>
                    <label className="block text-xs font-bold mb-2 text-gray-400">အသံသရုပ်ဆောင်</label>
                    <select value={selectedVoice} onChange={(e) => setSelectedVoice(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-sm ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-300'}`}>
                        {VOICES.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-xs font-bold mb-2 text-gray-400">စိတ်ခံစားချက်</label>
                     <select value={selectedEmotion} onChange={(e) => setSelectedEmotion(e.target.value)} className={`w-full p-3 rounded-xl border outline-none text-sm ${isDark ? 'bg-gray-950 border-gray-800 text-white' : 'bg-gray-50 border-gray-300'}`}>
                        {EMOTIONS.map(e => <option key={e.id} value={e.id}>{e.emoji} {e.label}</option>)}
                    </select>
                </div>
            </div>

            <button onClick={handleGenerate} disabled={isGenerating} className={`w-full py-4 rounded-2xl font-bold text-lg flex justify-center items-center gap-2 ${isGenerating ? 'bg-gray-600 text-white/50' : 'bg-blue-600 text-white'}`}>
                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> {progressText}</> : <><Play className="w-5 h-5" /> အသံဖန်တီးရန်</>}
            </button>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            {history.map((item) => <AdvancedPlayer key={item.id} item={item} theme={theme} onDelete={(id) => setHistory(prev => prev.filter(i => i.id !== id))} />)}
            {history.length === 0 && <div className="text-center text-gray-500 mt-20 flex flex-col items-center"><Headphones className="w-16 h-16 mb-4 opacity-20"/>မှတ်တမ်း မရှိသေးပါ။</div>}
          </div>
        )}
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);
