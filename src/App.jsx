import React, { useState, useEffect, useMemo } from 'react';
import { 
  Download, Clock, CheckCircle, XCircle, ChevronRight, ChevronLeft, 
  Menu, X, Play, AlertCircle, ArrowLeft, Globe, RefreshCw,
  Activity, Microscope, Dna, HeartPulse, Sparkles, ExternalLink,
  Lock, Laugh
} from 'lucide-react';

// Robust CSV Parser to handle commas inside quotes from Google Sheets
const parseCSV = (str) => {
  const arr = [];
  let quote = false;
  let row = 0, col = 0;
  for (let c = 0; c < str.length; c++) {
    let cc = str[c], nc = str[c+1];
    arr[row] = arr[row] || [];
    arr[row][col] = arr[row][col] || '';
    if (cc === '"' && quote && nc === '"') { arr[row][col] += cc; ++c; continue; }
    if (cc === '"') { quote = !quote; continue; }
    if (cc === ',' && !quote) { ++col; continue; }
    if (cc === '\r' && nc === '\n' && !quote) { ++row; col = 0; ++c; continue; }
    if (cc === '\n' && !quote) { ++row; col = 0; continue; }
    if (cc === '\r' && !quote) { ++row; col = 0; continue; }
    arr[row][col] += cc;
  }
  return arr;
};

// MCQ CSV URL
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSksOpjcP0UhGd1xjdqoJ_rkNNoE5HbMXA8oCGxcQ4DN7nYA_zKutyeE606uTgvEe8S0M4n2SFUqUvq/pub?output=csv";

// WRITTEN EXAMS CSV URL
const WRITTEN_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSGlebNoTnX0hX46BYCbqnp9PvdJElBl_e6otjtAXuVRChFjSIxY8ZfOCCyxLexmwtYwYluOElzOl6v/pub?output=csv";

const translations = {
  en: {
    portalName: "Abdullah M Ahnaf's Exam Portal",
    portalYear: "2026-27",
    nameInput: "Candidate Name",
    subject: "Subject",
    chapter: "Chapter",
    all: "All",
    start: "Start Exam",
    downloadApp: "Install App",
    time: "Time Left",
    submit: "Submit Exam",
    next: "Next",
    prev: "Previous",
    score: "Your Score",
    totalQs: "Total Questions",
    correct: "Correct",
    wrong: "Wrong", // Removed penalty text
    unanswered: "Unanswered",
    review: "Review Answers",
    practiceNew: "Practice a new chapter",
    loading: "Loading questions from server...",
    error: "Error loading questions.",
    confirmSubmit: "Are you sure you want to submit your exam?",
    confirmBack: "Warning: Leaving this page will discard your current exam progress. Are you sure?",
    enterName: "Please enter your name",
    noQuestions: "No questions found for this selection.",
    examResult: "Exam Result",
    outOf: "out of",
    yourAnswer: "Your Answer",
    correctAnswer: "Correct",
    notAnswered: "Not Answered",
    navBack: "Back",
    recentlyAdded: "Recently Added",
    instructions: "Each MCQ carries 1 mark. No negative marking. Timer starts immediately.",
    cancel: "Cancel",
    confirm: "Yes, Confirm",
    ok: "Okay",
    writtenExamInfo: "Written Exam: Question paper will be provided in PDF format.",
    openPdf: "Open Written Question Paper"
  }
};

// Array of funny loading memes/gifs
const loadingMemes = [
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3AyNWx2dHN1YWhtZDNzbnA0ZjR6NmJ0NjU1NWU0Z2p0ZW4wdXBmeCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7Tksj4Tq3Jxa1K9y/giphy.gif", // Spongebob waiting
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExc29lYXk4bXhzdHhxMXl2NWlyNDMxcXVxbzI1YXp6bm5pYXF4Mm16cyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tXL4FHPSnVJ0A/giphy.gif", // Waiting skeleton
  "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGJ3eDdyZXBxdTZyMW41dWRxMjZxcXB2NDkyanEzNXF6MzF2MDI1eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/brHaCdJqCXijm/giphy.gif" // Homer bush
];

// Determine result meme based on score percentage
const getResultMeme = (percentage) => {
  if (percentage >= 80) return "https://i.imgflip.com/1bhk.jpg"; // Success kid
  if (percentage >= 40) return "https://i.imgflip.com/1iruch.jpg"; // This is fine dog
  return "https://i.imgflip.com/1jwhww.jpg"; // Hide the pain harold
};

const FooterCredit = () => (
  <div className="mt-8 text-center text-slate-500 text-[13px] font-medium animate-in fade-in duration-700 pb-2">
    <p>Created by <span className="font-bold text-slate-700">Mehrab Hossain</span>, Dhaka Medical College</p>
    <p className="flex items-center justify-center gap-1.5 mt-2 opacity-90">
      Co-created with
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-0.5">
        <path d="M11.778 1.492a.85.85 0 0 1 1.444 0c1.077 1.83 2.923 3.654 4.792 4.73 1.868 1.076 3.692 2.922 4.769 4.753.308.523.308 1.169 0 1.692-1.077 1.83-2.923 3.654-4.792 4.73-1.868 1.076-3.692 2.922-4.769-4.753a.85.85 0 0 1-1.444 0c-1.077-1.83-2.923-3.654-4.792-4.73-1.868-1.076-3.692-2.922-4.769-4.753a1.002 1.002 0 0 1 0-1.692c1.077-1.83 2.923-3.654 4.792-4.73 1.868-1.076 3.692-2.922 4.769-4.753Z" fill="url(#gemini-grad)"/>
        <defs>
          <linearGradient id="gemini-grad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1A73E8"/>
            <stop offset="50%" stopColor="#9b72cb"/>
            <stop offset="100%" stopColor="#d96570"/>
          </linearGradient>
        </defs>
      </svg>
      <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-red-500">Gemini</span>
    </p>
  </div>
);

export default function App() {
  const lang = 'en'; // Forced to English
  const t = translations[lang];

  // App States: 'setup', 'mcq-exam', 'mcq-result', 'written-exam'
  const [appState, setAppState] = useState('setup');
  
  // Data States
  const [rawMcqQuestions, setRawMcqQuestions] = useState([]);
  const [rawWrittenQuestions, setRawWrittenQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  // Custom Modal State (replaces alert/confirm)
  const [modalConfig, setModalConfig] = useState(null); 

  // User Selections
  // HARDCODED STUDENT NAME
  const [userName, setUserName] = useState('Abdullah M Ahnaf');
  const [examType, setExamType] = useState('mcq'); // 'mcq' or 'written'
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedChapter, setSelectedChapter] = useState('All');
  
  // MCQ Exam States
  const [activeMcqQuestions, setActiveMcqQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // Written Exam State
  const [activePdfUrl, setActivePdfUrl] = useState('');

  // Random meme selector for loading screen
  const [currentLoadingMeme, setCurrentLoadingMeme] = useState('');

  useEffect(() => {
    setCurrentLoadingMeme(loadingMemes[Math.floor(Math.random() * loadingMemes.length)]);
    
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') setInstallPrompt(null);
    });
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const mcqPromise = fetch(SHEET_CSV_URL).then(res => res.text());
        const writtenPromise = fetch(WRITTEN_SHEET_CSV_URL).then(res => res.text());

        const [mcqText, writtenText] = await Promise.all([mcqPromise, writtenPromise]);

        // --- Parse MCQ Data ---
        const parsedMcq = parseCSV(mcqText);
        if (parsedMcq.length > 1) {
          const headers = parsedMcq[0].map(h => h.toLowerCase().trim());
          
          const idx = {
            question: headers.findIndex(h => h.includes('question')),
            optA: headers.findIndex(h => h === 'option a' || h === 'option 1' || h === 'a'),
            optB: headers.findIndex(h => h === 'option b' || h === 'option 2' || h === 'b'),
            optC: headers.findIndex(h => h === 'option c' || h === 'option 3' || h === 'c'),
            optD: headers.findIndex(h => h === 'option d' || h === 'option 4' || h === 'd'),
            answer: headers.findIndex(h => h.includes('answer') || h.includes('correct')),
            subject: headers.findIndex(h => h.includes('subject')),
            chapter: headers.findIndex(h => h.includes('chapter')),
          };

          const qs = [];
          for (let i = 1; i < parsedMcq.length; i++) {
            const row = parsedMcq[i];
            if (!row || row.length < 5 || !row[idx.question]) continue; 
            
            const optA = row[idx.optA !== -1 ? idx.optA : 1];
            const optB = row[idx.optB !== -1 ? idx.optB : 2];
            const optC = row[idx.optC !== -1 ? idx.optC : 3];
            const optD = row[idx.optD !== -1 ? idx.optD : 4];
            const options = [optA, optB, optC, optD].filter(Boolean);

            let ansRaw = row[idx.answer !== -1 ? idx.answer : 5];
            let resolvedAns = ansRaw;
            if (ansRaw) {
              const cleanAns = ansRaw.toString().trim().toLowerCase();
              const map = { 'a': optA, 'b': optB, 'c': optC, 'd': optD, '1': optA, '2': optB, '3': optC, '4': optD };
              if (map[cleanAns] !== undefined) {
                resolvedAns = map[cleanAns];
              }
            }

            qs.push({
              id: i,
              text: row[idx.question !== -1 ? idx.question : 0],
              options: options,
              correctAnswer: resolvedAns,
              subject: idx.subject !== -1 && row[idx.subject] ? row[idx.subject] : 'General',
              chapter: idx.chapter !== -1 && row[idx.chapter] ? row[idx.chapter] : 'General'
            });
          }
          setRawMcqQuestions(qs);
        }

        // --- Parse Written Data ---
        const parsedWritten = parseCSV(writtenText);
        if (parsedWritten.length > 1) {
          const wHeaders = parsedWritten[0].map(h => h.toLowerCase().trim());
          const wIdx = {
            subject: wHeaders.findIndex(h => h.includes('subject')),
            chapter: wHeaders.findIndex(h => h.includes('chapter')),
            pdf: wHeaders.findIndex(h => h.includes('pdf') || h.includes('url') || h.includes('link'))
          };

          const wQs = [];
          for (let i = 1; i < parsedWritten.length; i++) {
            const row = parsedWritten[i];
            if (!row || row.length < 2) continue; 
            
            // Clean up the URL - trim handles invisible spaces from sheets
            let rawUrl = wIdx.pdf !== -1 && row[wIdx.pdf] ? row[wIdx.pdf].trim() : (row[2] ? row[2].trim() : "");
            
            // Convert standard drive share link to preview mode
            if (rawUrl.includes('/view')) {
              rawUrl = rawUrl.split('/view')[0] + '/preview';
            }

            wQs.push({
              subject: wIdx.subject !== -1 && row[wIdx.subject] ? row[wIdx.subject].trim() : 'General',
              chapter: wIdx.chapter !== -1 && row[wIdx.chapter] ? row[wIdx.chapter].trim() : 'General',
              pdfUrl: rawUrl
            });
          }
          setRawWrittenQuestions(wQs);
        }

        setLoading(false);
      } catch (err) {
        console.error("Failed to load CSVs: ", err);
        setError(true);
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const availableSubjects = useMemo(() => {
    if (examType === 'mcq') {
      return Array.from(new Set(rawMcqQuestions.map(q => q.subject)));
    } else {
      return Array.from(new Set(rawWrittenQuestions.map(w => w.subject)));
    }
  }, [rawMcqQuestions, rawWrittenQuestions, examType]);

  const availableChapters = useMemo(() => {
    let qs = examType === 'mcq' ? rawMcqQuestions : rawWrittenQuestions;
    if (selectedSubject !== 'All') {
      qs = qs.filter(q => q.subject === selectedSubject);
    }
    const unique = Array.from(new Set(qs.map(q => q.chapter)));
    
    return unique.sort((a, b) => {
      const numA = parseInt(a.match(/\d+/) ? a.match(/\d+/)[0] : '99999', 10);
      const numB = parseInt(b.match(/\d+/) ? b.match(/\d+/)[0] : '99999', 10);
      if (numA !== numB) return numA - numB;
      return a.localeCompare(b);
    });
  }, [rawMcqQuestions, rawWrittenQuestions, selectedSubject, examType]);

  useEffect(() => {
    setSelectedChapter('All');
  }, [selectedSubject, examType]);

  const startExam = () => {
    if (examType === 'mcq') {
      let filtered = rawMcqQuestions;
      if (selectedSubject !== 'All') filtered = filtered.filter(q => q.subject === selectedSubject);
      if (selectedChapter !== 'All') filtered = filtered.filter(q => q.chapter === selectedChapter);
      
      if (filtered.length === 0) {
        setModalConfig({ type: 'alert', message: t.noQuestions });
        return;
      }

      filtered = filtered.sort(() => Math.random() - 0.5);

      setActiveMcqQuestions(filtered);
      setAnswers({});
      setCurrentQIndex(0);
      setTimeLeft(filtered.length * 60); // 1 min per Q
      setAppState('mcq-exam');

    } else {
      let filtered = rawWrittenQuestions;
      if (selectedSubject !== 'All') filtered = filtered.filter(w => w.subject === selectedSubject);
      if (selectedChapter !== 'All') filtered = filtered.filter(w => w.chapter === selectedChapter);

      if (filtered.length === 0) {
        setModalConfig({ type: 'alert', message: "No Written questions found for this selection." });
        return;
      }
      
      if (filtered.length > 1 && selectedChapter === 'All') {
        setModalConfig({ type: 'alert', message: "Please select a specific Chapter for Written exams." });
        return;
      }

      setActivePdfUrl(filtered[0].pdfUrl);
      setAppState('written-exam');
    }
  };

  useEffect(() => {
    if (appState === 'mcq-exam' || appState === 'written-exam') {
      window.history.pushState(null, '', window.location.href);
      const handlePopState = () => {
        setModalConfig({
          type: 'confirm',
          message: t.confirmBack,
          onConfirm: () => {
            setModalConfig(null);
            setAppState('setup');
          },
          onCancel: () => {
            window.history.pushState(null, '', window.location.href);
            setModalConfig(null);
          }
        });
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [appState]);

  useEffect(() => {
    let timer;
    if (appState === 'mcq-exam' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (appState === 'mcq-exam' && timeLeft === 0) {
      setAppState('mcq-result');
      setModalConfig(null);
    }
    return () => clearInterval(timer);
  }, [appState, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (optIndex) => {
    setAnswers(prev => ({ ...prev, [currentQIndex]: optIndex }));
  };

  const attemptSubmit = () => {
    setModalConfig({
      type: 'confirm',
      message: t.confirmSubmit,
      onConfirm: () => {
        setModalConfig(null);
        setAppState('mcq-result');
      }
    });
  };

  const handleBackToSetup = () => {
    setModalConfig({
      type: 'confirm',
      message: t.confirmBack,
      onConfirm: () => {
        setModalConfig(null);
        setAppState('setup');
      }
    });
  };

  const Modal = () => {
    if (!modalConfig) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white max-w-sm w-full p-8 text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
          <p className="text-lg text-slate-800 font-semibold mb-8 leading-relaxed">
            {modalConfig.message}
          </p>
          <div className="flex gap-3 justify-center">
            {modalConfig.type === 'confirm' && (
              <button 
                onClick={() => modalConfig.onCancel ? modalConfig.onCancel() : setModalConfig(null)} 
                className="flex-1 px-4 py-3 bg-slate-100/80 text-slate-700 rounded-xl font-bold hover:bg-slate-200 hover:shadow-md transition-all duration-300 active:scale-95"
              >
                {t.cancel}
              </button>
            )}
            <button 
              onClick={() => {
                if(modalConfig.onConfirm) modalConfig.onConfirm();
                else setModalConfig(null);
              }} 
              className={`flex-1 px-4 py-3 text-white rounded-xl font-bold transition-all duration-300 active:scale-95 shadow-lg ${
                modalConfig.type === 'alert' 
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5'
              }`}
            >
              {modalConfig.type === 'alert' ? t.ok : t.confirm}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-slate-50 animate-in fade-in duration-500">
      <div className="text-center">
        <img src={currentLoadingMeme} alt="Loading Meme" className="w-64 h-64 object-cover rounded-3xl mx-auto mb-6 shadow-lg border-4 border-white" />
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-b-blue-600 mx-auto mb-5"></div>
        <p className="text-slate-600 font-bold tracking-wide text-lg flex items-center justify-center gap-2">
          {t.loading} <Laugh size={20} className="text-blue-500 animate-bounce"/>
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="text-center text-red-500 bg-red-50 p-8 rounded-[2rem] shadow-sm border border-red-100 max-w-md animate-in fade-in zoom-in-95 duration-500">
        <AlertCircle className="w-14 h-14 mx-auto mb-4 animate-bounce" />
        <p className="font-bold text-xl">{t.error}</p>
        <p className="text-sm mt-3 opacity-80 font-medium">Check your Google Sheet URLs and privacy settings. They must be "Published to the web" as CSV.</p>
      </div>
    </div>
  );

  if (appState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50/40 flex flex-col items-center justify-center p-4 font-sans relative selection:bg-blue-200">
        <Modal />
        
        {/* Top Controls: Install */}
        <div className="absolute top-6 left-6 right-6 flex justify-end items-start pointer-events-none z-10">
          {installPrompt && (
            <button 
              onClick={handleInstallClick} 
              className="pointer-events-auto flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 font-semibold"
            >
              <Download size={18} /> <span className="hidden sm:inline">{t.downloadApp}</span>
            </button>
          )}
        </div>

        <div className="w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-white mt-10 sm:mt-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-blue-950 p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
            
            {/* Custom Avatar for Abdullah */}
            <div className="relative w-28 h-28 mx-auto mb-6">
              <img 
                src="https://i.ibb.co.com/G376qgd0/image.png" 
                alt="Abdullah's Avatar" 
                className="w-full h-full object-cover rounded-[2rem] border-4 border-white/20 shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-blue-500/20 rounded-[2rem] blur-xl z-0 animate-pulse"></div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight tracking-tight relative z-10">
              {t.portalName}
            </h1>
            <p className="text-blue-200 font-medium mt-2 text-sm relative z-10 bg-white/10 inline-block px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">Class of {t.portalYear}</p>
          </div>

          <div className="p-8 sm:p-10 space-y-7 relative">
            
            {/* Exam Type Selector */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setExamType('mcq')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${examType === 'mcq' ? 'bg-white text-blue-700 shadow-md shadow-blue-900/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                MCQ Test
              </button>
              <button 
                onClick={() => setExamType('written')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${examType === 'written' ? 'bg-white text-blue-700 shadow-md shadow-blue-900/5' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Written Exam
              </button>
            </div>

            <div className="space-y-2.5 group relative">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                <Activity size={18} className="text-blue-500" /> {t.nameInput}
              </label>
              <div className="relative">
                <input 
                  type="text" 
                  value={userName} 
                  readOnly
                  className="w-full px-5 py-4 rounded-2xl border-2 border-blue-100 bg-blue-50/50 text-blue-900 outline-none font-bold shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 group-hover:text-blue-600 transition-colors animate-pulse">
                  <Lock size={18} />
                </div>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-5">
              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                  <Microscope size={18} className="text-blue-500 group-focus-within:text-blue-600 transition-colors" /> {t.subject}
                </label>
                <select 
                  value={selectedSubject} 
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-700 font-medium cursor-pointer appearance-none transition-all duration-300"
                >
                  <option value="All">{t.all}</option>
                  {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className="space-y-2.5 group">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 ml-1">
                  <Dna size={18} className="text-blue-500 group-focus-within:text-blue-600 transition-colors" /> {t.chapter}
                </label>
                <select 
                  value={selectedChapter} 
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-slate-700 font-medium cursor-pointer appearance-none transition-all duration-300"
                >
                  <option value="All">{t.all}</option>
                  {availableChapters.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 p-5 rounded-2xl text-sm flex items-start gap-3.5 border border-blue-100/50 shadow-inner">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
              {examType === 'mcq' ? (
                <p className="leading-relaxed font-medium">{t.instructions}</p>
              ) : (
                <p className="leading-relaxed font-medium">{t.writtenExamInfo}</p>
              )}
            </div>

            <button 
              onClick={startExam}
              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-lg py-4 sm:py-5 rounded-2xl shadow-[0_10px_30px_rgba(37,_99,_235,_0.3)] hover:shadow-[0_15px_40px_rgba(37,_99,_235,_0.4)] hover:-translate-y-1 active:translate-y-0.5 active:shadow-inner transition-all duration-300"
            >
              <Play size={22} fill="currentColor" /> {examType === 'mcq' ? t.start : t.openPdf}
            </button>
          </div>
        </div>

        <FooterCredit />
        
      </div>
    );
  }

  if (appState === 'mcq-exam') {
    const question = activeMcqQuestions[currentQIndex];
    const isAnswered = (idx) => answers[idx] !== undefined;

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-28 font-sans selection:bg-blue-200">
        <Modal />
        
        {/* Sticky Top Bar */}
        <div className="sticky top-0 bg-white/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] z-40 px-4 py-3 sm:py-4 flex items-center justify-between border-b border-white">
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={handleBackToSetup}
              className="p-2.5 -ml-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100/80 rounded-xl transition-all duration-300 hidden sm:flex items-center gap-1 active:scale-95"
              title={t.navBack}
            >
              <ArrowLeft size={22} />
            </button>
            <button 
              onClick={() => setIsPaletteOpen(!isPaletteOpen)}
              className="p-2.5 bg-slate-100/80 rounded-xl text-slate-700 hover:bg-slate-200 transition-all duration-300 md:hidden active:scale-95"
            >
              <Menu size={22} />
            </button>
            <div className="hidden md:flex flex-col">
              <span className="font-extrabold text-slate-800 text-sm tracking-tight">{userName}</span>
              <span className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1.5">
                {selectedSubject} <span className="w-1 h-1 rounded-full bg-slate-300"></span> {selectedChapter}
              </span>
            </div>
            <div className="text-sm bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-xl font-bold ml-2 border border-blue-100/50 shadow-sm">
               {currentQIndex + 1} / {activeMcqQuestions.length}
            </div>
          </div>
          
          <div className={`flex items-center gap-2.5 font-black px-5 py-2.5 rounded-xl border-2 transition-colors duration-300 shadow-sm ${timeLeft < 60 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
            <Clock size={20} className={timeLeft < 60 ? 'animate-bounce' : ''} /> {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Palette Drawer (Mobile) */}
        {isPaletteOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsPaletteOpen(false)}></div>
            <div className="w-80 bg-white h-full relative z-10 p-6 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-xl text-slate-800">Questions</h3>
                <button onClick={() => setIsPaletteOpen(false)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"><X size={20} /></button>
              </div>
              <div className="grid grid-cols-5 gap-3 overflow-y-auto pb-20 content-start">
                {activeMcqQuestions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setCurrentQIndex(idx); setIsPaletteOpen(false); }}
                    className={`w-11 h-11 rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-200
                      ${idx === currentQIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-4 ring-blue-100 scale-110 z-10' : 
                        isAnswered(idx) ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:-translate-y-0.5'}`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col md:flex-row gap-6 sm:gap-8 mt-4 sm:mt-8 relative">
          
          {/* Desktop Palette (Side) */}
          <div className="hidden md:flex w-[300px] bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 self-start sticky top-28 flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h3 className="font-extrabold text-slate-800 mb-5 pb-4 border-b border-slate-100 flex items-center justify-between">
              Navigation
              <span className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">{activeMcqQuestions.length} {t.totalQs}</span>
            </h3>
            <div className="grid grid-cols-5 gap-2.5 max-h-[55vh] overflow-y-auto pr-2 pb-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {activeMcqQuestions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`aspect-square rounded-xl font-bold text-sm flex items-center justify-center transition-all duration-300
                    ${idx === currentQIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110 z-10' : 
                      isAnswered(idx) ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-400' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:-translate-y-0.5 hover:shadow-sm'}`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="mt-auto pt-5 border-t border-slate-100 flex flex-col gap-3 text-xs text-slate-600 font-bold">
               <span className="flex items-center gap-2.5"><div className="w-4 h-4 bg-emerald-500 rounded-md shadow-sm shadow-emerald-500/20"></div> Answered</span>
               <span className="flex items-center gap-2.5"><div className="w-4 h-4 bg-slate-50 border border-slate-200 rounded-md"></div> Unanswered</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="flex-1 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-6 sm:p-10 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-[100px] -z-10 opacity-50"></div>
            
            <div key={currentQIndex} className="animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-both">
              <div className="mb-8 sm:mb-10">
                <div className="flex flex-wrap gap-2.5 mb-5 sm:mb-6">
                  <span className="px-3.5 py-1.5 bg-blue-50/80 text-blue-700 rounded-xl text-xs font-extrabold border border-blue-100/50 shadow-sm">
                    {question.subject}
                  </span>
                  <span className="px-3.5 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold border border-slate-200/60 shadow-sm">
                    {question.chapter}
                  </span>
                </div>
                <h2 className="text-xl sm:text-[22px] font-bold text-slate-800 leading-relaxed whitespace-pre-wrap select-none tracking-tight">
                  <span className="text-blue-600 font-black mr-2 text-2xl">{currentQIndex + 1}.</span> 
                  {question.text}
                </h2>
              </div>
              
              <div className="space-y-3.5">
                {question.options.map((opt, oIdx) => (
                  <div 
                    key={oIdx} 
                    onClick={() => handleOptionSelect(oIdx)}
                    className={`group flex items-start p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      answers[currentQIndex] === oIdx 
                        ? 'border-blue-500 bg-blue-50/40 shadow-[0_4px_20px_rgba(59,130,246,0.08)] scale-[1.01]' 
                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50/80 hover:shadow-sm'
                    }`}
                  >
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 mr-4 sm:mr-5 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all duration-300 ${
                      answers[currentQIndex] === oIdx ? 'border-blue-600 bg-blue-600 shadow-inner' : 'border-slate-300 group-hover:border-blue-400'
                    }`}>
                      {answers[currentQIndex] === oIdx && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full animate-in zoom-in duration-200"></div>}
                    </div>
                    <span className={`text-[17px] sm:text-[18px] leading-snug transition-colors duration-300 ${answers[currentQIndex] === oIdx ? 'text-slate-900 font-bold' : 'text-slate-700 font-medium'}`}>
                      {opt}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Bottom Nav */}
        <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-5 bg-white/70 backdrop-blur-2xl border-t border-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40 safe-area-pb">
          <div className="max-w-5xl mx-auto flex justify-between items-center gap-3 sm:gap-6">
            <button 
              onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
              disabled={currentQIndex === 0}
              className="flex-1 max-w-[160px] flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-700 px-4 py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 transition-all duration-300 font-bold"
            >
              <ChevronLeft size={22} /> <span className="hidden sm:inline">{t.prev}</span>
            </button>

            <button 
              onClick={attemptSubmit}
              className="flex-[2] max-w-[320px] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-extrabold px-4 py-4 rounded-2xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 shadow-md group"
            >
              <span className="flex items-center justify-center gap-2">
                <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /> {t.submit}
              </span>
            </button>

            <button 
              onClick={() => setCurrentQIndex(prev => Math.min(activeMcqQuestions.length - 1, prev + 1))}
              disabled={currentQIndex === activeMcqQuestions.length - 1}
              className="flex-1 max-w-[160px] flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-4 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 hover:shadow-lg hover:shadow-slate-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 font-bold shadow-md"
            >
              <span className="hidden sm:inline">{t.next}</span> <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (appState === 'mcq-result') {
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    activeMcqQuestions.forEach((q, idx) => {
      const selectedIdx = answers[idx];
      if (selectedIdx === undefined) {
        unansweredCount++;
      } else {
        const selectedText = q.options[selectedIdx];
        if (selectedText && q.correctAnswer && selectedText.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase()) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    });

    const rawScore = correctCount;
    const total = activeMcqQuestions.length;
    const percentage = (rawScore / total) * 100;

    const memeUrl = getResultMeme(percentage);

    return (
      <div className="min-h-screen bg-slate-50 p-4 py-8 md:py-12 font-sans selection:bg-blue-200">
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden border border-white animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="bg-slate-900 p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent animate-pulse" style={{ animationDuration: '4s' }}></div>
            <h1 className="text-4xl md:text-5xl font-black text-white relative z-10 mb-4 tracking-tight animate-in slide-in-from-top-4 duration-500">{t.examResult}</h1>
            
            {/* Formatted to match requested design: Ahnaf • Zoology • Chapter */}
            <p className="text-slate-300 relative z-10 text-lg md:text-xl font-semibold flex flex-wrap items-center justify-center gap-2.5 animate-in slide-in-from-top-4 duration-500 delay-100 fill-mode-both">
              <span className="text-white">{userName}</span>
              <span className="opacity-40">•</span>
              <span className="text-blue-300">{selectedSubject}</span>
              {selectedChapter !== 'All' && (
                <>
                  <span className="opacity-40">•</span>
                  <span className="text-blue-300">{selectedChapter}</span>
                </>
              )}
            </p>
          </div>

          <div className="p-6 md:p-12 relative">
            {/* Score & Meme Display */}
            <div className="flex flex-col items-center justify-center mb-14 -mt-24 relative z-20">
              <div className="w-48 h-48 rounded-full border-[12px] border-slate-50 flex flex-col items-center justify-center shadow-2xl bg-white animate-in zoom-in duration-700 delay-200 fill-mode-both hover:scale-105 transition-transform duration-500">
                <span className="text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-blue-600 to-indigo-600 tracking-tighter drop-shadow-sm">{rawScore}</span>
                <span className="text-slate-400 font-extrabold uppercase text-xs tracking-[0.2em] mt-2 border-t-2 border-slate-100 pt-2 w-1/2 text-center">{t.outOf} {total}</span>
              </div>
              
              {/* Dynamic Meme Based on Score */}
              <div className="mt-8 animate-in slide-in-from-bottom-4 duration-700 delay-500">
                <img src={memeUrl} alt="Reaction Meme" className="w-64 h-auto rounded-2xl shadow-lg border-4 border-white rotate-2 hover:-rotate-2 transition-transform duration-300" />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-6 mb-14 animate-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
              <div className="bg-emerald-50 rounded-3xl p-5 md:p-7 text-center border border-emerald-100/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <CheckCircle className="w-10 h-10 md:w-12 md:h-12 text-emerald-500 mx-auto mb-3.5" />
                <div className="text-3xl md:text-4xl font-black text-emerald-700 mb-1.5">{correctCount}</div>
                <div className="text-[10px] md:text-xs font-black text-emerald-600 uppercase tracking-widest">{t.correct}</div>
              </div>
              <div className="bg-red-50 rounded-3xl p-5 md:p-7 text-center border border-red-100/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <XCircle className="w-10 h-10 md:w-12 md:h-12 text-red-500 mx-auto mb-3.5" />
                <div className="text-3xl md:text-4xl font-black text-red-700 mb-1.5">{wrongCount}</div>
                <div className="text-[10px] md:text-xs font-black text-red-600 uppercase tracking-widest whitespace-pre-line leading-tight">{t.wrong}</div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-5 md:p-7 text-center border border-slate-200/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <AlertCircle className="w-10 h-10 md:w-12 md:h-12 text-slate-400 mx-auto mb-3.5" />
                <div className="text-3xl md:text-4xl font-black text-slate-600 mb-1.5">{unansweredCount}</div>
                <div className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-widest">{t.unanswered}</div>
              </div>
            </div>

            <div className="flex justify-center mb-16 animate-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
               <button 
                onClick={() => {
                  setAppState('setup');
                  setAnswers({});
                }}
                className="group flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-900 text-white font-bold text-lg py-5 px-10 rounded-[1.25rem] transition-all duration-300 shadow-[0_15px_30px_rgba(15,23,42,0.2)] hover:shadow-[0_20px_40px_rgba(15,23,42,0.3)] hover:-translate-y-1 active:translate-y-0.5"
              >
                <RefreshCw size={22} className="group-hover:rotate-180 transition-transform duration-500" /> {t.practiceNew}
              </button>
            </div>

            {/* Answer Review Section */}
            <div className="space-y-8 animate-in fade-in duration-1000 delay-700 fill-mode-both">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800 border-b-2 border-slate-100 pb-5 flex items-center gap-3">
                <HeartPulse className="text-blue-600 w-8 h-8 sm:w-10 sm:h-10" /> {t.review}
              </h3>
              
              {activeMcqQuestions.map((q, idx) => {
                const selectedIdx = answers[idx];
                const selectedText = selectedIdx !== undefined ? q.options[selectedIdx] : null;
                const isCorrect = selectedText && q.correctAnswer && selectedText.toString().trim().toLowerCase() === q.correctAnswer.toString().trim().toLowerCase();
                const isUnanswered = selectedIdx === undefined;

                return (
                  <div key={idx} className={`p-6 sm:p-8 rounded-[2rem] border-2 transition-all duration-300 hover:shadow-lg ${
                    isCorrect ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200' : 
                    isUnanswered ? 'bg-slate-50/50 border-slate-100 hover:border-slate-200' : 
                    'bg-red-50/30 border-red-100 hover:border-red-200'
                  }`}>
                    <p className="font-bold text-slate-800 text-lg sm:text-xl mb-6 leading-relaxed tracking-tight">
                      <span className="text-slate-400 mr-2 font-black text-2xl">{idx + 1}.</span> {q.text}
                    </p>
                    
                    <div className="space-y-3">
                      {q.options.map((opt, oIdx) => {
                        const isThisOptionSelected = selectedIdx === oIdx;
                        const isThisOptionCorrect = opt.toString().trim().toLowerCase() === q.correctAnswer?.toString().trim().toLowerCase();
                        
                        let optStyle = "bg-white border-slate-100 text-slate-600 shadow-sm";
                        let Icon = null;

                        if (isThisOptionCorrect) {
                          optStyle = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-md shadow-emerald-500/10 scale-[1.01] z-10 relative";
                          Icon = <CheckCircle size={20} className="text-emerald-600 drop-shadow-sm" />;
                        } else if (isThisOptionSelected && !isThisOptionCorrect) {
                          optStyle = "bg-red-50 border-red-400 text-red-900 font-bold shadow-md shadow-red-500/10 scale-[1.01] z-10 relative";
                          Icon = <XCircle size={20} className="text-red-600 drop-shadow-sm" />;
                        }

                        return (
                          <div key={oIdx} className={`p-4 sm:p-5 rounded-2xl border-2 flex items-center justify-between transition-all duration-300 ${optStyle}`}>
                            <span className="text-[16px] sm:text-[17px] leading-snug">{opt}</span>
                            {Icon && <span className="ml-4 flex-shrink-0 animate-in zoom-in duration-300">{Icon}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-16 text-center pb-4">
              <button 
                onClick={() => {
                  setAppState('setup');
                  setAnswers({});
                }}
                className="text-slate-400 hover:text-slate-800 font-bold flex items-center justify-center gap-2 mx-auto transition-colors duration-300"
              >
                <ArrowLeft size={18} /> Go back to start screen
              </button>
              
              <div className="mt-12 border-t border-slate-100 pt-6">
                <FooterCredit />
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  if (appState === 'written-exam') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans">
        
        {/* Header */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAppState('setup')} 
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={20} /> <span className="hidden sm:inline font-medium text-sm">Back</span>
            </button>
            <div className="w-px h-6 bg-slate-700 hidden sm:block"></div>
            <div>
              <div className="font-bold text-white text-sm sm:text-base leading-tight">Written Questions</div>
              <div className="text-xs text-slate-400">{selectedSubject} • {selectedChapter}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a 
              href={activePdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg"
            >
              <ExternalLink size={16} /> <span className="hidden sm:inline">Open in New Tab</span>
            </a>
          </div>
        </div>

        {/* PDF Viewer Container */}
        <div className="flex-1 w-full bg-slate-900 relative">
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-6 text-center z-0">
             <div className="animate-pulse mb-6">
                <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExajlzNGF4MmIxeWV5bXF6bTczdXBxODNxYnR4YzIzbmw4OWtxeHZwayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2JHVUriDGEtWOx0c/giphy.gif" alt="waiting" className="w-48 rounded-xl opacity-50 grayscale" />
             </div>
             <p className="mb-2 font-medium">If the PDF doesn't load automatically below,</p>
             <a href={activePdfUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline font-bold">
               Click here to view it in a new tab
             </a>
          </div>
          
          <iframe 
            src={`${activePdfUrl}#toolbar=0&navpanes=0`} 
            className="absolute inset-0 w-full h-full border-0 z-10 bg-white shadow-2xl"
            title="Written Exam Question Paper"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return null;
}