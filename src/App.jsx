import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Play,
  Home,
  History,
  Star,
  Award,
  Check,
  X,
  AlertCircle,
  Sparkles,
  Loader2,
  Lock,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";

// ==========================================
// 🪄 ZONA API GEMINI
// ==========================================
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

async function callGeminiAPI(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  let retries = 5;
  let delay = 1000;
  while (retries > 0) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("API Error");
      const data = await response.json();
      return (
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "M-am încurcat în magie, scuze!"
      );
    } catch (error) {
      retries--;
      if (retries === 0)
        return "Eroare de conexiune la magie. Mai încearcă târziu!";
      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
}

// ==========================================
// 🛠️ ZONA DE CONFIGURARE MAGAZIN
// ==========================================
const INITIAL_SHOP_ITEMS = [
  {
    id: 1,
    name: "Sticker Virtual Stea",
    cost: 20,
    icon: "⭐",
    description: "O stea strălucitoare pentru caietul tău.",
  },
  {
    id: 2,
    name: "5 minute de pauză",
    cost: 50,
    icon: "⏳",
    description: "Poți folosi acest cupon pentru 5 minute de joacă în plus.",
  },
  {
    id: 3,
    name: "Diplomă de Campion",
    cost: 100,
    icon: "📜",
    description: "O diplomă specială pentru abilitățile tale matematice.",
  },
  {
    id: 4,
    name: "Avatar Super-Erou",
    cost: 150,
    icon: "🦸‍♂️",
    description: "Deblochează un nou personaj pentru profilul tău.",
  },
  {
    id: 5,
    name: "Fără teme la mate (1 zi)",
    cost: 500,
    icon: "🎉",
    description: "Biletul magic! (Aprobare necesară de la părinți/profesor)",
  },
];

export default function App() {
  const [view, setView] = useState("menu"); // 'menu', 'game', 'shop', 'parent'
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);

  // Adaugă o înregistrare în istoric
  const addHistory = (message, amount, type = "earn") => {
    const timestamp = new Date().toLocaleTimeString("ro-RO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setHistory((prev) => [
      { id: Date.now(), message, amount, type, time: timestamp },
      ...prev,
    ]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-100 to-indigo-100 font-sans text-slate-800 selection:bg-yellow-300 relative overflow-x-hidden">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes float-delay { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-5deg); } }
        @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 5s ease-in-out infinite; animation-delay: 1s; }
        .animate-wiggle { animation: wiggle 2s ease-in-out infinite; }
        .animate-pop { animation: pop 0.3s ease-in-out; }
        .bg-math-pattern { background-image: radial-gradient(circle at 10px 10px, rgba(255,255,255,0.2) 2px, transparent 0); background-size: 40px 40px; }
      `}</style>

      {/* Fundal animat cu simboluri matematice */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-30">
        <div className="absolute top-10 left-10 text-6xl text-blue-600 font-black animate-float">
          +
        </div>
        <div className="absolute top-40 right-20 text-7xl text-purple-600 font-black animate-float-delay">
          -
        </div>
        <div className="absolute bottom-20 left-[20%] text-8xl text-yellow-500 font-black animate-float">
          x
        </div>
        <div className="absolute top-1/3 left-1/3 text-5xl text-green-500 font-black animate-float-delay">
          ÷
        </div>
        <div className="absolute bottom-40 right-[25%] text-6xl text-pink-500 font-black animate-float">
          =
        </div>
      </div>

      <header className="bg-white/80 backdrop-blur-md shadow-sm p-4 sticky top-0 z-20 border-b-2 border-white">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setView("menu")}
          >
            <div className="bg-blue-500 p-2 rounded-xl">
              <Award className="text-white" size={28} />
            </div>
            <h1 className="text-2xl font-black text-blue-600 tracking-tight hidden sm:block">
              Aventura Matematică
            </h1>
            <h1 className="text-2xl font-black text-blue-600 tracking-tight sm:hidden">
              Aventura
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setView("parent")}
              className="p-2 bg-slate-200 hover:bg-slate-300 rounded-full transition-colors flex items-center justify-center"
              title="Zona Părinților"
            >
              <Lock size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-2 bg-yellow-100 border-2 border-yellow-400 px-4 py-2 rounded-full shadow-sm">
              <Star className="text-yellow-500 fill-yellow-500" size={24} />
              <span className="text-xl font-bold text-yellow-700">
                {points}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {view === "menu" && <MainMenu setView={setView} />}
        {view === "game" && (
          <GameScreen setPoints={setPoints} addHistory={addHistory} />
        )}
        {view === "shop" && (
          <ShopScreen
            points={points}
            setPoints={setPoints}
            inventory={inventory}
            setInventory={setInventory}
            history={history}
            addHistory={addHistory}
            shopItems={shopItems}
          />
        )}
        {view === "parent" && (
          <ParentDashboard
            points={points}
            setPoints={setPoints}
            inventory={inventory}
            setInventory={setInventory}
            shopItems={shopItems}
            setShopItems={setShopItems}
            history={history}
            addHistory={addHistory}
          />
        )}
      </main>
    </div>
  );
}

// ==========================================
// MENIUL PRINCIPAL
// ==========================================
function MainMenu({ setView }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in mt-10 relative z-10">
      <div className="text-8xl animate-bounce mb-2 drop-shadow-xl">😺</div>
      <h2 className="text-5xl text-center font-extrabold text-blue-800 mb-4 drop-shadow-sm animate-wiggle">
        Bine ai venit la joacă!
      </h2>
      <p className="text-xl text-blue-900 font-medium text-center max-w-lg bg-white/60 p-4 rounded-3xl backdrop-blur-sm border-2 border-white shadow-sm">
        Rezolvă probleme de matematică, câștigă steluțe și cumpără premii
        grozave din magazinul virtual!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl mt-8">
        <button
          onClick={() => setView("game")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-blue-400 to-blue-500 border-4 border-blue-600 rounded-[2.5rem] transition-all shadow-[0_10px_0_0_#1e3a8a] hover:shadow-[0_15px_0_0_#1e3a8a] hover:-translate-y-2 active:translate-y-2 active:shadow-none group"
        >
          <div className="bg-white p-6 rounded-full mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-inner text-blue-500">
            <Play size={48} className="ml-2 fill-blue-500" />
          </div>
          <span className="text-3xl font-black text-white drop-shadow-md">
            Joacă Acum
          </span>
        </button>

        <button
          onClick={() => setView("shop")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-purple-400 to-purple-500 border-4 border-purple-600 rounded-[2.5rem] transition-all shadow-[0_10px_0_0_#581c87] hover:shadow-[0_15px_0_0_#581c87] hover:-translate-y-2 active:translate-y-2 active:shadow-none group"
        >
          <div className="bg-white p-6 rounded-full mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-transform shadow-inner text-purple-500">
            <ShoppingCart size={48} className="fill-purple-500" />
          </div>
          <span className="text-3xl font-black text-white drop-shadow-md">
            Magazin
          </span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ECRANUL DE JOC (LOGICA MATEMATICĂ)
// ==========================================
function GameScreen({ setPoints, addHistory }) {
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [hint, setHint] = useState(null);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const inputRef = useRef(null);

  // Funcție pentru generarea unei probleme noi
  const generateProblem = () => {
    // 0: Adunare, 1: Scădere, 2: Înmulțire, 3: Împărțire, 4: Ordinea operațiilor (ușor), 5: Paranteze rotunde
    const type = Math.floor(Math.random() * 6);
    let text = "";
    let correctAnswer = 0;
    let reward = 10;

    switch (type) {
      case 0: // Adunare (până la 100)
        const a1 = Math.floor(Math.random() * 50) + 10;
        const b1 = Math.floor(Math.random() * 40) + 5;
        text = `${a1} + ${b1}`;
        correctAnswer = a1 + b1;
        reward = 5;
        break;
      case 1: // Scădere (rezultat pozitiv)
        const a2 = Math.floor(Math.random() * 50) + 20;
        const b2 = Math.floor(Math.random() * a2);
        text = `${a2} - ${b2}`;
        correctAnswer = a2 - b2;
        reward = 5;
        break;
      case 2: // Înmulțire (tabla înmulțirii 0-10)
        const a3 = Math.floor(Math.random() * 11);
        const b3 = Math.floor(Math.random() * 11);
        text = `${a3} x ${b3}`;
        correctAnswer = a3 * b3;
        reward = 10;
        break;
      case 3: // Împărțire (fără rest)
        const divisor = Math.floor(Math.random() * 10) + 1; // 1-10
        const quotient = Math.floor(Math.random() * 11); // 0-10
        const dividend = divisor * quotient;
        text = `${dividend} : ${divisor}`;
        correctAnswer = quotient;
        reward = 10;
        break;
      case 4: // Ordinea operațiilor (ex: 5 + 2 x 3)
        const a4 = Math.floor(Math.random() * 10) + 1;
        const b4 = Math.floor(Math.random() * 6);
        const c4 = Math.floor(Math.random() * 6);
        // Ex: a + b * c
        if (Math.random() > 0.5) {
          text = `${a4} + ${b4} x ${c4}`;
          correctAnswer = a4 + b4 * c4;
        } else {
          // Ex: a * b - c (asigurăm pozitiv)
          const multResult = a4 * b4;
          const subtr = Math.floor(Math.random() * multResult);
          text = `${a4} x ${b4} - ${subtr}`;
          correctAnswer = multResult - subtr;
        }
        reward = 15;
        break;
      case 5: // Paranteze rotunde
        const subType = Math.floor(Math.random() * 3);
        if (subType === 0) {
          // Tip: (a + b) x c
          const a5 = Math.floor(Math.random() * 5) + 1; // 1-5
          const b5 = Math.floor(Math.random() * 5) + 1; // 1-5
          const c5 = Math.floor(Math.random() * 4) + 2; // 2-5
          text = `(${a5} + ${b5}) x ${c5}`;
          correctAnswer = (a5 + b5) * c5;
        } else if (subType === 1) {
          // Tip: c x (a - b)
          const a5 = Math.floor(Math.random() * 10) + 5; // 5-14
          const b5 = Math.floor(Math.random() * (a5 - 1)) + 1; // ne asigurăm că a5 > b5
          const c5 = Math.floor(Math.random() * 5) + 2; // 2-6
          text = `${c5} x (${a5} - ${b5})`;
          correctAnswer = c5 * (a5 - b5);
        } else {
          // Tip: a - (b + c)
          const b5 = Math.floor(Math.random() * 10) + 1;
          const c5 = Math.floor(Math.random() * 10) + 1;
          const a5 = Math.floor(Math.random() * 20) + (b5 + c5); // a5 e mereu mai mare decât suma lor
          text = `${a5} - (${b5} + ${c5})`;
          correctAnswer = a5 - (b5 + c5);
        }
        reward = 20;
        break;
      default:
        break;
    }

    setProblem({ text, answer: correctAnswer, reward, isStory: false });
    setAnswer("");
    setFeedback(null);
    setHint(null);
    if (inputRef.current) inputRef.current.focus();
  };

  // Inițializează prima problemă la montare
  useEffect(() => {
    generateProblem();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer && answer !== "0") return;

    const numAnswer = parseInt(answer, 10);

    if (numAnswer === problem.answer) {
      setFeedback({
        type: "success",
        message: `Bravo! Ai primit ${problem.reward} puncte.`,
      });
      setPoints((prev) => prev + problem.reward);
      addHistory(
        `Răspuns corect: ${problem.isStory ? "Poveste" : problem.text} = ${problem.answer}`,
        problem.reward,
        "earn",
      );

      // Așteaptă puțin, apoi treci la următoarea problemă
      setTimeout(() => {
        generateProblem();
      }, 2500); // Timp mărit pentru a putea citi mesajul
    } else {
      setFeedback({ type: "error", message: `Greșit. Încearcă din nou!` });
      addHistory(
        `Răspuns greșit la: ${problem.isStory ? "Poveste" : problem.text}`,
        0,
        "fail",
      );
      setAnswer("");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const handleMakeStory = async () => {
    setIsMagicLoading(true);
    const prompt = `Ești un profesor de clasa a 2-a amuzant și prietenos. Transformă următorul exercițiu matematic într-o scurtă problemă de poveste pentru un copil de 8 ani: "${problem.text}". Folosește un limbaj extrem de simplu și captivant, maxim 2 scurte propoziții. Nu scrie rezultatul în text! Răspunde doar cu povestea. Fii creativ (ex: cu dinozauri, pirați, nave spațiale, animale).`;
    const response = await callGeminiAPI(prompt);
    setProblem((prev) => ({ ...prev, text: response, isStory: true }));
    setIsMagicLoading(false);
  };

  const handleGetHint = async () => {
    setIsMagicLoading(true);
    const prompt = `Ești un profesor răbdător de clasa a 2-a. Un copil trebuie să rezolve exercițiul: "${problem.isStory ? problem.text : problem.text}". Rezultatul final este ${problem.answer}. Oferă-i un scurt indiciu logic sau o metodă de gândire (o analogie simplă vizuală) pentru a rezolva problema. NU îi spune direct rezultatul final! Fii foarte scurt, maxim o propoziție prietenoasă. Începe cu "Gândește-te așa: "`;
    const response = await callGeminiAPI(prompt);
    setHint(response);
    setIsMagicLoading(false);
  };

  if (!problem)
    return (
      <div className="text-center mt-20 relative z-10">
        <Loader2 className="animate-spin mx-auto text-blue-500" size={64} />
      </div>
    );

  return (
    <div className="max-w-xl mx-auto mt-10 animate-fade-in relative z-10">
      <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white transform transition-transform hover:scale-[1.01] duration-300">
        <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 p-8 text-center relative overflow-hidden">
          {/* Strat separat pentru fundalul cu buline pentru a nu șterge gradientul */}
          <div className="absolute inset-0 bg-math-pattern opacity-50"></div>

          {/* Textul a fost mutat într-un strat deasupra (z-10) */}
          <div className="relative z-10">
            <h2 className="text-white text-xl font-black opacity-90 uppercase tracking-widest mb-4 drop-shadow-sm">
              Rezolvă exercițiul
            </h2>
            <div
              className={`text-white font-black drop-shadow-lg tracking-wider transition-all duration-500 ${problem.isStory ? "text-2xl leading-relaxed px-4" : "text-7xl animate-float"}`}
            >
              {problem.text} {problem.isStory ? "" : "= ?"}
            </div>
            <div className="mt-6 inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full text-white text-base font-bold border-2 border-white/30 shadow-inner">
              <Star
                size={20}
                className="fill-yellow-300 text-yellow-300 animate-wiggle"
              />{" "}
              Recompensă: {problem.reward} puncte
            </div>
          </div>
        </div>

        {/* Zona de butoane Magice Gemini */}
        <div className="px-8 pt-6 flex flex-col sm:flex-row gap-4 justify-center">
          {!problem.isStory && (
            <button
              type="button"
              onClick={handleMakeStory}
              disabled={isMagicLoading || feedback?.type === "success"}
              className="flex-1 bg-gradient-to-b from-purple-100 to-purple-200 border-2 border-purple-300 hover:from-purple-200 hover:to-purple-300 text-purple-800 font-bold py-3 px-4 rounded-2xl text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm active:scale-95 group"
            >
              {isMagicLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Sparkles
                  size={20}
                  className="group-hover:animate-wiggle text-purple-500"
                />
              )}
              ✨ Poveste Magică
            </button>
          )}
          {!hint && (
            <button
              type="button"
              onClick={handleGetHint}
              disabled={isMagicLoading || feedback?.type === "success"}
              className="flex-1 bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-300 hover:from-amber-200 hover:to-amber-300 text-amber-800 font-bold py-3 px-4 rounded-2xl text-sm transition-all flex justify-center items-center gap-2 disabled:opacity-50 shadow-sm active:scale-95 group"
            >
              {isMagicLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Sparkles
                  size={20}
                  className="group-hover:animate-wiggle text-amber-500"
                />
              )}
              ✨ Ajutor Magic
            </button>
          )}
        </div>

        {hint && (
          <div className="mx-8 mt-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-l-8 border-amber-400 rounded-2xl shadow-sm text-amber-900 text-base font-bold italic animate-fade-in relative">
            <span className="absolute -top-3 -left-3 text-3xl animate-bounce">
              🧙‍♂️
            </span>
            <span className="ml-4">" {hint} "</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-8 pt-6">
          <input
            ref={inputRef}
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full text-center text-5xl font-black p-6 bg-slate-50 border-4 border-slate-200 rounded-[2rem] focus:border-blue-500 focus:bg-white focus:outline-none transition-all shadow-inner text-blue-900 placeholder:text-slate-300"
            placeholder="..."
            autoFocus
          />

          <button
            type="submit"
            className="w-full mt-8 bg-gradient-to-b from-green-400 to-green-500 hover:from-green-300 hover:to-green-400 text-white text-3xl font-black py-5 rounded-3xl border-4 border-green-600 shadow-[0_8px_0_0_#166534] hover:shadow-[0_12px_0_0_#166534] active:translate-y-2 active:shadow-none transition-all flex justify-center items-center gap-3 group"
          >
            Verifică{" "}
            <Check
              size={36}
              className="group-hover:scale-125 transition-transform"
            />
          </button>
        </form>

        {feedback && (
          <div
            className={`p-6 mx-8 mb-8 rounded-3xl font-black text-center text-xl shadow-inner border-4 ${feedback.type === "success" ? "bg-gradient-to-r from-green-200 to-green-300 text-green-900 animate-pop border-green-400" : "bg-gradient-to-r from-red-200 to-red-300 text-red-900 animate-wiggle border-red-400"}`}
          >
            {feedback.type === "success" ? "🎉 " : "💥 "}
            {feedback.message}
            {feedback.type === "success" ? " 🥳" : " 🧐"}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ECRANUL MAGAZINULUI (PRODUSE ȘI ISTORIC)
// ==========================================
function ShopScreen({
  points,
  setPoints,
  inventory,
  setInventory,
  history,
  addHistory,
  shopItems,
}) {
  const [activeTab, setActiveTab] = useState("shop"); // 'shop', 'history', 'inventory'

  const handleBuy = (item) => {
    if (points >= item.cost) {
      setPoints((prev) => prev - item.cost);
      setInventory((prev) => [...prev, { ...item, purchaseDate: new Date() }]);
      addHistory(`Ai cumpărat: ${item.name}`, -item.cost, "spend");
    } else {
      alert(
        "Nu ai suficiente puncte! Joacă mai mult pentru a strânge steluțe.",
      );
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden mt-6 relative z-10">
      {/* Tabs / Meniu Magazin */}
      <div className="flex border-b-4 border-slate-100 bg-slate-50/50">
        <button
          onClick={() => setActiveTab("shop")}
          className={`flex-1 py-5 text-xl font-black transition-colors ${activeTab === "shop" ? "bg-purple-100 text-purple-800 border-b-4 border-purple-500" : "text-slate-500 hover:bg-purple-50 hover:text-purple-600"}`}
        >
          Magazin
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex-1 py-5 text-xl font-black transition-colors flex justify-center items-center gap-2 ${activeTab === "inventory" ? "bg-blue-100 text-blue-800 border-b-4 border-blue-500" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          Lucrurile mele{" "}
          <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-inner">
            {inventory.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-5 text-xl font-black transition-colors ${activeTab === "history" ? "bg-slate-200 text-slate-800 border-b-4 border-slate-600" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}
        >
          Istoric Puncte
        </button>
      </div>

      <div className="p-6 sm:p-8 min-h-[400px]">
        {/* VIEW: MAGAZIN */}
        {activeTab === "shop" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border-4 border-purple-100 rounded-[2rem] p-5 flex items-start gap-4 hover:border-purple-300 hover:shadow-xl hover:-translate-y-2 transition-all transform group"
              >
                <div className="text-6xl bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-xl text-slate-800">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="flex items-center gap-1 font-black text-yellow-600 bg-yellow-100 border-2 border-yellow-200 px-3 py-1.5 rounded-xl shadow-sm group-hover:animate-pop">
                      <Star
                        size={20}
                        className="fill-yellow-500 text-yellow-500"
                      />{" "}
                      {item.cost}
                    </span>
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={points < item.cost}
                      className={`px-6 py-2.5 rounded-2xl font-black text-lg border-b-4 transition-all ${points >= item.cost ? "bg-gradient-to-b from-purple-400 to-purple-500 hover:from-purple-300 hover:to-purple-400 text-white border-purple-700 active:translate-y-1 active:border-b-0 shadow-md" : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"}`}
                    >
                      Cumpără
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VIEW: LUCRURILE MELE (INVENTORY) */}
        {activeTab === "inventory" && (
          <div>
            {inventory.length === 0 ? (
              <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                <AlertCircle size={48} className="text-slate-300 mb-4" />
                <p className="text-xl font-bold">Nu ai cumpărat nimic încă.</p>
                <p className="text-base mt-2">
                  Rezolvă exerciții și cumpără premii din magazin!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {inventory.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-200 rounded-[2rem] p-5 text-center flex flex-col items-center justify-center animate-fade-in shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-6xl mb-3 animate-float">
                      {item.icon}
                    </div>
                    <span className="font-black text-slate-700 text-base leading-tight">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW: ISTORIC PUNCTE */}
        {activeTab === "history" && (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {history.length === 0 ? (
              <p className="text-center text-slate-500 py-8 font-bold">
                Nicio activitate momentan.
              </p>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white p-5 rounded-2xl border-4 border-slate-100 shadow-sm hover:border-slate-200 transition-colors"
                >
                  <div>
                    <p className="font-bold text-lg text-slate-800">
                      {item.message}
                    </p>
                    <p className="text-sm text-slate-400 font-medium">
                      {item.time}
                    </p>
                  </div>
                  <div
                    className={`text-xl font-black flex items-center gap-1 ${item.type === "earn" ? "text-green-500" : item.type === "spend" ? "text-red-500" : "text-slate-400"}`}
                  >
                    {item.type === "earn" ? "+" : ""}
                    {item.amount}{" "}
                    <Star
                      size={20}
                      className={item.amount > 0 ? "fill-green-500" : ""}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ZONA PĂRINȚILOR (PARENT DASHBOARD)
// ==========================================
function ParentDashboard({
  points,
  setPoints,
  inventory,
  setInventory,
  shopItems,
  setShopItems,
  history,
  addHistory,
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [activeTab, setActiveTab] = useState("shop_manage");

  // Stări pentru formularul de adăugare produs nou
  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newItemIcon, setNewItemIcon] = useState("🎁");
  const [newItemDesc, setNewItemDesc] = useState("");

  // Stări pentru acordare puncte
  const [bonusPoints, setBonusPoints] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === "1234") {
      // PIN DEFAULT: 1234
      setIsAuthenticated(true);
    } else {
      alert("PIN incorect!");
      setPin("");
    }
  };

  const handleDeleteItem = (id) => {
    setShopItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName || !newItemCost || !newItemIcon) return;

    const newItem = {
      id: Date.now(),
      name: newItemName,
      cost: parseInt(newItemCost, 10),
      icon: newItemIcon,
      description: newItemDesc || "Un premiu surpriză!",
    };

    setShopItems((prev) => [...prev, newItem]);
    setNewItemName("");
    setNewItemCost("");
    setNewItemIcon("🎁");
    setNewItemDesc("");
  };

  const handleUseInventoryItem = (indexToRemove, itemName) => {
    setInventory((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    addHistory(`Premiu folosit/revendicat: ${itemName}`, 0, "info");
  };

  const handleAddBonus = (e) => {
    e.preventDefault();
    if (!bonusPoints) return;
    const amount = parseInt(bonusPoints, 10);
    setPoints((prev) => prev + amount);
    addHistory(
      `Bonus acordat de părinte`,
      amount,
      amount >= 0 ? "earn" : "spend",
    );
    setBonusPoints("");
    alert(`Acțiune realizată! Punctele au fost actualizate.`);
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto mt-20 bg-white p-8 rounded-3xl shadow-xl border-2 border-slate-100 animate-fade-in relative z-10">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-100 p-4 rounded-full">
            <Lock className="text-slate-600" size={40} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center text-slate-700 mb-2">
          Acces Părinți
        </h2>
        <p className="text-center text-slate-500 mb-6 text-sm">
          Introduceți codul PIN pentru a gestiona magazinul. <br />
          (Hint: 1234)
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full text-center text-2xl font-bold p-3 border-2 border-slate-200 rounded-xl focus:border-blue-400 focus:outline-none"
            placeholder="****"
            maxLength={4}
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
          >
            Deblochează
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden mt-6 animate-fade-in relative z-10">
      <div className="bg-slate-800 p-4 sm:px-8 text-white flex items-center gap-3">
        <Settings size={24} />
        <h2 className="text-xl font-bold">Panou de Control Părinți</h2>
      </div>

      <div className="flex border-b-2 border-slate-100 flex-wrap">
        <button
          onClick={() => setActiveTab("shop_manage")}
          className={`flex-1 py-4 text-sm sm:text-base font-bold transition-colors ${activeTab === "shop_manage" ? "bg-slate-50 text-slate-800 border-b-4 border-slate-800" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Editează Magazin
        </button>
        <button
          onClick={() => setActiveTab("inventory_manage")}
          className={`flex-1 py-4 text-sm sm:text-base font-bold transition-colors ${activeTab === "inventory_manage" ? "bg-slate-50 text-slate-800 border-b-4 border-slate-800" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Inventar Copil
        </button>
        <button
          onClick={() => setActiveTab("points_manage")}
          className={`flex-1 py-4 text-sm sm:text-base font-bold transition-colors ${activeTab === "points_manage" ? "bg-slate-50 text-slate-800 border-b-4 border-slate-800" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Modifică Puncte
        </button>
      </div>

      <div className="p-6 sm:p-8 min-h-[400px]">
        {/* --- TAB: GESTIONARE MAGAZIN --- */}
        {activeTab === "shop_manage" && (
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus size={20} className="text-blue-500" /> Adaugă Premiu Nou
              </h3>
              <form
                onSubmit={handleAddItem}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    Nume Premiu
                  </label>
                  <input
                    required
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="ex: O înghețată"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    Cost (Puncte ⭐)
                  </label>
                  <input
                    required
                    value={newItemCost}
                    onChange={(e) => setNewItemCost(e.target.value)}
                    type="number"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="ex: 200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    Emoji / Iconiță
                  </label>
                  <input
                    required
                    value={newItemIcon}
                    onChange={(e) => setNewItemIcon(e.target.value)}
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="ex: 🍦"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    Descriere scurtă
                  </label>
                  <input
                    value={newItemDesc}
                    onChange={(e) => setNewItemDesc(e.target.value)}
                    type="text"
                    className="w-full p-2 border border-slate-300 rounded-lg"
                    placeholder="ex: Mergem azi la gelaterie."
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                  >
                    Adaugă în Magazin
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">
                Premii Active în Magazin
              </h3>
              <div className="space-y-3">
                {shopItems.length === 0 && (
                  <p className="text-slate-500 italic">Magazinul este gol.</p>
                )}
                {shopItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl bg-slate-100 p-2 rounded-lg">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <p className="text-sm text-yellow-600 font-bold flex items-center gap-1">
                          <Star size={12} className="fill-yellow-500" />{" "}
                          {item.cost} puncte
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Șterge premiu"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- TAB: INVENTAR COPIL --- */}
        {activeTab === "inventory_manage" && (
          <div>
            <h3 className="font-bold text-lg mb-4">
              Premiile deținute de copil
            </h3>
            <p className="text-slate-500 mb-6 text-sm">
              Aici poți vedea ce a cumpărat copilul din magazin. Când îi oferi
              recompensa în realitate, poți apăsa butonul "Folosit" pentru a
              face curățenie în inventarul lui.
            </p>

            <div className="space-y-3">
              {inventory.length === 0 ? (
                <div className="text-center text-slate-500 py-8 bg-slate-50 rounded-xl">
                  Copilul nu are niciun premiu în inventar momentan.
                </div>
              ) : (
                inventory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white border border-slate-200 p-4 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{item.icon}</div>
                      <div>
                        <p className="font-bold text-slate-800">{item.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUseInventoryItem(index, item.name)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 hover:bg-green-200 font-bold rounded-lg transition-colors"
                    >
                      <CheckCircle2 size={18} /> Marchează Folosit
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- TAB: MODIFICĂ PUNCTE --- */}
        {activeTab === "points_manage" && (
          <div className="max-w-md">
            <h3 className="font-bold text-lg mb-2">Acordă sau Scade Puncte</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Vrei să-l premiezi pentru că a făcut curat în cameră? Adaugă
              puncte direct aici. Folosește semnul minus (-) pentru a scădea.
            </p>

            <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-lg font-bold text-slate-700">
                  Puncte Curente:
                </span>
                <span className="text-2xl font-black text-yellow-600 flex items-center gap-1">
                  {points} <Star className="fill-yellow-500" size={24} />
                </span>
              </div>

              <form onSubmit={handleAddBonus} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-slate-600 mb-1">
                    Sumă (ex: 50 sau -20)
                  </label>
                  <input
                    type="number"
                    required
                    value={bonusPoints}
                    onChange={(e) => setBonusPoints(e.target.value)}
                    className="w-full p-3 border-2 border-yellow-300 rounded-xl font-bold"
                    placeholder="+ / -"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                >
                  Aplică
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
