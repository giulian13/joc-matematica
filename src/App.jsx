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
  Loader2,
  Lock,
  Settings,
  Plus,
  Trash2,
  CheckCircle2,
  BookOpen,
  FileText,
} from "lucide-react";

// ==========================================
// 🚀 ZONA FIREBASE (BAZA DE DATE)
// ==========================================
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCustomToken,
  signInAnonymously,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

const getFirebaseConfig = () => {
  // 1. Mediul Canvas (pentru testare aici)
  if (typeof __firebase_config !== "undefined") {
    return JSON.parse(__firebase_config);
  }

  // 2. Mediul tău de pe Netlify / VSCode

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };
};

let app, auth, db;
try {
  const config = getFirebaseConfig();
  if (config && config.apiKey) {
    // Inițializează doar dacă am primit o cheie
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.error("Eroare la inițializarea Firebase:", e);
}

const APP_ID =
  typeof __app_id !== "undefined" ? __app_id : "joc-matematica-123";

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

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setError(
        err.message.includes("auth/")
          ? "Email sau parolă incorectă / invalidă."
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Conectarea cu Google a fost anulată.");
      } else {
        setError("Eroare la conectarea cu Google: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      await signInAnonymously(auth);
    } catch (err) {
      setError("Eroare la conectare.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-sky-100 to-indigo-100 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl w-full max-w-md relative z-10 animate-fade-in border-4 border-white">
        <div className="text-6xl text-center mb-4 animate-bounce">😺</div>
        <h2 className="text-3xl font-black text-center text-blue-800 mb-6 drop-shadow-sm">
          Aventura Matematică
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm font-bold text-center border-2 border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Email părinte
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border-4 border-slate-100 rounded-2xl focus:border-blue-400 focus:outline-none font-bold text-slate-700"
              placeholder="parinte@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              Parolă
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-4 border-slate-100 rounded-2xl focus:border-blue-400 focus:outline-none font-bold text-slate-700"
              placeholder="******"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-b from-blue-400 to-blue-500 hover:from-blue-300 hover:to-blue-400 border-4 border-blue-600 text-white font-black py-4 rounded-2xl transition-all shadow-[0_6px_0_0_#1e3a8a] active:translate-y-1 active:shadow-none mt-2"
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" size={24} />
            ) : isLogin ? (
              "Intră în cont"
            ) : (
              "Creează cont nou"
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-bold text-blue-600 hover:text-blue-800 underline"
          >
            {isLogin
              ? "Nu ai cont? Creează unul gratuit."
              : "Ai deja cont? Loghează-te."}
          </button>
        </div>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t-2 border-slate-100"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-black">
            SAU
          </span>
          <div className="flex-grow border-t-2 border-slate-100"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full bg-white hover:bg-slate-50 border-4 border-slate-200 text-slate-600 font-black py-3 rounded-2xl transition-all shadow-[0_4px_0_0_#e2e8f0] active:translate-y-1 active:shadow-none flex justify-center items-center gap-3"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" size={24} />
          ) : (
            <>
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Conectare cu Google
            </>
          )}
        </button>

        <div className="mt-8 pt-6 border-t-4 border-slate-100 text-center">
          <button
            type="button"
            onClick={handleAnonymous}
            disabled={loading}
            className="w-full bg-slate-200 hover:bg-slate-300 text-slate-600 font-black py-4 rounded-2xl transition-all border-4 border-slate-300 active:translate-y-1 active:border-b-0"
          >
            Joacă ca Vizitator (Fără cont)
          </button>
          <p className="text-xs text-slate-400 font-bold mt-3">
            Vizitatorii salvează progresul doar pe acest dispozitiv.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("menu");
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [shopItems, setShopItems] = useState(INITIAL_SHOP_ITEMS);
  const [homework, setHomework] = useState([]);

  // Stări pentru Firebase
  const [user, setUser] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const isDataLoaded = useRef(false);

  // 1. Conectare/Autentificare automată la baza de date
  useEffect(() => {
    if (!auth) {
      setDbLoading(false); // Dacă nu avem firebase config, continuă jocul offline
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setDbLoading(false); // Oprim ecranul de loading doar dacă nu e nimeni logat (afișăm meniul de login)
      }
    });

    const initAuth = async () => {
      try {
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else if (typeof __initial_auth_token !== "undefined") {
          // Rulează logarea anonimă automată DOAR pe platforma Canvas
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Eroare la conectare baza de date:", error);
        setDbLoading(false);
      }
    };
    initAuth();

    return () => unsubscribe();
  }, []);

  // 2. Descărcarea Salvării (Când aplicația se deschide)
  useEffect(() => {
    if (!user || !db) {
      isDataLoaded.current = false;
      return;
    }

    isDataLoaded.current = false; // Resetăm starea la fiecare conectare nouă

    const docRef = doc(
      db,
      "artifacts",
      APP_ID,
      "users",
      user.uid,
      "gameData",
      "state",
    );
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (!isDataLoaded.current) {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setPoints(data.points ?? 0);
            setHistory(data.history ?? []);
            setInventory(data.inventory ?? []);
            setShopItems(data.shopItems ?? INITIAL_SHOP_ITEMS);
            setHomework(data.homework ?? []);
          } else {
            // Cont nou - resetăm datele complet pentru a preveni importarea progresului anterior
            setPoints(0);
            setHistory([]);
            setInventory([]);
            setShopItems(INITIAL_SHOP_ITEMS);
            setHomework([]);
          }
          isDataLoaded.current = true;
          setDbLoading(false); // ASCUNDEM ECRANUL DE LOADING DOAR DUPĂ CE AM PUS DATELE
        }
      },
      (error) => {
        console.error("Eroare la citirea datelor:", error);
        setDbLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  // 3. Salvare Automată (Când orice se schimbă în joc, salvează pe internet în fundal)
  useEffect(() => {
    if (!isDataLoaded.current || !user || !db) return;

    const timer = setTimeout(() => {
      const docRef = doc(
        db,
        "artifacts",
        APP_ID,
        "users",
        user.uid,
        "gameData",
        "state",
      );
      setDoc(
        docRef,
        { points, history, inventory, shopItems, homework },
        { merge: true },
      ).catch((err) => console.error("Eroare Firebase la salvare:", err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [points, history, inventory, shopItems, homework, user]);

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

  // Ecran de încărcare inițial
  if (dbLoading) {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-4" size={64} />
        <p className="text-xl font-bold text-slate-600">
          Se încarcă progresul...
        </p>
      </div>
    );
  }

  // Ecran de Autentificare (dacă nu este logat)
  if (!user && auth) {
    return <AuthScreen />;
  }

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
        {view === "homework" && (
          <HomeworkScreen homework={homework} setHomework={setHomework} />
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
            homework={homework}
            setHomework={setHomework}
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
        <button
          onClick={() => setView("game")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-blue-400 to-blue-500 border-4 border-blue-600 rounded-[2.5rem] transition-all shadow-[0_10px_0_0_#1e3a8a] hover:shadow-[0_15px_0_0_#1e3a8a] hover:-translate-y-2 active:translate-y-2 active:shadow-none group"
        >
          <div className="bg-white p-6 rounded-full mb-4 group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-inner text-blue-500">
            <Play size={48} className="ml-2 fill-blue-500" />
          </div>
          <span className="text-2xl font-black text-white drop-shadow-md">
            Joacă
          </span>
        </button>

        <button
          onClick={() => setView("homework")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-orange-400 to-orange-500 border-4 border-orange-600 rounded-[2.5rem] transition-all shadow-[0_10px_0_0_#c2410c] hover:shadow-[0_15px_0_0_#c2410c] hover:-translate-y-2 active:translate-y-2 active:shadow-none group"
        >
          <div className="bg-white p-6 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-inner text-orange-500">
            <BookOpen size={48} className="fill-orange-500 text-orange-500" />
          </div>
          <span className="text-2xl font-black text-white drop-shadow-md text-center">
            Teme
          </span>
        </button>

        <button
          onClick={() => setView("shop")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-purple-400 to-purple-500 border-4 border-purple-600 rounded-[2.5rem] transition-all shadow-[0_10px_0_0_#581c87] hover:shadow-[0_15px_0_0_#581c87] hover:-translate-y-2 active:translate-y-2 active:shadow-none group"
        >
          <div className="bg-white p-6 rounded-full mb-4 group-hover:scale-110 group-hover:-rotate-12 transition-transform shadow-inner text-purple-500">
            <ShoppingCart size={48} className="fill-purple-500" />
          </div>
          <span className="text-2xl font-black text-white drop-shadow-md">
            Magazin
          </span>
        </button>
      </div>
    </div>
  );
}

// ==========================================
// ECRANUL DE TEME (PENTRU COPIL)
// ==========================================
function HomeworkScreen({ homework, setHomework }) {
  const [answers, setAnswers] = useState({});

  const handleAnswerChange = (id, text) => {
    setAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const handleSubmit = (hwItem) => {
    const studentAnswer =
      answers[hwItem.id] !== undefined
        ? answers[hwItem.id]
        : hwItem.childAnswer;
    if (!studentAnswer || studentAnswer.trim() === "") return;

    setHomework((prev) =>
      prev.map((item) =>
        item.id === hwItem.id
          ? { ...item, status: "answered", childAnswer: studentAnswer }
          : item,
      ),
    );
  };

  const activeHomework = homework.filter(
    (h) =>
      h.status === "new" || h.status === "answered" || h.status === "returned",
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 animate-fade-in relative z-10">
      <div className="bg-white/90 backdrop-blur-sm rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white">
        <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-math-pattern opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-white text-xl font-black opacity-90 uppercase tracking-widest mb-4 drop-shadow-sm">
              Teme Speciale
            </h2>
            <div className="text-white font-black drop-shadow-lg text-4xl mb-2">
              Exerciții de la Părinți
            </div>
          </div>
        </div>

        <div className="p-8">
          {activeHomework.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-slate-700">
                Nu ai nicio temă nouă!
              </h3>
              <p className="text-slate-500 mt-2">
                Te poți întoarce la joacă sau în magazin.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeHomework.map((hw) => (
                <div
                  key={hw.id}
                  className="bg-orange-50 border-4 border-orange-200 rounded-[2rem] p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-slate-800">
                      {hw.question}
                    </h3>
                    <span className="flex items-center gap-1 font-bold text-orange-700 bg-orange-200 px-3 py-1 rounded-full text-sm">
                      <Star
                        size={16}
                        className="fill-orange-600 text-orange-600"
                      />{" "}
                      max {hw.reward}
                    </span>
                  </div>

                  {hw.status === "new" || hw.status === "returned" ? (
                    <div className="flex flex-col gap-4">
                      {hw.status === "returned" && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl">
                          <p className="text-sm font-bold text-red-700 mb-1">
                            Mesaj de la părinte (Trebuie refăcut):
                          </p>
                          <p className="text-red-900 font-medium">
                            {hw.parentComment}
                          </p>
                        </div>
                      )}
                      <textarea
                        value={
                          answers[hw.id] !== undefined
                            ? answers[hw.id]
                            : hw.childAnswer || ""
                        }
                        onChange={(e) =>
                          handleAnswerChange(hw.id, e.target.value)
                        }
                        placeholder="Scrie răspunsul sau explicația aici..."
                        className="w-full p-4 border-2 border-orange-300 rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-slate-700 resize-none"
                        rows="2"
                      />
                      <button
                        onClick={() => handleSubmit(hw)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-md active:translate-y-1"
                      >
                        {hw.status === "returned"
                          ? "Trimite din nou"
                          : "Trimite Răspunsul"}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white/60 p-4 rounded-xl border-2 border-orange-100">
                      <p className="text-sm text-slate-500 font-bold mb-1">
                        Răspunsul tău:
                      </p>
                      <p className="text-lg font-black text-slate-800">
                        {hw.childAnswer}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-orange-600 font-bold">
                        <Loader2 className="animate-spin" size={18} />
                        Așteaptă corectarea...
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
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
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);

  const generateProblem = () => {
    const type = Math.floor(Math.random() * 6);
    let text = "";
    let correctAnswer = 0;
    let reward = 10;

    switch (type) {
      case 0:
        // Adunare (numere cu până la 3 cifre)
        const a1 = Math.floor(Math.random() * 900) + 50; // Numere între 50 și 949
        const b1 = Math.floor(Math.random() * 900) + 50;
        text = `${a1} + ${b1}`;
        correctAnswer = a1 + b1;
        reward = 10;
        break;
      case 1:
        // Scădere (rezultat pozitiv, numere cu până la 3 cifre)
        const a2 = Math.floor(Math.random() * 850) + 100; // Numere între 100 și 949
        const b2 = Math.floor(Math.random() * (a2 - 20)) + 20; // Asigurăm că scăzătorul e mai mic
        text = `${a2} - ${b2}`;
        correctAnswer = a2 - b2;
        reward = 10;
        break;
      case 2:
        const a3 = Math.floor(Math.random() * 11);
        const b3 = Math.floor(Math.random() * 11);
        text = `${a3} x ${b3}`;
        correctAnswer = a3 * b3;
        reward = 10;
        break;
      case 3:
        const divisor = Math.floor(Math.random() * 10) + 1;
        const quotient = Math.floor(Math.random() * 11);
        const dividend = divisor * quotient;
        text = `${dividend} : ${divisor}`;
        correctAnswer = quotient;
        reward = 10;
        break;
      case 4:
        const a4 = Math.floor(Math.random() * 10) + 1;
        const b4 = Math.floor(Math.random() * 6);
        const c4 = Math.floor(Math.random() * 6);
        if (Math.random() > 0.5) {
          text = `${a4} + ${b4} x ${c4}`;
          correctAnswer = a4 + b4 * c4;
        } else {
          const multResult = a4 * b4;
          const subtr = Math.floor(Math.random() * multResult);
          text = `${a4} x ${b4} - ${subtr}`;
          correctAnswer = multResult - subtr;
        }
        reward = 15;
        break;
      case 5:
        const subType = Math.floor(Math.random() * 3);
        if (subType === 0) {
          const a5 = Math.floor(Math.random() * 5) + 1;
          const b5 = Math.floor(Math.random() * 5) + 1;
          const c5 = Math.floor(Math.random() * 4) + 2;
          text = `(${a5} + ${b5}) x ${c5}`;
          correctAnswer = (a5 + b5) * c5;
        } else if (subType === 1) {
          const a5 = Math.floor(Math.random() * 10) + 5;
          const b5 = Math.floor(Math.random() * (a5 - 1)) + 1;
          const c5 = Math.floor(Math.random() * 5) + 2;
          text = `${c5} x (${a5} - ${b5})`;
          correctAnswer = c5 * (a5 - b5);
        } else {
          const b5 = Math.floor(Math.random() * 10) + 1;
          const c5 = Math.floor(Math.random() * 10) + 1;
          const a5 = Math.floor(Math.random() * 20) + (b5 + c5);
          text = `${a5} - (${b5} + ${c5})`;
          correctAnswer = a5 - (b5 + c5);
        }
        reward = 20;
        break;
      default:
        break;
    }

    setProblem({ text, answer: correctAnswer, reward });
    setAnswer("");
    setFeedback(null);
    if (inputRef.current) inputRef.current.focus();
  };

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
        `Răspuns corect: ${problem.text} = ${problem.answer}`,
        problem.reward,
        "earn",
      );

      setTimeout(() => {
        generateProblem();
      }, 2500);
    } else {
      setFeedback({ type: "error", message: `Greșit. Încearcă din nou!` });
      addHistory(`Răspuns greșit la: ${problem.text}`, 0, "fail");
      setAnswer("");
      if (inputRef.current) inputRef.current.focus();
    }
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
          <div className="absolute inset-0 bg-math-pattern opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-white text-xl font-black opacity-90 uppercase tracking-widest mb-4 drop-shadow-sm">
              Rezolvă exercițiul
            </h2>
            <div className="text-white font-black drop-shadow-lg tracking-wider transition-all duration-500 text-7xl animate-float">
              {problem.text} = ?
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
  const [activeTab, setActiveTab] = useState("shop");

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
  homework,
  setHomework,
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [activeTab, setActiveTab] = useState("homework_manage");

  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newItemIcon, setNewItemIcon] = useState("🎁");
  const [newItemDesc, setNewItemDesc] = useState("");

  const [bonusPoints, setBonusPoints] = useState("");

  const [newHwQuestion, setNewHwQuestion] = useState("");
  const [newHwReward, setNewHwReward] = useState("");
  const [gradePoints, setGradePoints] = useState({});
  const [parentComments, setParentComments] = useState({});

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === "1392") {
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

  const handleAddHomework = (e) => {
    e.preventDefault();
    if (!newHwQuestion || !newHwReward) return;

    const newHw = {
      id: Date.now(),
      question: newHwQuestion,
      reward: parseInt(newHwReward, 10),
      status: "new",
      childAnswer: "",
    };

    setHomework((prev) => [...prev, newHw]);
    setNewHwQuestion("");
    setNewHwReward("");
  };

  const handleGradeHomework = (id, maxReward) => {
    const awarded =
      gradePoints[id] !== undefined ? parseInt(gradePoints[id], 10) : maxReward;

    setHomework((prev) =>
      prev.map((hw) => (hw.id === id ? { ...hw, status: "graded" } : hw)),
    );
    if (awarded > 0) {
      setPoints((prev) => prev + awarded);
      addHistory(`Temă corectată`, awarded, "earn");
    }
  };

  const handleReturnHomework = (id) => {
    const comment = parentComments[id];
    if (!comment || comment.trim() === "") {
      alert(
        "Te rog să adaugi un comentariu explicativ pentru ca cel mic să știe ce a greșit.",
      );
      return;
    }
    setHomework((prev) =>
      prev.map((hw) =>
        hw.id === id
          ? { ...hw, status: "returned", parentComment: comment }
          : hw,
      ),
    );
    setParentComments((prev) => {
      const newComments = { ...prev };
      delete newComments[id];
      return newComments;
    });
  };

  const handleDeleteHomework = (id) => {
    setHomework((prev) => prev.filter((hw) => hw.id !== id));
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
      <div className="bg-slate-800 p-4 sm:px-8 text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Settings size={24} />
          <h2 className="text-xl font-bold">Panou de Control Părinți</h2>
        </div>
        <button
          onClick={() => {
            signOut(auth);
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-1"
          title="Deconectare din cont"
        >
          Ieșire Cont
        </button>
      </div>

      <div className="flex border-b-2 border-slate-100 flex-wrap">
        <button
          onClick={() => setActiveTab("homework_manage")}
          className={`flex-1 py-4 text-sm sm:text-base font-bold transition-colors ${activeTab === "homework_manage" ? "bg-slate-50 text-slate-800 border-b-4 border-slate-800" : "text-slate-500 hover:bg-slate-50"}`}
        >
          Teme Zilnice
        </button>
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
        {activeTab === "homework_manage" && (
          <div className="space-y-8">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-orange-800">
                <FileText size={20} /> Adaugă o temă / problemă nouă
              </h3>
              <form
                onSubmit={handleAddHomework}
                className="grid grid-cols-1 sm:grid-cols-4 gap-4"
              >
                <div className="sm:col-span-3">
                  <label className="block text-sm font-bold text-orange-700 mb-1">
                    Cerința exercițiului
                  </label>
                  <input
                    required
                    value={newHwQuestion}
                    onChange={(e) => setNewHwQuestion(e.target.value)}
                    type="text"
                    className="w-full p-3 border border-orange-300 rounded-xl"
                    placeholder="ex: Cât fac 5 mere + 2 mere? Scrie și explicația."
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-sm font-bold text-orange-700 mb-1">
                    Puncte Max
                  </label>
                  <input
                    required
                    value={newHwReward}
                    onChange={(e) => setNewHwReward(e.target.value)}
                    type="number"
                    className="w-full p-3 border border-orange-300 rounded-xl"
                    placeholder="ex: 50"
                  />
                </div>
                <div className="sm:col-span-4">
                  <button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
                  >
                    Trimite Tema către Copil
                  </button>
                </div>
              </form>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Teme de Corectat
              </h3>
              <div className="space-y-4">
                {homework.filter((hw) => hw.status === "answered").length ===
                  0 && (
                  <p className="text-slate-500 italic">
                    Nu ai nicio temă de corectat momentan.
                  </p>
                )}
                {homework
                  .filter((hw) => hw.status === "answered")
                  .map((hw) => (
                    <div
                      key={hw.id}
                      className="bg-white border-2 border-blue-200 p-5 rounded-xl shadow-sm"
                    >
                      <p className="text-sm text-slate-500 font-bold mb-1">
                        Cerință:
                      </p>
                      <p className="font-black text-slate-800 mb-4">
                        {hw.question}
                      </p>

                      <div className="bg-slate-50 p-4 rounded-lg mb-4 border border-slate-200">
                        <p className="text-sm text-slate-500 font-bold mb-1">
                          Răspunsul copilului:
                        </p>
                        <p className="font-bold text-blue-700">
                          {hw.childAnswer}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div className="flex items-end gap-3 flex-wrap">
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-bold text-slate-500 mb-1">
                              Comentariu pentru refacere (Obligatoriu la
                              returnare)
                            </label>
                            <input
                              type="text"
                              value={parentComments[hw.id] || ""}
                              onChange={(e) =>
                                setParentComments((prev) => ({
                                  ...prev,
                                  [hw.id]: e.target.value,
                                }))
                              }
                              placeholder="ex: Mai verifică o dată calculul..."
                              className="w-full p-2 border-2 border-slate-200 rounded-lg text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex items-end gap-3 flex-wrap bg-slate-50 p-3 rounded-lg border border-slate-200">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">
                              Acordă Puncte (Max {hw.reward})
                            </label>
                            <input
                              type="number"
                              value={
                                gradePoints[hw.id] !== undefined
                                  ? gradePoints[hw.id]
                                  : hw.reward
                              }
                              onChange={(e) =>
                                setGradePoints((prev) => ({
                                  ...prev,
                                  [hw.id]: e.target.value,
                                }))
                              }
                              className="w-24 p-2 border-2 border-blue-300 rounded-lg text-center font-bold"
                            />
                          </div>
                          <button
                            onClick={() =>
                              handleGradeHomework(hw.id, hw.reward)
                            }
                            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 size={18} /> Gata, Acordă!
                          </button>

                          <button
                            onClick={() => handleReturnHomework(hw.id)}
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                          >
                            <X size={18} /> Întoarce pentru refacere
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-slate-800">
                Teme în Așteptare (Ne-rezolvate sau întoarse la copil)
              </h3>
              <div className="space-y-2">
                {homework.filter(
                  (hw) => hw.status === "new" || hw.status === "returned",
                ).length === 0 && (
                  <p className="text-slate-500 italic">
                    Nicio temă în așteptare.
                  </p>
                )}
                {homework
                  .filter(
                    (hw) => hw.status === "new" || hw.status === "returned",
                  )
                  .map((hw) => (
                    <div
                      key={hw.id}
                      className="flex justify-between items-center bg-slate-50 border border-slate-200 p-3 rounded-lg"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700">
                          {hw.question}{" "}
                          <span className="text-orange-500 text-sm">
                            (Max {hw.reward}⭐)
                          </span>
                        </span>
                        {hw.status === "returned" && (
                          <span className="text-xs text-red-500 font-bold mt-1">
                            Status: Întoarsă pentru refacere
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteHomework(hw.id)}
                        className="text-red-500 hover:bg-red-100 p-2 rounded-lg transition-colors"
                        title="Șterge tema"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

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
