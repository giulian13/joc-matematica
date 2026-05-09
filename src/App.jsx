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
  Map as MapIcon,
  Unlock,
  BarChart3,
  PieChart as PieChartIcon,
  Clock,
  Delete,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import confetti from "canvas-confetti";

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
  sendPasswordResetEmail,
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
  {
    id: 6,
    name: "Schimbare Nume Teo",
    cost: 870,
    icon: "🏷️",
    description: "Ai dreptul să îi pui animalului tău virtual un nume nou, ales de tine!",
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
          ? "Adresa de email sau parola este incorectă."
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
            Intră ca Vizitator (Fără cont)
          </button>
          <p className="text-xs text-slate-400 font-bold mt-3">
            Vizitatorii salvează progresul doar pe acest dispozitiv.
          </p>
        </div>
      </div>
    </div>
  );
}

const LEVEL_REQ_POINTS = [150, 250, 400, 600];

const getBackgroundClass = (level) => {
  switch (level) {
    case 1: return "from-emerald-400 via-green-300 to-yellow-200";
    case 2: return "from-emerald-900 via-green-700 to-lime-800";
    case 3: return "from-slate-900 via-purple-900 to-fuchsia-900";
    case 4: return "from-sky-400 via-blue-300 to-indigo-200";
    case 5: return "from-indigo-950 via-purple-900 to-pink-900";
    default: return "from-indigo-900 via-purple-800 to-orange-900";
  }
};

// ==========================================
// ECRANUL PRIETENULUI TEO (TAMAGOTCHI)
// ==========================================
function PetScreen({ petState, setPetState, points, setPoints, addHistory, setView }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (petState.sleepUntil && now >= petState.sleepUntil) {
       setPetState((prev) => ({ ...prev, sleepUntil: null, energy: 100 }));
    }
  }, [now, petState.sleepUntil, setPetState]);

  const isSleeping = petState.sleepUntil && now < petState.sleepUntil;
  const minsRemaining = isSleeping ? Math.floor((petState.sleepUntil - now) / 60000) : 0;
  const secsRemaining = isSleeping ? Math.floor(((petState.sleepUntil - now) % 60000) / 1000) : 0;
  const timeDisplay = `${minsRemaining}:${secsRemaining.toString().padStart(2, '0')}`;

  const handleAction = (actionType) => {
    if (petState.isDead && actionType !== "revive") {
       return alert("Teo ne-a părăsit... Trebuie să îl reînvii mai întâi!");
    }
    if (isSleeping) {
      return alert("Shh! Teo doarme. Revino după ce se trezește!");
    }
    let cost = 0;
    let newFood = petState.food;
    let newJoy = petState.joy;
    let newEnergy = petState.energy;
    let message = "";

    if (actionType === "fish") {
      cost = 20;
      if (points < cost) return alert("Nu ai suficiente comori!");
      newFood = Math.min(100, newFood + 30);
      message = `L-ai hrănit pe ${petState.name} cu un pește delicios!`;
    } else if (actionType === "dessert") {
      cost = 10;
      if (points < cost) return alert("Nu ai suficiente comori!");
      newFood = Math.min(100, newFood + 15);
      newJoy = Math.min(100, newJoy + 5);
      message = `${petState.name} a primit un desert dulce!`;
    } else if (actionType === "play") {
      cost = 30;
      if (points < cost) return alert("Nu ai suficiente comori!");
      if (newEnergy < 20) return alert("Teo e prea obosit pentru a se juca acum!");
      newJoy = Math.min(100, newJoy + 40);
      newEnergy = Math.max(0, newEnergy - 20);
      message = `Te-ai jucat cu ${petState.name}! Este foarte fericit.`;
      
      const playImg = Math.random() > 0.5 ? 'play1' : 'play2';
      const playUntil = Date.now() + 5 * 60 * 1000;
      
      setPetState({
        ...petState,
        food: newFood,
        joy: newJoy,
        energy: newEnergy,
        lastInteraction: Date.now(),
        playUntil,
        playImage: playImg
      });
      addHistory(message, -cost, "spend");
      setPoints((prev) => prev - cost);
      return;
    } else if (actionType === "sleep") {
      cost = 0;
      setPetState({
        ...petState,
        sleepUntil: Date.now() + 15 * 60 * 1000,
        lastInteraction: Date.now()
      });
      addHistory(`${petState.name} s-a dus la culcare pentru 15 minute.`, 0, "info");
      return;
    } else if (actionType === "revive") {
      cost = 300;
      if (points < cost) return alert("Nu ai suficiente comori pentru a-l reînvia!");
      setPetState({
        food: 100, joy: 100, energy: 100, isDead: false, lastInteraction: Date.now(), sleepUntil: null
      });
      setPoints((prev) => prev - cost);
      addHistory(`O minune! ${petState.name} a revenit la viață, fericit și plin de energie!`, -cost, "spend");
      return;
    }

    if (cost > 0) {
      setPoints((prev) => prev - cost);
      addHistory(message, -cost, "spend");
    } else {
      addHistory(message, 0, "info");
    }

    setPetState({
      food: newFood,
      joy: newJoy,
      energy: newEnergy,
      lastInteraction: Date.now(),
      sleepUntil: petState.sleepUntil
    });
  };

  const getPetImage = () => {
    if (petState.isDead) return "/virtual_pet_sad.png";
    if (isSleeping) return "/virtual_pet_sleepy.png";
    if (petState.playUntil && now < petState.playUntil) {
      return petState.playImage === 'play1' ? "/virtual_pet_play1.png" : "/virtual_pet_play2.png";
    }
    if (petState.joy > 90) return "/virtual_pet_happy.png";
    if (petState.joy < 30) return "/virtual_pet_sad.png";
    
    // Starea implicită aleatorie: schimbă între cele două poze la fiecare 2 minute
    const seed = Math.floor(now / (1000 * 60 * 2));
    return seed % 2 === 0 ? "/virtual_pet_walk.png" : "/teo_virtual_pet.png";
  };

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden mt-6 relative z-10 max-w-xl mx-auto animate-fade-in p-8 text-center">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => setView("menu")} className="text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 p-3 rounded-full transition-colors">
          <MapIcon size={24} />
        </button>
        <h2 className="text-3xl font-black text-slate-800">Prietenul {petState.name}</h2>
        <div className="font-bold text-yellow-600 bg-yellow-100 border-2 border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-2">
          {points} <Star size={20} className="fill-yellow-500 text-yellow-500" />
        </div>
      </div>

      <div className="flex justify-center mb-8 relative">
        <div className="relative">
          <img 
            src={getPetImage()} 
            alt={`${petState.name} Virtual Pet`} 
            className={`w-64 h-64 object-contain transition-all duration-1000 ${petState.isDead ? 'opacity-40 grayscale contrast-125 sepia blur-[1px]' : isSleeping ? 'opacity-90' : (petState.joy > 70 ? 'animate-float' : 'animate-wiggle')}`} 
          />
          {isSleeping && !petState.isDead && (
            <div className="absolute top-0 right-0 animate-bounce text-4xl">💤</div>
          )}
          {petState.isDead && (
            <div className="absolute -top-4 right-0 text-6xl drop-shadow-md animate-pulse">👻</div>
          )}
        </div>
      </div>

      {petState.isDead ? (
        <div className="bg-red-50 text-red-900 p-6 rounded-[2rem] mb-8 font-bold border-4 border-red-200 shadow-inner">
          <h3 className="text-2xl mb-3 text-red-600 font-black">Oh nu... {petState.name} ne-a părăsit! 😭</h3>
          <p className="text-red-800/80 mb-6 font-medium leading-relaxed">
            A stat prea mult timp fără mâncare. Ai pierdut toate comorile. Ai nevoie de <strong className="text-red-700 bg-red-200 px-2 py-1 rounded">300⭐</strong> din Pădurea Magică pentru a-l aduce înapoi!
          </p>
          <button onClick={() => handleAction('revive')} className="w-full bg-gradient-to-b from-red-500 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white shadow-[0_8px_0_0_#9f1239] active:shadow-none active:translate-y-2 p-5 rounded-2xl text-xl font-black flex items-center justify-center gap-3 transition-all border-2 border-red-400">
            ✨ Reînvie-l pe Teo (300⭐)
          </button>
        </div>
      ) : (
        <>
          {isSleeping && (
            <div className="bg-indigo-100 text-indigo-800 p-4 rounded-2xl mb-8 font-bold border-2 border-indigo-300 animate-pulse">
              Teo doarme... Se trezește în {timeDisplay}
            </div>
          )}

          <div className="space-y-4 mb-8 text-left">
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <span className="font-bold flex items-center gap-2">🍗 Hrană</span>
                <span className="font-bold text-slate-600">{petState.food}%</span>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-1000 ${petState.food < 30 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${petState.food}%` }}></div>
              </div>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <span className="font-bold flex items-center gap-2">🎾 Bucurie</span>
                <span className="font-bold text-slate-600">{petState.joy}%</span>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-1000 ${petState.joy < 30 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${petState.joy}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <span className="font-bold flex items-center gap-2">💤 Energie</span>
                <span className="font-bold text-slate-600">{petState.energy}%</span>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-1000 ${petState.energy < 30 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${petState.energy}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleAction('fish')} className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold p-4 rounded-2xl border-2 border-orange-300 flex flex-col items-center justify-center transition-colors">
              <span className="text-3xl mb-1">🐟</span> Hrănește (20⭐)
            </button>
            <button onClick={() => handleAction('dessert')} className="bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold p-4 rounded-2xl border-2 border-pink-300 flex flex-col items-center justify-center transition-colors">
              <span className="text-3xl mb-1">🧁</span> Desert (10⭐)
            </button>
            <button onClick={() => handleAction('play')} className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold p-4 rounded-2xl border-2 border-blue-300 flex flex-col items-center justify-center transition-colors">
              <span className="text-3xl mb-1">🎾</span> Joacă-te (30⭐)
            </button>
            <button onClick={() => handleAction('sleep')} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold p-4 rounded-2xl border-2 border-indigo-300 flex flex-col items-center justify-center transition-colors">
              <span className="text-3xl mb-1">💤</span> Somn (0⭐)
            </button>
          </div>
        </>
      )}
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
  const [maxLevel, setMaxLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);
  const [currentPlayingLevel, setCurrentPlayingLevel] = useState(1);
  const [petState, setPetState] = useState({ name: "Teo", food: 100, joy: 100, energy: 100, lastInteraction: Date.now(), playUntil: null, playImage: null });
  const [parentPin, setParentPin] = useState(null);
  const [resetPinRequested, setResetPinRequested] = useState(false);
  const [analytics, setAnalytics] = useState({
    dailyTime: {},
    errorsByType: { adunare: 0, scadere: 0, inmultire: 0, impartire: 0 }
  });

  // Stări pentru Firebase
  const [user, setUser] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const isDataLoaded = useRef(false);

  useEffect(() => {
    if (!auth) {
      setDbLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setDbLoading(false);
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

  useEffect(() => {
    if (!user || !db) {
      isDataLoaded.current = false;
      return;
    }

    isDataLoaded.current = false;

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
            setMaxLevel(data.maxLevel ?? 1);
            setLevelProgress(data.levelProgress ?? 0);
            setParentPin(data.parentPin ?? null);
            setResetPinRequested(data.resetPinRequested ?? false);
            setAnalytics(data.analytics ?? {
              dailyTime: {},
              errorsByType: { adunare: 0, scadere: 0, inmultire: 0, impartire: 0 }
            });

            if (data.resetPinRequested) {
              setParentPin(null);
              setResetPinRequested(false);
              // Actualizarea în Firebase se va face prin useEffect-ul de salvare
            }
            
            let loadedPet = data.petState ?? { name: "Teo", food: 100, joy: 100, energy: 100, lastInteraction: Date.now(), playUntil: null, playImage: null };
            const now = Date.now();
            
            if (loadedPet.sleepUntil && now >= loadedPet.sleepUntil) {
              loadedPet.sleepUntil = null;
              loadedPet.energy = 100;
            }

            const hoursPassed = (now - loadedPet.lastInteraction) / (1000 * 60 * 60);
            if (hoursPassed > 0.1) {
              const degrade = Math.floor(hoursPassed * 10);
              loadedPet = {
                ...loadedPet,
                food: Math.max(0, loadedPet.food - degrade),
                joy: Math.max(0, loadedPet.joy - degrade),
                energy: loadedPet.sleepUntil ? loadedPet.energy : Math.min(100, loadedPet.energy + Math.floor(hoursPassed * 20)),
                lastInteraction: now
              };
            }
            setPetState(loadedPet);
          } else {
            setPoints(0);
            setHistory([]);
            setInventory([]);
            setShopItems(INITIAL_SHOP_ITEMS);
            setHomework([]);
            setMaxLevel(1);
            setLevelProgress(0);
            setPetState({ name: "Teo", food: 100, joy: 100, energy: 100, lastInteraction: Date.now(), playUntil: null, playImage: null });
            setParentPin(null);
          }
          isDataLoaded.current = true;
          setDbLoading(false);
        }
      },
      (error) => {
        console.error("Eroare la citirea datelor:", error);
        setDbLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

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
        { points, history, inventory, shopItems, homework, maxLevel, levelProgress, petState, parentPin, resetPinRequested, analytics },
        { merge: true },
      ).catch((err) => console.error("Eroare Firebase la salvare:", err));
    }, 1000);

    return () => clearTimeout(timer);
  }, [points, history, inventory, shopItems, homework, maxLevel, levelProgress, petState, user, parentPin, resetPinRequested, analytics]);

  // Tracking Timp Zilnic
  useEffect(() => {
    if (!user || !isDataLoaded.current) return;

    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      setAnalytics(prev => ({
        ...prev,
        dailyTime: {
          ...prev.dailyTime,
          [today]: (prev.dailyTime[today] || 0) + 1
        }
      }));
    }, 60000); // Actualizăm la fiecare minut

    return () => clearInterval(interval);
  }, [user]);

  const logError = (type) => {
    setAnalytics(prev => ({
      ...prev,
      errorsByType: {
        ...prev.errorsByType,
        [type]: (prev.errorsByType[type] || 0) + 1
      }
    }));
  };

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

  if (dbLoading) {
    return (
      <div className="min-h-screen bg-indigo-900 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-amber-400 mb-4" size={64} />
        <p className="text-xl font-bold text-amber-100">Se încarcă magia...</p>
      </div>
    );
  }

  if (!user && auth) {
    return <AuthScreen />;
  }

  const currentBg = getBackgroundClass(view === "game" ? currentPlayingLevel : maxLevel);

  return (
    <div className={`min-h-screen bg-gradient-to-b ${currentBg} transition-colors duration-[2000ms] font-sans text-slate-800 selection:bg-amber-300 relative overflow-x-hidden`}>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
        @keyframes float-delay { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-25px) rotate(-15deg); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); } 50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8); } }
        @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 7s ease-in-out infinite; animation-delay: 2s; }
        .animate-pulse-glow { animation: pulse-glow 3s infinite; }
        .animate-wiggle { animation: wiggle 2s ease-in-out infinite; }
        .animate-pop { animation: pop 0.3s ease-in-out; }
        .bg-magic-pattern { background-image: radial-gradient(circle at 15px 15px, rgba(255,255,255,0.1) 2px, transparent 0); background-size: 30px 30px; }
      `}</style>

      {/* Fundal animat de poveste cu elemente de pisici */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20">
        <div className="absolute top-10 left-10 text-6xl drop-shadow-lg animate-float">
          🐾
        </div>
        <div className="absolute top-40 right-20 text-7xl drop-shadow-lg animate-float-delay">
          🐟
        </div>
        <div className="absolute bottom-32 left-[15%] text-8xl drop-shadow-lg animate-float">
          🧶
        </div>
        <div className="absolute top-1/3 left-1/4 text-5xl text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] animate-float-delay">
          ✨
        </div>
        <div className="absolute bottom-40 right-[20%] text-6xl drop-shadow-lg animate-float">
          🐱
        </div>
        <div className="absolute top-[60%] right-[10%] text-7xl drop-shadow-lg animate-float-delay">
          🐾
        </div>
      </div>

      <header className="bg-indigo-950/80 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-4 sticky top-0 z-20 border-b-4 border-amber-500/50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView("menu")}
          >
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-2.5 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-2xl drop-shadow-md">🐱</span>
            </div>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 tracking-tight hidden sm:block drop-shadow-sm">
              Aventura Pisicilor
            </h1>
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400 tracking-tight sm:hidden drop-shadow-sm">
              Aventura
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (parentPin) setView("pin_entry");
                else setView("parent");
              }}
              className="p-2.5 bg-indigo-800/80 hover:bg-indigo-700 rounded-full transition-colors flex items-center justify-center border-2 border-indigo-500 shadow-inner"
              title="Zona Părinților"
            >
              <Lock size={20} className="text-indigo-200" />
            </button>
            <div className="flex items-center gap-2 bg-gradient-to-r from-amber-900/60 to-orange-900/60 border-2 border-amber-500/50 px-4 py-2 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.3)] backdrop-blur-sm">
              <Star
                className="text-amber-400 fill-amber-400 animate-pulse"
                size={24}
              />
              <span className="text-xl font-black text-amber-100">
                {points}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {view === "menu" && <MainMenu setView={setView} />}
        {view === "map" && (
          <MapScreen
            setView={setView}
            maxLevel={maxLevel}
            setCurrentPlayingLevel={setCurrentPlayingLevel}
          />
        )}
        {view === "game" && (
          <GameScreen
            setPoints={setPoints}
            addHistory={addHistory}
            currentPlayingLevel={currentPlayingLevel}
            maxLevel={maxLevel}
            setMaxLevel={setMaxLevel}
            levelProgress={levelProgress}
            setLevelProgress={setLevelProgress}
            setView={setView}
            logError={logError}
          />
        )}
        {view === "pet" && (
          <PetScreen
            petState={petState}
            setPetState={setPetState}
            points={points}
            setPoints={setPoints}
            addHistory={addHistory}
            setView={setView}
          />
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
            analytics={analytics}
            setView={setView}
          />
        )}
        {view === "pin_entry" && (
          <PinEntryScreen
            correctPin={parentPin}
            onCorrect={() => setView("parent")}
            onCancel={() => setView("menu")}
            userEmail={user?.email}
            onForgotPin={async () => {
              if (window.confirm("Vrei să resetezi PIN-ul? Vei primi un email de resetare a parolei și vei fi deconectat pentru siguranță.")) {
                try {
                  await sendPasswordResetEmail(auth, user.email);
                  setResetPinRequested(true);
                  // Așteptăm puțin pentru a ne asigura că flag-ul e trimis spre Firebase înainte de logout
                  setTimeout(() => signOut(auth), 1000);
                } catch (err) {
                  alert("Eroare: " + err.message);
                }
              }
            }}
          />
        )}
      </main>

      {user && parentPin === null && !dbLoading && (
        <PinSetupScreen setParentPin={setParentPin} />
      )}
    </div>
  );
}

// ==========================================
// MENIUL PRINCIPAL
// ==========================================
function MainMenu({ setView }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in mt-6 relative z-10">
      <div className="relative">
        <div className="absolute inset-0 bg-amber-400 blur-3xl opacity-30 rounded-full animate-pulse-glow"></div>
        <div className="text-9xl animate-float drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] relative z-10">
          😼
        </div>
      </div>

      <div className="text-center space-y-4 max-w-2xl">
        <h2 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-wiggle pb-2">
          Pădurea Magică!
        </h2>
        <p className="text-xl text-indigo-100 font-bold text-center bg-indigo-950/60 p-6 rounded-[2rem] backdrop-blur-md border-2 border-indigo-500/50 shadow-2xl leading-relaxed">
          Rezolvă misterele matematice pentru a ajuta pisicuțele să adune
          steluțe și să descopere comorile din magazin! 🧶✨
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl mt-12">
        <button
          onClick={() => setView("map")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-emerald-500 to-teal-700 border-4 border-emerald-300 rounded-[2.5rem] transition-all shadow-[0_12px_0_0_#042f2e] hover:shadow-[0_18px_0_0_#042f2e] hover:-translate-y-2 active:translate-y-3 active:shadow-none group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl group-hover:rotate-45 transition-transform duration-500">
            🍃
          </div>
          <div className="bg-amber-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] text-emerald-600 border-4 border-emerald-400 relative z-10">
            <Play size={48} className="ml-2 fill-emerald-600" />
          </div>
          <span className="text-3xl font-black text-emerald-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] relative z-10">
            Explorează
          </span>
        </button>

        <button
          onClick={() => setView("homework")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-amber-500 to-orange-700 border-4 border-amber-300 rounded-[2.5rem] transition-all shadow-[0_12px_0_0_#7c2d12] hover:shadow-[0_18px_0_0_#7c2d12] hover:-translate-y-2 active:translate-y-3 active:shadow-none group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl group-hover:rotate-45 transition-transform duration-500">
            📜
          </div>
          <div className="bg-amber-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] text-orange-600 border-4 border-orange-400 relative z-10">
            <BookOpen size={48} className="fill-orange-600 text-orange-600" />
          </div>
          <span className="text-3xl font-black text-amber-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] relative z-10 text-center">
            Misiuni
          </span>
        </button>

        <button
          onClick={() => setView("shop")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-fuchsia-600 to-purple-800 border-4 border-fuchsia-300 rounded-[2.5rem] transition-all shadow-[0_12px_0_0_#4a044e] hover:shadow-[0_18px_0_0_#4a044e] hover:-translate-y-2 active:translate-y-3 active:shadow-none group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl group-hover:-rotate-12 transition-transform duration-500">
            💎
          </div>
          <div className="bg-amber-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] text-purple-600 border-4 border-purple-400 relative z-10">
            <ShoppingCart size={48} className="fill-purple-600" />
          </div>
          <span className="text-3xl font-black text-fuchsia-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] relative z-10">
            Comori
          </span>
        </button>

        <button
          onClick={() => setView("pet")}
          className="flex flex-col items-center p-8 bg-gradient-to-b from-rose-400 to-pink-600 border-4 border-pink-300 rounded-[2.5rem] transition-all shadow-[0_12px_0_0_#be123c] hover:shadow-[0_18px_0_0_#be123c] hover:-translate-y-2 active:translate-y-3 active:shadow-none group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl group-hover:rotate-12 transition-transform duration-500">
            🐾
          </div>
          <div className="bg-amber-100 p-6 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-[inset_0_4px_10px_rgba(0,0,0,0.2)] text-pink-600 border-4 border-pink-400 relative z-10">
            <span className="text-5xl">🐾</span>
          </div>
          <span className="text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] relative z-10">
            Prietenul Teo
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
// HARTA AVENTURII
// ==========================================
const LEVELS = [
  { id: 1, name: "Poiana Însorită", icon: "🌻", description: "Începutul aventurii" },
  { id: 2, name: "Pădurea de Basm", icon: "🌲", description: "Printre copaci fermecați" },
  { id: 3, name: "Peștera Cristalelor", icon: "💎", description: "Scântei în întuneric" },
  { id: 4, name: "Castelul Norilor", icon: "🏰", description: "Acolo sus pe cer" },
  { id: 5, name: "Tărâmul Magic", icon: "✨", description: "Cea mai mare provocare" },
];

function MapScreen({ setView, maxLevel, setCurrentPlayingLevel }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in mt-6 relative z-10 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] pb-2">
          Harta Aventurii
        </h2>
        <p className="text-xl text-indigo-100 font-bold bg-indigo-950/60 p-4 rounded-3xl backdrop-blur-md mt-4 border-2 border-indigo-500/50 shadow-2xl">
          Alege un nivel pentru a continua povestea!
        </p>
      </div>

      <div className="w-full space-y-6 relative before:absolute before:inset-0 before:ml-[50%] before:-translate-x-1/2 before:w-2 before:bg-indigo-900/50 before:rounded-full before:-z-10 pb-10">
        {LEVELS.map((level, index) => {
          const isUnlocked = level.id <= maxLevel;
          return (
            <div key={level.id} className={`flex items-center gap-4 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="w-1/2 flex justify-end">
                {index % 2 === 0 && (
                  <div className={`p-4 rounded-2xl text-right ${isUnlocked ? 'bg-white/90 shadow-xl' : 'bg-slate-800/80 text-slate-400'} border-4 ${isUnlocked ? 'border-amber-400' : 'border-slate-700'}`}>
                    <h3 className="font-black text-lg">{level.name}</h3>
                    <p className="text-sm font-medium hidden sm:block">{level.description}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  if (isUnlocked) {
                    setCurrentPlayingLevel(level.id);
                    setView("game");
                  }
                }}
                className={`relative shrink-0 w-20 h-20 rounded-full border-4 flex items-center justify-center text-3xl shadow-xl transition-transform ${isUnlocked ? 'bg-gradient-to-br from-amber-300 to-orange-500 border-white hover:scale-110 active:scale-95 z-10 cursor-pointer' : 'bg-slate-700 border-slate-500 opacity-80 cursor-not-allowed'}`}
              >
                {isUnlocked ? level.icon : <Lock size={28} className="text-slate-400" />}
              </button>

              <div className="w-1/2 flex justify-start">
                {index % 2 !== 0 && (
                  <div className={`p-4 rounded-2xl text-left ${isUnlocked ? 'bg-white/90 shadow-xl' : 'bg-slate-800/80 text-slate-400'} border-4 ${isUnlocked ? 'border-amber-400' : 'border-slate-700'}`}>
                    <h3 className="font-black text-lg">{level.name}</h3>
                    <p className="text-sm font-medium hidden sm:block">{level.description}</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button onClick={() => setView("menu")} className="mt-8 px-6 py-3 bg-indigo-800 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors border-2 border-indigo-400">
        Înapoi la Meniu
      </button>
    </div>
  );
}

// ==========================================
// ECRANUL DE JOC (LOGICA MATEMATICĂ)
// ==========================================
function GameScreen({ setPoints, addHistory, currentPlayingLevel, maxLevel, setMaxLevel, levelProgress, setLevelProgress, setView, logError }) {
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const inputRef = useRef(null);

  const generateProblem = () => {
    const type = Math.floor(Math.random() * 6);
    let text = "";
    let correctAnswer = 0;
    let reward = 10;
    let opType = "adunare";

    switch (type) {
      case 0:
        opType = "adunare";
        const a1 = Math.floor(Math.random() * 900) + 50;
        const b1 = Math.floor(Math.random() * 900) + 50;
        text = `${a1} + ${b1}`;
        correctAnswer = a1 + b1;
        reward = 10;
        break;
      case 1:
        opType = "scadere";
        const a2 = Math.floor(Math.random() * 850) + 100;
        const b2 = Math.floor(Math.random() * (a2 - 20)) + 20;
        text = `${a2} - ${b2}`;
        correctAnswer = a2 - b2;
        reward = 10;
        break;
      case 2:
        opType = "inmultire";
        const a3 = Math.floor(Math.random() * 11);
        const b3 = Math.floor(Math.random() * 11);
        text = `${a3} x ${b3}`;
        correctAnswer = a3 * b3;
        reward = 10;
        break;
      case 3:
        opType = "impartire";
        const divisor = Math.floor(Math.random() * 10) + 1;
        const quotient = Math.floor(Math.random() * 11);
        const dividend = divisor * quotient;
        text = `${dividend} : ${divisor}`;
        correctAnswer = quotient;
        reward = 10;
        break;
      case 4:
        opType = "inmultire"; // dominant in expressions here
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
        opType = "impartire";
        const subType = Math.floor(Math.random() * 3);
        const div1 = Math.floor(Math.random() * 10) + 1;
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

    setProblem({ text, answer: correctAnswer, reward, opType });
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

    // Ascundem tastatura pe mobil
    if (inputRef.current) inputRef.current.blur();

    const numAnswer = parseInt(answer, 10);

    if (numAnswer === problem.answer) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setPoints((prev) => prev + problem.reward);
      addHistory(
        `Provocare completată: ${problem.text} = ${problem.answer}`,
        problem.reward,
        "earn",
      );

      const newProgress = levelProgress + problem.reward;
      const targetPoints = LEVEL_REQ_POINTS[currentPlayingLevel - 1] || Infinity;

      if (newProgress >= targetPoints && currentPlayingLevel === maxLevel && maxLevel < 5) {
        setMaxLevel(maxLevel + 1);
        setFeedback({
          type: "success",
          message: `Ai primit ${problem.reward} comori. Ai deblocat nivelul următor! 🎉`,
        });
        setTimeout(() => {
          confetti({ particleCount: 300, spread: 100, origin: { y: 0.3 } });
        }, 500);
        setLevelProgress(0); // progresul se resetează la zero pentru următorul nivel
      } else {
        setLevelProgress(newProgress);
        if (currentPlayingLevel === maxLevel && maxLevel < 5) {
          const pointsLeft = targetPoints - newProgress;
          setFeedback({
            type: "success",
            message: `Corect! Ai primit ${problem.reward} comori. (Încă ${pointsLeft} comori necesare)`,
          });
        } else {
          setFeedback({
            type: "success",
            message: `Corect! Ai primit ${problem.reward} comori.`,
          });
        }
      }

      setTimeout(() => {
        generateProblem();
      }, 2500);
    } else {
      setFeedback({ type: "error", message: `Greșit. Mai încearcă!` });
      logError(problem.opType);
      addHistory(`Ai ratat provocarea: ${problem.text}`, 0, "fail");
      setAnswer("");
      if (inputRef.current) inputRef.current.focus();
    }
  };

  if (!problem)
    return (
      <div className="text-center mt-20 relative z-10">
        <Loader2 className="animate-spin mx-auto text-amber-400" size={64} />
      </div>
    );

  return (
    <div className="max-w-xl mx-auto mt-6 animate-fade-in relative z-10">
      <div className="bg-amber-50 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border-8 border-amber-700/80 transform transition-transform duration-300 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="bg-gradient-to-b from-amber-800 to-amber-950 p-8 text-center relative overflow-hidden border-b-8 border-amber-900/50">
          <div className="absolute inset-0 bg-magic-pattern opacity-20"></div>

          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
              <button onClick={() => setView("map")} className="text-amber-200 hover:text-white bg-amber-900/50 p-2 rounded-full border border-amber-500/30 transition-colors">
                <MapIcon size={24} />
              </button>
              <div className="inline-block bg-amber-900/50 px-6 py-2 rounded-full border border-amber-500/30">
                <h2 className="text-amber-200 text-sm font-black uppercase tracking-[0.3em] drop-shadow-sm flex items-center gap-2">
                  <span>🐾</span> Nivel {currentPlayingLevel} <span>🐾</span>
                </h2>
              </div>
              <div className="w-10"></div>
            </div>

            <div className="text-amber-50 font-black drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] tracking-wider transition-all duration-500 text-7xl">
              {problem.text} = ?
            </div>

            <div className="mt-8 inline-flex items-center gap-3 bg-amber-100/10 backdrop-blur-md px-6 py-3 rounded-full text-amber-100 text-lg font-black border-2 border-amber-500/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <Star
                size={24}
                className="fill-amber-400 text-amber-400 animate-pulse"
              />
              Recompensă: {problem.reward} comori
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-8 pt-10 relative z-10 bg-amber-50"
        >
          <input
            ref={inputRef}
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full text-center text-6xl font-black p-8 bg-amber-100/50 border-4 border-amber-600/30 rounded-[2.5rem] focus:border-amber-600 focus:bg-white focus:outline-none transition-all shadow-[inset_0_4px_15px_rgba(0,0,0,0.1)] text-amber-950 placeholder:text-amber-300/50 font-serif"
            placeholder="..."
            autoFocus
          />

          <button
            type="submit"
            className="w-full mt-8 bg-gradient-to-b from-emerald-500 to-teal-700 hover:from-emerald-400 hover:to-teal-600 text-amber-50 text-3xl font-black py-6 rounded-[2rem] border-4 border-emerald-800 shadow-[0_10px_0_0_#064e3b] active:translate-y-3 active:shadow-none transition-all flex justify-center items-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-colors"></div>
            Miau! Verifică{" "}
            <Check
              size={40}
              className="group-hover:scale-125 transition-transform drop-shadow-md"
            />
          </button>
        </form>

        {feedback && (
          <div className="px-8 pb-8 bg-amber-50">
            <div
              className={`p-6 rounded-[2rem] font-black text-center text-xl shadow-inner border-4 ${feedback.type === "success" ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-900 animate-pop border-emerald-400" : "bg-gradient-to-r from-rose-100 to-rose-200 text-rose-900 animate-wiggle border-rose-400"}`}
            >
              {feedback.type === "success" ? "🐟 Prrfect! " : "🙀 Miau... "}
              {feedback.message}
            </div>
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
      setInventory((prev) => {
        const existingIndex = prev.findIndex((i) => i.id === item.id);
        if (existingIndex !== -1) {
          const newInv = [...prev];
          newInv[existingIndex] = {
            ...newInv[existingIndex],
            quantity: (newInv[existingIndex].quantity || 1) + 1,
          };
          return newInv;
        }
        return [...prev, { ...item, quantity: 1, purchaseDate: new Date() }];
      });
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
                className="bg-white border-4 border-purple-100 rounded-[2rem] p-5 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 hover:border-purple-300 hover:shadow-xl hover:-translate-y-2 transition-all transform group"
              >
                <div className="text-6xl bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform shadow-inner shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 w-full">
                  <h3 className="font-black text-xl text-slate-800">
                    {item.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium line-clamp-2">
                    {item.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-between gap-3 w-full">
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
                      {item.quantity > 1 && (
                        <span className="ml-2 text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-lg text-xs">
                          x{item.quantity}
                        </span>
                      )}
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
  analytics,
  setView,
}) {
  const [activeTab, setActiveTab] = useState("stats");
  const [newItemName, setNewItemName] = useState("");
  const [newItemCost, setNewItemCost] = useState("");
  const [newItemIcon, setNewItemIcon] = useState("🎁");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [bonusPoints, setBonusPoints] = useState("");
  const [newHwQuestion, setNewHwQuestion] = useState("");
  const [newHwReward, setNewHwReward] = useState("");
  const [gradePoints, setGradePoints] = useState({});
  const [parentComments, setParentComments] = useState({});

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
    const itemToUse = inventory[indexToRemove];

    if (itemToUse.id === 6) {
      const newName = prompt(
        "Introdu noul nume pentru prietenul tău virtual:",
        petState.name,
      );
      if (newName && newName.trim() !== "") {
        setPetState((prev) => ({ ...prev, name: newName.trim() }));
      } else {
        return; // Anulăm folosirea dacă nu a introdus nume
      }
    }

    setInventory((prev) => {
      const newInv = [...prev];
      const item = newInv[indexToRemove];
      if (item.quantity > 1) {
        newInv[indexToRemove] = { ...item, quantity: item.quantity - 1 };
        return newInv;
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
    addHistory(`Premiu folosit/revendicat: ${itemName}`, 0, "info");
  };

  const handleAddBonus = (e) => {
    e.preventDefault();
    if (!bonusPoints) return;
    const amount = parseInt(bonusPoints, 10);
    setPoints((prev) => prev + amount);
    addHistory(`Bonus acordat de părinte`, amount, amount >= 0 ? "earn" : "spend");
    setBonusPoints("");
    alert(`Punctele au fost actualizate.`);
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
    const awarded = gradePoints[id] !== undefined ? parseInt(gradePoints[id], 10) : maxReward;
    setHomework((prev) => prev.map((hw) => (hw.id === id ? { ...hw, status: "graded" } : hw)));
    if (awarded > 0) {
      setPoints((prev) => prev + awarded);
      addHistory(`Temă corectată`, awarded, "earn");
    }
  };

  const handleReturnHomework = (id) => {
    const comment = parentComments[id];
    if (!comment) return alert("Adaugă un comentariu pentru refacere!");
    setHomework((prev) => prev.map((hw) => hw.id === id ? { ...hw, status: "returned", parentComment: comment } : hw));
    setParentComments((prev) => {
      const nc = { ...prev };
      delete nc[id];
      return nc;
    });
  };

  const handleDeleteHomework = (id) => {
    setHomework((prev) => prev.filter((hw) => hw.id !== id));
  };

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const timeData = last7Days.map(date => ({
    name: date.split('-').slice(1).join('/'),
    minute: analytics.dailyTime[date] || 0
  }));

  const errorData = Object.entries(analytics.errorsByType)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ 
      name: name.charAt(0).toUpperCase() + name.slice(1), 
      value 
    }));

  const COLORS = ["#6366f1", "#f59e0b", "#ec4899", "#10b981"];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white animate-fade-in relative z-10">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-center relative">
        <div className="relative z-10 flex justify-between items-center text-white">
          <div className="text-left">
            <h2 className="text-white/80 text-xs font-black uppercase tracking-widest mb-1">Control Părinte</h2>
            <div className="text-white font-black text-3xl">Dashboard</div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView("menu")}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl border border-white/30 transition-colors flex items-center gap-2 text-sm font-bold"
              title="Ieși la Joc"
            >
              <ArrowLeft size={20} /> <span className="hidden sm:inline">Ieșire</span>
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="bg-rose-500/80 hover:bg-rose-500 p-3 rounded-2xl border border-white/30 transition-colors flex items-center gap-2 text-sm font-bold"
              title="Deconectare Cont"
            >
              <LogOut size={20} /> <span className="hidden sm:inline">Delogare</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto bg-slate-50 border-b-2 border-slate-200 no-scrollbar">
        {[
          { id: "stats", label: "Statistici", icon: BarChart3 },
          { id: "homework_manage", label: "Teme", icon: BookOpen },
          { id: "shop_manage", label: "Magazin", icon: ShoppingCart },
          { id: "inventory_manage", label: "Inventar", icon: Award },
          { id: "points_manage", label: "Puncte", icon: Star },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 font-black whitespace-nowrap transition-all ${
              activeTab === tab.id ? "bg-white text-indigo-600 shadow-[0_-4px_0_0_#4f46e5_inset]" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8 min-h-[500px]">
        {activeTab === "stats" && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-indigo-50 border-2 border-indigo-100 rounded-[2rem] p-6">
                <h3 className="text-lg font-black text-indigo-900 mb-4 flex items-center gap-2 text-left">
                  <Clock size={20} /> Timp petrecut (min)
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeData}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4f46e5', fontWeight: 'bold', fontSize: 10}} />
                      <YAxis hide />
                      <RechartsTooltip />
                      <Bar dataKey="minute" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-rose-50 border-2 border-rose-100 rounded-[2rem] p-6 text-left">
                <h3 className="text-lg font-black text-rose-900 mb-4 flex items-center gap-2">
                  <AlertCircle size={20} /> Greșeli frecvente
                </h3>
                {errorData.length > 0 ? (
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={errorData} innerRadius={50} outerRadius={70} dataKey="value">
                          {errorData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center text-rose-300">
                    <Star size={48} className="mb-2 opacity-50" />
                    <p className="font-bold">Nicio greșeală încă!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "homework_manage" && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-4 border-indigo-100">
              <h3 className="font-black text-xl mb-4 flex items-center gap-2 text-indigo-900 text-left">
                <FileText size={24} className="text-indigo-600" /> Adaugă o temă nouă
              </h3>
              <form onSubmit={handleAddHomework} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 text-left">
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest ml-2 mb-1">Cerință</label>
                  <input type="text" required value={newHwQuestion} onChange={(e) => setNewHwQuestion(e.target.value)} className="w-full p-4 border-2 border-indigo-200 rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="Ex: Rezolvă pag. 42..." />
                </div>
                <div className="text-left">
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest ml-2 mb-1">Steluțe</label>
                  <input type="number" required value={newHwReward} onChange={(e) => setNewHwReward(e.target.value)} className="w-full p-4 border-2 border-indigo-200 rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="Ex: 50" />
                </div>
                <div className="text-left">
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest ml-2 mb-1">&nbsp;</label>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#312e81] active:translate-y-1 active:shadow-none transition-all">Trimite</button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <h3 className="font-black text-xl text-slate-800 text-left">Teme Active și de Corectat</h3>
              {homework.filter(h => h.status !== 'graded').length === 0 ? (
                <p className="text-slate-400 font-bold py-12 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">Nu există teme în curs.</p>
              ) : (
                homework.filter(h => h.status !== 'graded').map((hw) => (
                  <div key={hw.id} className="bg-white border-4 border-slate-50 p-6 rounded-[2.5rem] shadow-sm hover:border-indigo-100 transition-colors text-left">
                    <div className="flex flex-col sm:flex-row justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                             hw.status === 'new' ? 'bg-blue-100 text-blue-600' :
                             hw.status === 'answered' ? 'bg-amber-100 text-amber-600' :
                             'bg-rose-100 text-rose-600'
                           }`}>
                             {hw.status === 'new' ? 'Trimisă' : hw.status === 'answered' ? 'De Corectat' : 'Returnată'}
                           </span>
                           <span className="text-amber-600 font-black text-sm">{hw.reward} ⭐</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-800">{hw.question}</h4>
                        
                        {hw.status === "answered" && (
                          <div className="mt-4 p-5 bg-indigo-50/50 rounded-2xl border-2 border-indigo-100">
                             <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-2">Răspuns Copil:</p>
                             <p className="font-black text-indigo-900 italic">"{hw.childAnswer}"</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="sm:w-64 space-y-3">
                        {hw.status === "answered" && (
                          <>
                            <div className="text-left">
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Scor Final</label>
                              <input type="number" placeholder="Ex: 50" className="w-full p-2.5 border-2 border-slate-200 rounded-xl font-bold text-sm" onChange={(e) => setGradePoints({...gradePoints, [hw.id]: e.target.value})} />
                            </div>
                            <button onClick={() => handleGradeHomework(hw.id, hw.reward)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow-[0_4px_0_0_#065f46] text-xs">Corect & Acordă</button>
                            <div className="text-left">
                              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">Sfat Refacere</label>
                              <input type="text" placeholder="Mai încearcă..." className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-xs" onChange={(e) => setParentComments({...parentComments, [hw.id]: e.target.value})} />
                            </div>
                            <button onClick={() => handleReturnHomework(hw.id)} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-2.5 rounded-xl shadow-[0_4px_0_0_#9f1239] text-xs">Returnează</button>
                          </>
                        )}
                        <button onClick={() => handleDeleteHomework(hw.id)} className="w-full text-slate-300 hover:text-rose-500 font-bold text-[10px] uppercase tracking-widest pt-2">Elimină Tema</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "shop_manage" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-purple-50 border-4 border-purple-100 p-6 rounded-[2.5rem]">
              <h3 className="font-black text-xl mb-4 text-purple-900 text-left">Premiu Nou în Magazin</h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-left">
                    <label className="block text-xs font-black text-purple-400 uppercase tracking-widest ml-2 mb-1">Nume Premiu</label>
                    <input type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full p-4 border-2 border-purple-200 rounded-2xl font-bold focus:border-purple-500 outline-none" placeholder="Ex: 30 min jocuri..." />
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-black text-purple-400 uppercase tracking-widest ml-2 mb-1">Cost Steluțe</label>
                    <input type="number" required value={newItemCost} onChange={(e) => setNewItemCost(e.target.value)} className="w-full p-4 border-2 border-purple-200 rounded-2xl font-bold focus:border-purple-500 outline-none" placeholder="Ex: 100" />
                  </div>
                </div>
                <div className="text-left">
                  <label className="block text-xs font-black text-purple-400 uppercase tracking-widest ml-2 mb-2">Alege o Iconiță</label>
                  <div className="flex flex-wrap gap-2 p-4 bg-white border-2 border-purple-100 rounded-3xl">
                    {["🎁", "🍦", "🎮", "🧸", "🍫", "🍕", "🎞️", "⚽", "🎨", "🚲", "🍭", "📚", "🦸", "⭐", "🏆", "🏖️"].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewItemIcon(emoji)}
                        className={`text-2xl p-2 rounded-xl transition-all ${newItemIcon === emoji ? 'bg-purple-100 scale-125 shadow-inner' : 'hover:bg-slate-50 opacity-50 hover:opacity-100'}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="text-left mt-4">
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#581c87] active:translate-y-1 active:shadow-none transition-all">Adaugă Premiul</button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shopItems.map(item => (
                <div key={item.id} className="bg-white border-4 border-slate-50 p-4 rounded-3xl flex items-center justify-between shadow-sm hover:border-purple-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl bg-slate-50 p-2 rounded-2xl">{item.icon}</span>
                    <div className="text-left">
                      <p className="font-black text-slate-800 leading-tight">{item.name}</p>
                      <p className="text-amber-600 font-bold flex items-center gap-1 text-sm"><Star size={14} className="fill-amber-500" /> {item.cost} steluțe</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteItem(item.id)} className="text-rose-400 hover:bg-rose-50 p-3 rounded-xl transition-colors">
                    <Trash2 size={22} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "inventory_manage" && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="bg-emerald-50 border-4 border-emerald-100 p-8 rounded-[3rem]">
              <h3 className="text-2xl font-black text-emerald-900 mb-2">Recompensele Copilului</h3>
              <p className="text-emerald-700 font-medium mb-8 italic">Aici poți vedea ce a cumpărat copilul. După ce îi oferi premiul în realitate, apasă butonul de mai jos.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inventory.length === 0 ? (
                  <p className="col-span-full py-12 text-center text-slate-400 font-bold bg-white/50 rounded-3xl border-4 border-dashed border-emerald-100">Nicio recompensă de revendicat momentan.</p>
                ) : (
                  inventory.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[2.5rem] border-4 border-emerald-50 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{item.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 leading-tight">{item.name}</span>
                          {item.quantity > 1 && (
                            <span className="text-xs font-bold text-indigo-500">Cantitate: {item.quantity}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleUseInventoryItem(idx, item.name)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-black shadow-[0_4px_0_0_#065f46] text-sm">Folosit</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "points_manage" && (
          <div className="max-w-md mx-auto space-y-8 animate-fade-in">
            <div className="bg-amber-50 border-4 border-amber-100 p-10 rounded-[4rem] shadow-sm text-center">
              <h3 className="text-2xl font-black text-amber-900 mb-8 text-center">Gestionează Punctele</h3>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-inner border-2 border-amber-100 mb-8 text-center">
                <Star size={48} className="text-amber-500 fill-amber-500 mx-auto mb-3 animate-pulse" />
                <p className="text-5xl font-black text-slate-800 text-center">{points}</p>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1 text-center">Steluțe curente</p>
              </div>
              <form onSubmit={handleAddBonus} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-black text-amber-600 uppercase tracking-widest ml-4 mb-1">Adaugă sau Scade</label>
                  <input type="number" required value={bonusPoints} onChange={(e) => setBonusPoints(e.target.value)} className="w-full p-5 border-4 border-amber-100 rounded-[2rem] text-center text-3xl font-black focus:border-amber-400 outline-none shadow-sm" placeholder="+ / - 50" />
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[2rem] shadow-[0_8px_0_0_#92400e] active:translate-y-1 active:shadow-none transition-all text-xl">Actualizează Portofelul</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ECRANE SECURITATE PIN
// ==========================================

function PinSetupScreen({ setParentPin }) {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (pin.length !== 4) {
      setError("PIN-ul trebuie să aibă 4 cifre!");
      return;
    }
    if (pin !== confirmPin) {
      setError("PIN-urile nu coincid!");
      return;
    }
    setParentPin(pin);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full text-center shadow-2xl border-8 border-amber-400 animate-fade-in relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12 pointer-events-none">😼</div>
        <div className="text-6xl mb-4 drop-shadow-md">🔐</div>
        <h2 className="text-3xl font-black text-indigo-900 mb-2">Setează PIN Părinte</h2>
        <p className="text-slate-500 mb-6 font-bold leading-tight">Acest cod va fi necesar pentru a intra în Zona Părinților.</p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-4 font-black border-2 border-red-200 animate-wiggle">{error}</div>}
        
        <div className="space-y-4">
          <input 
            type="password" 
            maxLength={4} 
            inputMode="numeric"
            placeholder="PIN nou (4 cifre)" 
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-3xl p-4 border-4 border-indigo-50 rounded-2xl focus:border-amber-400 outline-none font-black tracking-[0.5em] shadow-inner transition-colors"
          />
          <input 
            type="password" 
            maxLength={4} 
            inputMode="numeric"
            placeholder="Confirmă PIN" 
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-3xl p-4 border-4 border-indigo-50 rounded-2xl focus:border-amber-400 outline-none font-black tracking-[0.5em] shadow-inner transition-colors"
          />
          <button 
            onClick={handleSave}
            className="w-full bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_0_0_#92400e] active:translate-y-1 active:shadow-none transition-all text-xl mt-4 border-t-2 border-amber-200"
          >
            Salvează PIN-ul
          </button>
        </div>
      </div>
    </div>
  );
}

function PinEntryScreen({ correctPin, onCorrect, onCancel, onForgotPin, userEmail }) {
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);

  const handleKey = (num) => {
    if (input.length < 4) {
      const newInput = input + num;
      setInput(newInput);
      if (newInput.length === 4) {
        if (newInput === correctPin) {
          onCorrect();
        } else {
          setIsError(true);
          setTimeout(() => {
            setInput("");
            setIsError(false);
          }, 600);
        }
      }
    }
  };

  const handleBackspace = () => {
    setInput(input.slice(0, -1));
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl border-4 border-white overflow-hidden mt-6 relative z-10 max-w-md mx-auto animate-fade-in p-8 text-center border-b-[12px] border-indigo-100">
      <div className="text-5xl mb-3">🐱</div>
      <h2 className="text-3xl font-black text-indigo-950 mb-2">Acces Securizat</h2>
      <p className="text-slate-500 mb-8 font-bold">Introdu codul PIN pentru părinți</p>
      
      <div className={`flex justify-center gap-5 mb-10 ${isError ? 'animate-wiggle' : ''}`}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-8 h-8 rounded-full border-4 transition-all duration-300 ${input.length > i ? 'bg-indigo-600 border-indigo-400 scale-110 shadow-lg shadow-indigo-200' : 'border-slate-100 bg-slate-50 shadow-inner'}`}></div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num} 
            onClick={() => handleKey(num)}
            className="h-20 bg-slate-50 hover:bg-white text-3xl font-black text-indigo-900 rounded-[1.5rem] shadow-[0_6px_0_0_#e2e8f0] hover:shadow-[0_8px_0_0_#e2e8f0] active:translate-y-1 active:shadow-none transition-all border-2 border-slate-100 active:bg-indigo-50"
          >
            {num}
          </button>
        ))}
        <div className="h-20"></div>
        <button 
          onClick={() => handleKey(0)}
          className="h-20 bg-slate-50 hover:bg-white text-3xl font-black text-indigo-900 rounded-[1.5rem] shadow-[0_6px_0_0_#e2e8f0] hover:shadow-[0_8px_0_0_#e2e8f0] active:translate-y-1 active:shadow-none transition-all border-2 border-slate-100 active:bg-indigo-50"
        >
          0
        </button>
        <button 
          onClick={handleBackspace}
          className="h-20 bg-indigo-50 hover:bg-indigo-100 text-2xl font-black text-indigo-600 rounded-[1.5rem] shadow-[0_6px_0_0_#c7d2fe] hover:shadow-[0_8px_0_0_#c7d2fe] active:translate-y-1 active:shadow-none transition-all border-2 border-indigo-100 flex items-center justify-center"
        >
          <Delete size={32} />
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <button onClick={onCancel} className="text-slate-400 font-bold hover:text-indigo-600 transition-colors uppercase tracking-widest text-sm">
          Înapoi la aventură
        </button>
        
        {userEmail && (
          <button onClick={onForgotPin} className="text-xs text-slate-300 hover:text-red-400 transition-colors font-medium">
            Am uitat PIN-ul (Resetează via Email)
          </button>
        )}
      </div>
    </div>
  );
}

