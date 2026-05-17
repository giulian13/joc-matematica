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
  Gem,
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
import { getFirestore, doc, setDoc, onSnapshot, collection, getDocs, query, updateDoc, collectionGroup, where } from "firebase/firestore";

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

// Funcție pentru hashing PIN (Securitate)
const hashPin = async (pin, salt) => {
  if (!pin || !salt) return pin;
  const msgUint8 = new TextEncoder().encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const TRANSLATIONS = {
  ro: {
    app_title: "Aventura Pisicilor",
    app_title_short: "Aventura",
    menu_welcome: "Pădurea Magică!",
    menu_subtitle: "Rezolvă misterele matematice pentru a ajuta pisicuțele să adune steluțe și să descopere comorile din magazin! 🧶✨",
    btn_explore: "Explorează",
    btn_missions: "Misiuni",
    btn_treasures: "Comori",
    btn_pet: "Prietenul",
    shop_title: "Magazinul cu Comori",
    shop_subtitle: "Rezolvă exerciții și cumpără premii din magazin!",
    pet_title: "Prietenul",
    pet_revive: "Reînviază-l pe",
    parent_dashboard: "Dashboard Părinți",
    parent_stats: "Statistici",
    parent_homework: "Teme",
    parent_shop: "Magazin",
    parent_inventory: "Inventar",
    parent_points: "Puncte",
    game_correct: "🐟 Prrfect!",
    game_wrong: "🙀 Miau...",
    game_reward: "Recompensă",
    game_verify: "Miau! Verifică",
    auth_login: "Intră în Joc",
    auth_register: "Creează Cont Nou",
    auth_google: "Conectare cu Google",
    auth_guest: "Joacă ca Musafir",
    auth_forgot: "Ai uitat parola?",
    logout: "Delogare",
    exit: "Ieșire"
  },
  en: {
    app_title: "Cat Adventure",
    app_title_short: "Adventure",
    menu_welcome: "Magic Forest!",
    menu_subtitle: "Solve math mysteries to help kittens collect stars and discover shop treasures! 🧶✨",
    btn_explore: "Explore",
    btn_missions: "Missions",
    btn_treasures: "Shop",
    btn_pet: "Friend",
    shop_title: "Treasure Shop",
    shop_subtitle: "Solve exercises and buy prizes from the shop!",
    pet_title: "Friend",
    pet_revive: "Revive",
    parent_dashboard: "Parent Dashboard",
    parent_stats: "Stats",
    parent_homework: "Homework",
    parent_shop: "Shop",
    parent_inventory: "Inventory",
    parent_points: "Points",
    game_correct: "🐟 Purrfect!",
    game_wrong: "🙀 Meow...",
    game_reward: "Reward",
    game_verify: "Meow! Check",
    auth_login: "Join the Game",
    auth_register: "Create New Account",
    auth_google: "Sign in with Google",
    auth_guest: "Play as Guest",
    auth_forgot: "Forgot password?",
    logout: "Log Out",
    exit: "Exit"
  }
};

// ==========================================
// 🛠️ ZONA DE CONFIGURARE MAGAZIN
// ==========================================
const INITIAL_SHOP_ITEMS = [
  {
    id: 1,
    name: { ro: "Sticker Virtual Stea", en: "Virtual Star Sticker" },
    cost: 20,
    icon: "⭐",
    description: { ro: "O stea strălucitoare pentru colecția ta de stickers virtuale!", en: "A shining star for your virtual sticker collection!" },
  },
  {
    id: 2,
    name: { ro: "5 minute de pauză", en: "5 minute break" },
    cost: 50,
    icon: "⏳",
    description: { ro: "Poți folosi acest cupon pentru 5 minute de joacă în plus.", en: "Use this coupon for 5 extra minutes of play." },
  },
  {
    id: 3,
    name: { ro: "Diplomă de Campion", en: "Champion Diploma" },
    cost: 100,
    icon: "📜",
    description: { ro: "O diplomă specială pentru abilitățile tale matematice.", en: "A special diploma for your math skills." },
  },
  {
    id: 4,
    name: { ro: "Avatar Super-Erou", en: "Superhero Avatar" },
    cost: 150,
    icon: "🦸‍♂️",
    description: { ro: "Deblochează un nou personaj pentru profilul tău.", en: "Unlock a new character for your profile." },
  },
  {
    id: 5,
    name: { ro: "Fără teme suplimentarela mate (1 zi)", en: "No extra math homework (1 day)" },
    cost: 500,
    icon: "🎉",
    description: { ro: "Biletul magic! (Aprobare necesară de la părinți/profesor)", en: "The magic ticket! (Parent/teacher approval needed)" },
  },
  {
    id: 6,
    name: { ro: "Schimbare Nume Pet", en: "Change Pet Name" },
    cost: 500,
    icon: "🏷️",
    description: { ro: "Ai dreptul să îi pui animalului tău virtual un nume nou, ales de tine!", en: "Get the right to give your virtual pet a new name!" },
  },
];

function AuthScreen({ t, lang }) {
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
          ? (lang === "ro" ? "Adresa de email sau parola este incorectă." : "Email or password incorrect.")
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
        setError(lang === "ro" ? "Conectarea cu Google a fost anulată." : "Google login cancelled.");
      } else {
        setError(lang === "ro" ? "Eroare la conectarea cu Google: " + err.message : "Error connecting with Google: " + err.message);
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
      setError(lang === "ro" ? "Eroare la conectare." : "Login error.");
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-800 bg-cover bg-fixed relative"
      style={{ backgroundImage: "url('/background.png')", backgroundPosition: "center 20%" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/60 to-indigo-900/60 pointer-events-none"></div>
      <div className="bg-white p-8 rounded-[3rem] shadow-2xl w-full max-w-md relative z-10 animate-fade-in border-4 border-white">
        <div className="text-6xl text-center mb-4 animate-bounce">😺</div>
        <h2 className="text-3xl font-black text-center text-blue-800 mb-6 drop-shadow-sm">
          {lang === "ro" ? "Aventura Matematică" : "Math Adventure"}
        </h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-xl mb-4 text-sm font-bold text-center border-2 border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-600 mb-1">
              {lang === "ro" ? "Email părinte" : "Parent email"}
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
              {lang === "ro" ? "Parolă" : "Password"}
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
              t("auth_login")
            ) : (
              t("auth_register")
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
              ? (lang === "ro" ? "Nu ai cont? Creează unul gratuit." : "No account? Create one for free.")
              : (lang === "ro" ? "Ai deja cont? Loghează-te." : "Already have an account? Log in.")}
          </button>
        </div>

        <div className="relative flex items-center py-5">
          <div className="flex-grow border-t-2 border-slate-100"></div>
          <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-black">
            {lang === "ro" ? "SAU" : "OR"}
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
              {lang === "ro" ? "Conectare cu Google" : "Login with Google"}
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
            {lang === "ro" ? "Intră ca Vizitator (Fără cont)" : "Enter as Visitor (No account)"}
          </button>
          <p className="text-xs text-slate-400 font-bold mt-3">
            {lang === "ro" ? "Vizitatorii salvează progresul doar pe acest dispozitiv." : "Visitors save progress only on this device."}
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
function PetScreen({ petState, setPetState, points, setPoints, addHistory, setView, t, lang }) {
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
       return alert(lang === "ro" ? `${petState.name} ne-a părăsit... Trebuie să îl reînvii mai întâi!` : `${petState.name} has left us... You must revive him first!`);
    }
    if (isSleeping) {
      return alert(lang === "ro" ? `Shh! ${petState.name} doarme. Revino după ce se trezește!` : `Shh! ${petState.name} is sleeping. Come back after he wakes up!`);
    }
    let cost = 0;
    let newFood = petState.food;
    let newJoy = petState.joy;
    let newEnergy = petState.energy;
    let message = "";

    if (actionType === "fish") {
      cost = 20;
      if (points < cost) return alert(lang === "ro" ? "Nu ai suficiente steluțe!" : "Not enough stars!");
      newFood = Math.min(100, newFood + 30);
      message = lang === "ro" ? `L-ai hrănit pe ${petState.name} cu un pește delicios!` : `You fed ${petState.name} a delicious fish!`;
    } else if (actionType === "dessert") {
      cost = 10;
      if (points < cost) return alert(lang === "ro" ? "Nu ai suficiente steluțe!" : "Not enough stars!");
      newFood = Math.min(100, newFood + 15);
      newJoy = Math.min(100, newJoy + 5);
      message = lang === "ro" ? `${petState.name} a primit un desert dulce!` : `${petState.name} got a sweet dessert!`;
    } else if (actionType === "play") {
      cost = 30;
      if (points < cost) return alert(lang === "ro" ? "Nu ai suficiente steluțe!" : "Not enough stars!");
      if (newEnergy < 20) return alert(lang === "ro" ? `${petState.name} e prea obosit pentru a se juca acum!` : `${petState.name} is too tired to play now!`);
      newJoy = Math.min(100, newJoy + 40);
      newEnergy = Math.max(0, newEnergy - 20);
      message = lang === "ro" ? `Te-ai jucat cu ${petState.name}! Este foarte fericit.` : `You played with ${petState.name}! He is very happy.`;
      
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
      addHistory(lang === "ro" ? `${petState.name} s-a dus la culcare pentru 15 minute.` : `${petState.name} went to sleep for 15 minutes.`, 0, "info");
      return;
    } else if (actionType === "revive") {
      cost = 300;
      if (points < cost) return alert(lang === "ro" ? "Nu ai suficiente steluțe pentru a-l reînvia!" : "Not enough stars to revive him!");
      setPetState({
        food: 100, joy: 100, energy: 100, isDead: false, lastInteraction: Date.now(), sleepUntil: null
      });
      setPoints((prev) => prev - cost);
      addHistory(lang === "ro" ? `O minune! ${petState.name} a revenit la viață, fericit și plin de energie!` : `A miracle! ${petState.name} is back to life, happy and full of energy!`, -cost, "spend");
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
        <h2 className="text-3xl font-black text-slate-800">{t("pet_title")} {petState.name}</h2>
        <div className="font-bold text-yellow-600 bg-yellow-100 border-2 border-yellow-200 px-4 py-2 rounded-xl flex items-center gap-2">
          {points} <Star size={20} className="fill-yellow-500 text-yellow-500" />
        </div>
      </div>

      <div className="flex justify-center mb-8 relative">
        <div className="relative">
          <img 
            src={getPetImage()} 
            alt={`${petState.name} Virtual Pet`} 
            className={`w-80 h-80 sm:w-96 sm:h-96 object-contain transition-all duration-1000 ${petState.isDead ? 'opacity-40 grayscale contrast-125 sepia blur-[1px]' : isSleeping ? 'opacity-90' : (petState.joy > 70 ? 'animate-float' : 'animate-wiggle')}`} 
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
          <h3 className="text-2xl mb-3 text-red-600 font-black">{lang === "ro" ? `Oh nu... ${petState.name} ne-a părăsit! 😭` : `Oh no... ${petState.name} has left us! 😭`}</h3>
          <p className="text-red-800/80 mb-6 font-medium leading-relaxed">
            {lang === "ro" 
              ? `A stat prea mult timp fără mâncare. Ai pierdut toate steluțele. Ai nevoie de ` 
              : `${petState.name} stayed too long without food. You lost all stars. You need `}
            <strong className="text-red-700 bg-red-200 px-2 py-1 rounded">300⭐</strong> 
            {lang === "ro" ? " din Pădurea Magică pentru a-l aduce înapoi!" : " from the Magic Forest to bring him back!"}
          </p>
          <button onClick={() => handleAction('revive')} className="w-full bg-gradient-to-b from-red-500 to-rose-700 hover:from-red-600 hover:to-rose-800 text-white shadow-[0_8px_0_0_#9f1239] active:shadow-none active:translate-y-2 p-5 rounded-2xl text-xl font-black flex items-center justify-center gap-3 transition-all border-2 border-red-400">
            ✨ {lang === "ro" ? `Reînvie-l pe ${petState.name}` : `Revive ${petState.name}`} (300⭐)
          </button>
        </div>
      ) : (
        <>
          {isSleeping && (
            <div className="bg-indigo-100 text-indigo-800 p-4 rounded-2xl mb-8 font-bold border-2 border-indigo-300 animate-pulse">
              {lang === "ro" ? `${petState.name} doarme... Se trezește în` : `${petState.name} is sleeping... Wakes up in`} {timeDisplay}
            </div>
          )}

          <div className="space-y-4 mb-8 text-left">
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <span className="font-bold flex items-center gap-2">🍗 {lang === "ro" ? "Hrană" : "Food"}</span>
                <span className="font-bold text-slate-600">{petState.food}%</span>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-1000 ${petState.food < 30 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${petState.food}%` }}></div>
              </div>
            </div>
            
            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <span className="font-bold flex items-center gap-2">🎾 {lang === "ro" ? "Bucurie" : "Joy"}</span>
                <span className="font-bold text-slate-600">{petState.joy}%</span>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-1000 ${petState.joy < 30 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${petState.joy}%` }}></div>
              </div>
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
              <div className="flex justify-between mb-1">
                <span className="font-bold flex items-center gap-2">💤 {lang === "ro" ? "Energie" : "Energy"}</span>
                <span className="font-bold text-slate-600">{petState.energy}%</span>
              </div>
              <div className="w-full bg-slate-300 rounded-full h-4">
                <div className={`h-4 rounded-full transition-all duration-1000 ${petState.energy < 30 ? 'bg-red-500' : 'bg-yellow-500'}`} style={{ width: `${petState.energy}%` }}></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleAction('fish')} className="bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold p-4 rounded-2xl border-2 border-orange-300 flex flex-col items-center justify-center transition-colors">
              <span className="text-3xl mb-1">🐟</span> {lang === "ro" ? "Hrănește" : "Feed"} (20⭐)
            </button>
            <button onClick={() => handleAction('dessert')} className="bg-pink-100 hover:bg-pink-200 text-pink-800 font-bold p-4 rounded-2xl border-2 border-pink-300 flex flex-col items-center justify-center transition-colors">
              <span className="text-3xl mb-1">🧁</span> {lang === "ro" ? "Desert" : "Dessert"} (10⭐)
            </button>
            <button onClick={() => handleAction('play')} className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold p-4 rounded-2xl border-2 border-blue-300 flex flex-col items-center justify-center transition-colors">
              <span className="text-3xl mb-1">🎾</span> {lang === "ro" ? "Joacă-te" : "Play"} (30⭐)
            </button>
            <button onClick={() => handleAction('sleep')} className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-bold p-4 rounded-2xl border-2 border-indigo-300 flex flex-col items-center justify-center transition-colors">
              <span className="text-3xl mb-1">💤</span> {lang === "ro" ? "Somn" : "Sleep"} (0⭐)
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
  const [petState, setPetState] = useState({ name: "Pet", food: 100, joy: 100, energy: 100, lastInteraction: Date.now(), playUntil: null, playImage: null });
  const [parentPin, setParentPin] = useState(null);
  const [resetPinRequested, setResetPinRequested] = useState(false);
  const [analytics, setAnalytics] = useState({
    dailyTime: {},
    errorsByType: { adunare: 0, scadere: 0, inmultire: 0, impartire: 0 }
  });
  const [lang, setLang] = useState("ro");

  const t = (key) => TRANSLATIONS[lang][key] || key;

  // Stări pentru Firebase
  const [user, setUser] = useState(null);
  const [dbLoading, setDbLoading] = useState(true);
  const isDataLoaded = useRef(false);
  const [isParentAuthorized, setIsParentAuthorized] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Preîncărcare imagini pentru caching browser
  useEffect(() => {
    const imagesToPreload = [
      "/virtual_pet_walk.png",
      "/teo_virtual_pet.png",
      "/virtual_pet_happy.png",
      "/virtual_pet_sad.png",
      "/virtual_pet_sleepy.png",
      "/virtual_pet_play1.png",
      "/virtual_pet_play2.png"
    ];
    
    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    if (!auth) {
      setDbLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        console.log("Conectat ca:", u.email);
        const adminEmail = "gurau.iulian92@gmail.com";
        setIsSuperAdmin(u.email && u.email.toLowerCase() === adminEmail.toLowerCase());
      } else {
        setIsSuperAdmin(false);
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
            const firebaseShop = data.shopItems ?? INITIAL_SHOP_ITEMS;
            // Ne asigurăm că itemele noi din cod apar și la utilizatorii vechi
            const finalShop = [...firebaseShop];
            INITIAL_SHOP_ITEMS.forEach(item => {
              if (!finalShop.some(i => i.id === item.id)) {
                finalShop.push(item);
              }
            });
            setShopItems(finalShop);
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
            
            let loadedPet = data.petState ?? { name: "Pet", food: 100, joy: 100, energy: 100, lastInteraction: Date.now(), playUntil: null, playImage: null };
            // Dacă pet-ul există dar nu are nume (migrare utilizatori vechi), îi punem numele default
            if (!loadedPet.name) loadedPet.name = "Pet";
            
            const now = Date.now();
            
            if (loadedPet.sleepUntil && now >= loadedPet.sleepUntil) {
              loadedPet.sleepUntil = null;
              loadedPet.energy = 100;
            }

            const hoursPassed = (now - loadedPet.lastInteraction) / (1000 * 60 * 60);
            if (hoursPassed > 0.05 && !loadedPet.isDead) {
              const foodDegrade = Math.floor(hoursPassed * 8); // 8% pe oră
              const joyDegrade = Math.floor(hoursPassed * 10); // 10% pe oră
              
              // Calculăm câte din orele trecute au fost "ore de zi" (07:00 - 00:00)
              // pentru a nu scădea energia noaptea conform cerinței utilizatorului
              let dayHours = 0;
              if (!loadedPet.sleepUntil) {
                for (let i = 0; i < hoursPassed; i += 0.5) { // Verificăm la fiecare 30 min
                  const checkTime = new Date(loadedPet.lastInteraction + i * 3600000);
                  const h = checkTime.getHours();
                  if (h >= 7) dayHours += 0.5;
                }
              }
              
              const energyHours = loadedPet.sleepUntil ? hoursPassed : Math.min(hoursPassed, dayHours);
              let energyChange = -Math.floor(energyHours * 12); 
              if (loadedPet.sleepUntil) {
                energyChange = Math.floor(hoursPassed * 400); // Se încarcă în ~15 min
              }
              
              const newFood = Math.max(0, (loadedPet.food ?? 100) - foodDegrade);
              const newJoy = Math.max(0, (loadedPet.joy ?? 100) - joyDegrade);
              const newEnergy = Math.max(0, Math.min(100, (loadedPet.energy ?? 100) + energyChange));
              
              // Moarte: dacă ambele (hrană și bucurie) ajung la 0
              const shouldDie = newFood <= 0 && newJoy <= 0;
              
              loadedPet = {
                ...loadedPet,
                food: newFood,
                joy: newJoy,
                energy: newEnergy,
                lastInteraction: now,
                isDead: shouldDie
              };

              if (shouldDie) {
                setPoints(0);
                addHistory(
                  lang === "ro" 
                    ? `Din păcate, ${loadedPet.name} ne-a părăsit din cauza lipsei de îngrijire...` 
                    : `Unfortunately, ${loadedPet.name} has left us due to lack of care...`,
                  0, "fail"
                );
              }
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
            setPetState({ name: "Pet", food: 100, joy: 100, energy: 100, isDead: false, lastInteraction: Date.now(), playUntil: null, playImage: null });
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
      // Salvăm starea detaliată a jocului
      setDoc(
        docRef,
        { points, history, inventory, shopItems, homework, maxLevel, levelProgress, petState, parentPin, resetPinRequested, analytics },
        { merge: true },
      ).catch((err) => console.error("Eroare Firebase la salvare (state):", err));

      // Salvăm un index al utilizatorului pentru Admin Dashboard
      const userIndexRef = doc(db, "artifacts", APP_ID, "users", user.uid);
      setDoc(
        userIndexRef,
        { 
          email: user.email, 
          points: points, 
          name: petState?.name || "Copil", 
          lastActive: new Date().toISOString(),
          id: user.uid
        },
        { merge: true }
      ).catch((err) => console.error("Eroare Firebase la salvare (index):", err));
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

  // Auto-logout din Dashboard (5 min inactivitate)
  useEffect(() => {
    if (view !== "parent") return;

    const checkInactivity = setInterval(() => {
      const inactiveTime = Date.now() - lastActivity;
      if (inactiveTime > 5 * 60 * 1000) { // 5 minute
        setIsParentAuthorized(false);
        setView("menu");
        alert(lang === "ro" ? "Sesiunea de administrator a expirat din motive de securitate." : "Admin session expired for security reasons.");
      }
    }, 10000);

    return () => clearInterval(checkInactivity);
  }, [view, lastActivity]);

  // Resetare autorizare la schimbarea vederii
  useEffect(() => {
    if (view !== "parent" && view !== "pin_entry") {
      setIsParentAuthorized(false);
    }
    setLastActivity(Date.now());
  }, [view]);

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
        <p className="text-xl font-bold text-amber-100">{lang === "ro" ? "Se încarcă magia..." : "Magic is loading..."}</p>
      </div>
    );
  }

  if (!user && auth) {
    return <AuthScreen t={t} lang={lang} />;
  }

  const currentBg = getBackgroundClass(view === "game" ? currentPlayingLevel : maxLevel);

  return (
    <div 
      className="min-h-screen font-sans text-slate-800 selection:bg-amber-300 relative overflow-x-hidden bg-cover bg-fixed"
      style={{ backgroundImage: "url('/background.png')", backgroundPosition: "center 20%" }}
    >
      {/* Overlay pentru a păstra tema culorilor și a îmbunătăți lizibilitatea */}
      <div className={`fixed inset-0 bg-gradient-to-b ${currentBg} opacity-50 pointer-events-none transition-colors duration-[2000ms] z-0`}></div>
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(5deg); } }
        @keyframes float-delay { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(-5deg); } }
        @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.4); } 50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.8); } }
        @keyframes wiggle { 0%, 100% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delay { animation: float-delay 7s ease-in-out infinite; animation-delay: 2s; }
        .animate-pulse-glow { animation: pulse-glow 3s infinite; }
        .animate-wiggle { animation: wiggle 4s ease-in-out infinite; }
        .animate-pop { animation: pop 0.3s ease-in-out; }
        .bg-magic-pattern { background-image: radial-gradient(circle at 15px 15px, rgba(255,255,255,0.1) 2px, transparent 0); background-size: 30px 30px; }
        
        .glossy-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 
            0 12px 0 0 rgba(0,0,0,0.25), 
            inset 0 -12px 20px rgba(0,0,0,0.3), 
            inset 0 12px 20px rgba(255,255,255,0.5),
            0 20px 40px rgba(0,0,0,0.3);
          border: 4px solid rgba(255,255,255,0.2);
        }
        .glossy-button:active {
          transform: translateY(10px);
          box-shadow: 0 2px 0 0 rgba(0,0,0,0.2), inset 0 -6px 10px rgba(0,0,0,0.3), inset 0 6px 10px rgba(255,255,255,0.4);
        }
        .glossy-button::before {
          content: '';
          position: absolute;
          top: 3%;
          left: 10%;
          width: 80%;
          height: 40%;
          background: linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.1) 80%, transparent);
          border-radius: 50% 50% 45% 45% / 100% 100% 20% 20%;
          pointer-events: none;
          z-index: 2;
        }
        .glossy-button::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.12;
          mix-blend-mode: overlay;
          pointer-events: none;
        }
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

      <header className="bg-indigo-950/90 backdrop-blur-xl shadow-2xl p-3 sticky top-0 z-[100] border-b-2 border-indigo-400/20">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setView("menu")}
          >
            <div className="bg-amber-400 p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-xl drop-shadow-md">🐱</span>
            </div>
            <h1 className="text-xl font-black text-amber-500 tracking-tight hidden sm:block drop-shadow-sm">
              {t("app_title")}
            </h1>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-0.5 bg-indigo-900/60 p-1 rounded-xl border border-indigo-500/30">
              <button 
                onClick={() => setLang("ro")} 
                className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${lang === 'ro' ? 'bg-amber-500 text-indigo-950 shadow-md' : 'text-indigo-200 hover:text-white'}`}
              >
                RO
              </button>
              <button 
                onClick={() => setLang("en")} 
                className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all ${lang === 'en' ? 'bg-amber-500 text-indigo-950 shadow-md' : 'text-indigo-200 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            {isSuperAdmin && (
              <button
                onClick={() => setView("admin")}
                className="p-2 bg-slate-800 hover:bg-slate-900 rounded-full transition-all flex items-center justify-center border-2 border-slate-700 shadow-lg hover:scale-110"
                title="Panou Administrare"
              >
                <Settings size={20} className="text-slate-100" />
              </button>
            )}

            <button
              onClick={() => {
                if (parentPin) {
                  setView("pin_entry");
                } else {
                  setIsParentAuthorized(true);
                  setView("parent");
                }
              }}
              className="p-2 bg-indigo-800/80 hover:bg-indigo-600 rounded-full transition-all flex items-center justify-center border-2 border-indigo-400/40 shadow-lg hover:scale-110"
              title="Zona Părinților"
            >
              <span className="text-lg">🐾</span>
            </button>
            <div className="flex items-center gap-2 bg-amber-900/40 border-2 border-amber-500/50 px-4 py-1.5 rounded-2xl backdrop-blur-sm shadow-lg">
              <span className="text-xl drop-shadow-md">⭐</span>
              <span className="text-xl font-black text-amber-400">
                {points}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 py-8">
        {view === "menu" && <MainMenu setView={setView} petState={petState} t={t} />}
        {view === "map" && (
          <MapScreen
            setView={setView}
            maxLevel={maxLevel}
            setCurrentPlayingLevel={setCurrentPlayingLevel}
            t={t}
            lang={lang}
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
            t={t}
            lang={lang}
            petState={petState}
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
            t={t}
            lang={lang}
          />
        )}
        {view === "homework" && (
          <HomeworkScreen homework={homework} setHomework={setHomework} t={t} lang={lang} />
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
            t={t}
            lang={lang}
          />
        )}
        {view === "parent" && isParentAuthorized && (
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
            petState={petState}
            setPetState={setPetState}
            lang={lang}
            t={t}
          />
        )}
        {view === "admin" && isSuperAdmin && (
          <AdminDashboard setView={setView} lang={lang} t={t} />
        )}
        {view === "pin_entry" && (
          <PinEntryScreen
            correctPin={parentPin}
            onCorrect={() => {
              setIsParentAuthorized(true);
              setView("parent");
            }}
            onCancel={() => setView("menu")}
            userEmail={user?.email}
            uid={user?.uid}
            lang={lang}
            onForgotPin={async () => {
              const confirmMsg = lang === "ro" 
                ? "Vrei să resetezi PIN-ul? Vei primi un email de resetare a parolei și vei fi deconectat pentru siguranță."
                : "Do you want to reset the PIN? You will receive a password reset email and be logged out for safety.";
              if (window.confirm(confirmMsg)) {
                try {
                  await sendPasswordResetEmail(auth, user.email);
                  setResetPinRequested(true);
                  // Așteptăm puțin pentru a ne asigura că flag-ul e trimis spre Firebase înainte de logout
                  setTimeout(() => signOut(auth), 1000);
                } catch (err) {
                  alert(lang === "ro" ? "Eroare: " + err.message : "Error: " + err.message);
                }
              }
            }}
          />
        )}
      </main>

      {user && parentPin === null && !dbLoading && (
        <PinSetupScreen 
          onComplete={async (pin, petName) => {
            const hashed = await hashPin(pin, user.uid);
            setPetState((prev) => ({
              ...prev,
              name: petName
            }));
            setParentPin(hashed);
          }} 
          lang={lang} 
        />
      )}
    </div>
  );
}

// ==========================================
// MENIUL PRINCIPAL
// ==========================================
function MainMenu({ setView, petState, t }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 sm:space-y-12 animate-fade-in mt-6 sm:mt-12 relative z-10">
      {/* Cardul Central cu Pisicuța */}
      <div className="relative w-full max-w-2xl px-4 pt-16 sm:pt-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 sm:-translate-y-4 w-36 h-36 sm:w-48 sm:h-48 z-20 pointer-events-none">
          <img 
            src="/teo_virtual_pet.png" 
            alt="Cute Kitten" 
            className="w-full h-full object-contain animate-float drop-shadow-2xl"
          />
        </div>
        <div className="bg-indigo-900/40 backdrop-blur-xl border-[3px] border-indigo-300/30 rounded-3xl sm:rounded-[3rem] p-5 pt-16 sm:p-10 sm:pt-24 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center relative overflow-hidden ring-1 ring-white/10">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          <h2 className="text-2xl sm:text-5xl font-black text-amber-300 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] mb-4 sm:mb-6 tracking-tight">
            {t("menu_welcome")}
          </h2>
          <div className="bg-slate-900/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-white/5 shadow-inner">
            <p className="text-sm sm:text-lg text-indigo-100 font-medium leading-relaxed max-w-md mx-auto">
              {t("menu_subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Grid Butoane Premium */}
      <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full max-w-2xl px-4 pb-20">
        <button
          onClick={() => setView("map")}
          className="premium-card flex flex-col items-center justify-center aspect-square rounded-3xl sm:rounded-[3rem] bg-gradient-to-br from-emerald-400 via-teal-500 to-teal-700 border-4 border-emerald-300/50 shadow-2xl relative group overflow-hidden"
        >
          <div className="glossy-icon-container p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] mb-2 sm:mb-4 group-hover:scale-110 transition-transform relative z-10">
            <Play size={48} className="w-8 h-8 sm:w-12 sm:h-12 fill-white text-white translate-x-0.5 filter drop-shadow-lg" />
          </div>
          <span className="text-sm sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 text-center px-2 leading-tight">
            {t("btn_explore")}
          </span>
        </button>

        <button
          onClick={() => setView("homework")}
          className="premium-card flex flex-col items-center justify-center aspect-square rounded-3xl sm:rounded-[3rem] bg-gradient-to-br from-amber-300 via-orange-500 to-orange-700 border-4 border-amber-200/50 shadow-2xl relative group overflow-hidden"
        >
          <div className="glossy-icon-container p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] mb-2 sm:mb-4 group-hover:scale-110 transition-transform relative z-10">
            <BookOpen size={48} className="w-8 h-8 sm:w-12 sm:h-12 text-white filter drop-shadow-lg" />
          </div>
          <span className="text-sm sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 text-center px-2 leading-tight">
            {t("btn_missions")}
          </span>
        </button>
        <button
          onClick={() => setView("shop")}
          className="premium-card flex flex-col items-center justify-center aspect-square rounded-3xl sm:rounded-[3rem] bg-gradient-to-br from-purple-400 via-indigo-600 to-indigo-900 border-4 border-purple-300/50 shadow-2xl relative group overflow-hidden"
        >
          <div className="glossy-icon-container p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] mb-2 sm:mb-4 group-hover:scale-110 transition-transform relative z-10">
            <Gem size={48} className="w-8 h-8 sm:w-12 sm:h-12 text-white fill-white/20 filter drop-shadow-lg" />
          </div>
          <span className="text-sm sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 text-center px-2 leading-tight">
            {t("btn_treasures")}
          </span>
        </button>

        <button
          onClick={() => setView("pet")}
          className="premium-card flex flex-col items-center justify-center aspect-square rounded-3xl sm:rounded-[3rem] bg-gradient-to-br from-rose-400 via-pink-500 to-pink-700 border-4 border-rose-300/50 shadow-2xl relative group overflow-hidden"
        >
          <div className="glossy-icon-container p-3 sm:p-6 rounded-2xl sm:rounded-[2rem] mb-2 sm:mb-4 group-hover:scale-110 transition-transform relative z-10">
            <span className="text-3xl sm:text-5xl filter drop-shadow-lg">🐾</span>
          </div>
          <span className="text-sm sm:text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10 text-center px-2 leading-tight">
            {t("btn_pet")} <br/> {petState.name}
          </span>
        </button>
      </div>
    </div>
  );
}


// ==========================================
// ECRANUL DE TEME (PENTRU COPIL)
// ==========================================
function HomeworkScreen({ homework, setHomework, t, lang }) {
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
              {lang === "ro" ? "Teme Speciale" : "Special Homework"}
            </h2>
            <div className="text-white font-black drop-shadow-lg text-4xl mb-2">
              {lang === "ro" ? "Exerciții de la Părinți" : "Parent Challenges"}
            </div>
          </div>
        </div>

        <div className="p-8">
          {activeHomework.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-slate-700">
                {lang === "ro" ? "Nu ai nicio temă nouă!" : "No new homework!"}
              </h3>
              <p className="text-slate-500 mt-2">
                {lang === "ro" ? "Te poți întoarce la joacă sau în magazin." : "You can go back to playing or shopping."}
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
                            {lang === "ro" ? "Mesaj de la părinte (Trebuie refăcut):" : "Parent message (To be redone):"}
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
                        placeholder={lang === "ro" ? "Scrie răspunsul sau explicația aici..." : "Write your answer or explanation here..."}
                        className="w-full p-4 border-2 border-orange-300 rounded-2xl focus:outline-none focus:border-orange-500 font-bold text-slate-700 resize-none"
                        rows="2"
                      />
                      <button
                        onClick={() => handleSubmit(hw)}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all shadow-md active:translate-y-1"
                      >
                        {hw.status === "returned"
                          ? (lang === "ro" ? "Trimite din nou" : "Resubmit")
                          : (lang === "ro" ? "Trimite Răspunsul" : "Submit Answer")}
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white/60 p-4 rounded-xl border-2 border-orange-100">
                      <p className="text-sm text-slate-500 font-bold mb-1">
                        {lang === "ro" ? "Răspunsul tău:" : "Your answer:"}
                      </p>
                      <p className="text-lg font-black text-slate-800">
                        {hw.childAnswer}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-orange-600 font-bold">
                        <Loader2 className="animate-spin" size={18} />
                        {lang === "ro" ? "Așteaptă corectarea..." : "Waiting for review..."}
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
  { id: 1, name: { ro: "Poiana Însorită", en: "Sunny Meadow" }, icon: "🌻", description: { ro: "Începutul aventurii", en: "Start of the adventure" }, req: 0 },
  { id: 2, name: { ro: "Pădurea de Basm", en: "Fairy Tale Forest" }, icon: "🌲", description: { ro: "Printre copaci fermecați", en: "Among enchanted trees" }, req: 150 },
  { id: 3, name: { ro: "Peștera Cristalelor", en: "Crystal Cave" }, icon: "💎", description: { ro: "Scântei în întuneric", en: "Sparkles in the dark" }, req: 250 },
  { id: 4, name: { ro: "Castelul Norilor", en: "Cloud Castle" }, icon: "🏰", description: { ro: "Acolo sus pe cer", en: "High up in the sky" }, req: 400 },
  { id: 5, name: { ro: "Tărâmul Magic", en: "Magic Land" }, icon: "✨", description: { ro: "Cea mai mare provocare", en: "The ultimate challenge" }, req: 600 },
];

function MapScreen({ setView, maxLevel, setCurrentPlayingLevel, t, lang }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in mt-6 relative z-10 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-400 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] pb-2">
          {lang === "ro" ? "Harta Aventurii" : "Adventure Map"}
        </h2>
        <p className="text-xl text-indigo-100 font-bold bg-indigo-950/60 p-4 rounded-3xl backdrop-blur-md mt-4 border-2 border-indigo-500/50 shadow-2xl">
          {lang === "ro" ? "Alege un nivel pentru a continua povestea!" : "Choose a level to continue the story!"}
        </p>
      </div>

      <div className="w-full space-y-6 relative before:absolute before:inset-0 before:ml-[50%] before:-translate-x-1/2 before:w-2 before:bg-indigo-900/50 before:rounded-full before:-z-10 pb-10">
        {LEVELS.map((level, index) => {
          const isUnlocked = level.id <= maxLevel;
          return (
            <div key={level.id} className={`flex items-center gap-4 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className="w-1/2 flex justify-end">
                {index % 2 === 0 && (
                  <div className={`p-4 rounded-2xl text-center ${isUnlocked ? 'bg-white/90 shadow-xl' : 'bg-slate-800/80 text-slate-400'} border-4 ${isUnlocked ? 'border-amber-400' : 'border-slate-700'}`}>
                     <h3 className="font-black text-lg">{level.name[lang]}</h3>
                     <p className="text-sm font-medium hidden sm:block">{level.description[lang]}</p>
                     <div className="mt-2 flex items-center justify-center">
                       <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full shadow-sm ${
                         isUnlocked 
                           ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' 
                           : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                       }`}>
                         {isUnlocked ? (
                           <>{lang === "ro" ? "Deblocat! ✅" : "Unlocked! ✅"}</>
                         ) : (
                           <>{lang === "ro" ? `🔒 Necesită ${level.req} ⭐` : `🔒 Requires ${level.req} ⭐`}</>
                         )}
                       </span>
                     </div>
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
                   <div className={`p-4 rounded-2xl text-center ${isUnlocked ? 'bg-white/90 shadow-xl' : 'bg-slate-800/80 text-slate-400'} border-4 ${isUnlocked ? 'border-amber-400' : 'border-slate-700'}`}>
                     <h3 className="font-black text-lg">{level.name[lang]}</h3>
                     <p className="text-sm font-medium hidden sm:block">{level.description[lang]}</p>
                     <div className="mt-2 flex items-center justify-center">
                       <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full shadow-sm ${
                         isUnlocked 
                           ? 'bg-emerald-500/20 text-emerald-700 border border-emerald-500/30' 
                           : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                       }`}>
                         {isUnlocked ? (
                           <>{lang === "ro" ? "Deblocat! ✅" : "Unlocked! ✅"}</>
                         ) : (
                           <>{lang === "ro" ? `🔒 Necesită ${level.req} ⭐` : `🔒 Requires ${level.req} ⭐`}</>
                         )}
                       </span>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           );
         })}
       </div>
       <button onClick={() => setView("menu")} className="mt-8 px-6 py-3 bg-indigo-800 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors border-2 border-indigo-400">
         {lang === "ro" ? "Înapoi la Meniu" : "Back to Menu"}
       </button>
    </div>
  );
}

// ==========================================
// ECRANUL DE JOC (LOGICA MATEMATICĂ)
// ==========================================
function GameScreen({ setPoints, addHistory, currentPlayingLevel, maxLevel, setMaxLevel, levelProgress, setLevelProgress, setView, logError, t, lang, petState }) {
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [petCheer, setPetCheer] = useState("");
  const inputRef = useRef(null);

  const generateProblem = () => {
    let text = "";
    let correctAnswer = 0;
    let reward = 10;
    let opType = "adunare";

    // Generăm exercițiile în funcție de nivelul curent selectat (currentPlayingLevel)
    if (currentPlayingLevel === 1) {
      // Nivelul 1 - Poiana Însorită: Doar adunări și scăderi simple cu numere foarte mici (0 - 30). Fără rezultate negative.
      const isAddition = Math.random() > 0.5;
      if (isAddition) {
        opType = "adunare";
        const a = Math.floor(Math.random() * 21) + 5; // 5 - 25
        const b = Math.floor(Math.random() * 10) + 1; // 1 - 10
        text = `${a} + ${b}`;
        correctAnswer = a + b;
      } else {
        opType = "scadere";
        const a = Math.floor(Math.random() * 21) + 10; // 10 - 30
        const b = Math.floor(Math.random() * (a - 1)) + 1; // Întotdeauna rezultat pozitiv și non-zero
        text = `${a} - ${b}`;
        correctAnswer = a - b;
      }
      reward = 10;
    } 
    else if (currentPlayingLevel === 2) {
      // Nivelul 2 - Pădurea de Basm: Adunări/scăderi până la 100 și înmulțiri simple (tabla înmulțirii cu 1-5).
      const randType = Math.floor(Math.random() * 3);
      if (randType === 0) {
        opType = "adunare";
        const a = Math.floor(Math.random() * 70) + 15; // 15 - 85
        const b = Math.floor(Math.random() * 15) + 5;  // 5 - 20
        text = `${a} + ${b}`;
        correctAnswer = a + b;
      } else if (randType === 1) {
        opType = "scadere";
        const a = Math.floor(Math.random() * 80) + 20; // 20 - 100
        const b = Math.floor(Math.random() * (a - 5)) + 5;
        text = `${a} - ${b}`;
        correctAnswer = a - b;
      } else {
        opType = "inmultire";
        const a = Math.floor(Math.random() * 5) + 1; // 1 - 5
        const b = Math.floor(Math.random() * 10) + 1; // 1 - 10
        text = `${a} x ${b}`;
        correctAnswer = a * b;
      }
      reward = 12;
    } 
    else if (currentPlayingLevel === 3) {
      // Nivelul 3 - Peștera Cristalelor: Tabla înmulțirii completă (1-10) și împărțiri simple corespunzătoare.
      const isMultiplication = Math.random() > 0.5;
      if (isMultiplication) {
        opType = "inmultire";
        const a = Math.floor(Math.random() * 10) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        text = `${a} x ${b}`;
        correctAnswer = a * b;
      } else {
        opType = "impartire";
        const divisor = Math.floor(Math.random() * 9) + 2; // 2 - 10
        const quotient = Math.floor(Math.random() * 10) + 1; // 1 - 10
        const dividend = divisor * quotient;
        text = `${dividend} : ${divisor}`;
        correctAnswer = quotient;
      }
      reward = 15;
    } 
    else if (currentPlayingLevel === 4) {
      // Nivelul 4 - Castelul Norilor: Expresii mixte din 3 termeni fără paranteze (ordine operații).
      opType = "inmultire";
      const a = Math.floor(Math.random() * 9) + 2; // 2 - 10
      const b = Math.floor(Math.random() * 5) + 2; // 2 - 6
      const c = Math.floor(Math.random() * 10) + 1;
      const isAddFirst = Math.random() > 0.5;
      if (isAddFirst) {
        text = `${c} + ${a} x ${b}`;
        correctAnswer = c + a * b;
      } else {
        const multResult = a * b;
        const sub = Math.floor(Math.random() * (multResult - 2)) + 1;
        text = `${a} x ${b} - ${sub}`;
        correctAnswer = multResult - sub;
      }
      reward = 20;
    } 
    else {
      // Nivelul 5 - Tărâmul Magic: Expresii avansate cu paranteze rotunde.
      opType = "impartire";
      const subType = Math.floor(Math.random() * 3);
      if (subType === 0) {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 5) + 2;
        text = `(${a} + ${b}) x ${c}`;
        correctAnswer = (a + b) * c;
      } else if (subType === 1) {
        const a = Math.floor(Math.random() * 12) + 5;
        const b = Math.floor(Math.random() * (a - 2)) + 1;
        const c = Math.floor(Math.random() * 5) + 2;
        text = `${c} x (${a} - ${b})`;
        correctAnswer = c * (a - b);
      } else {
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 8) + 2;
        const a = Math.floor(Math.random() * 15) + (b + c + 2);
        text = `${a} - (${b} + ${c})`;
        correctAnswer = a - (b + c);
      }
      reward = 25;
    }

    setProblem({ text, answer: correctAnswer, reward, opType });
    setAnswer("");
    setFeedback(null);

    // Mesaj dinamic de încurajare inactiv de la pet
    const idleMessages = lang === "ro" ? [
      `„Sunt sigur că știi răspunsul!” spune ${petState?.name || "pisicuța"}. 🐾`,
      `„Matematica e superputerea ta!” șoptește ${petState?.name || "pisicuța"}. ✨`,
      `${petState?.name || "Pisicuța"} abia așteaptă să rezolvi provocarea! 💖`,
      `${petState?.name || "Pisicuța"} se uită la tine plină de speranță! 🐱`
    ] : [
      `"I'm sure you know the answer!" says ${petState?.name || "kitten"}. 🐾`,
      `"Math is your superpower!" whispers ${petState?.name || "kitten"}. ✨`,
      `${petState?.name || "Kitten"} can't wait for you to solve this! 💖`,
      `${petState?.name || "Kitten"} is watching you with hope! 🐱`
    ];
    setPetCheer(idleMessages[Math.floor(Math.random() * idleMessages.length)]);

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

      // Calculăm combo streak și bonusul de comori
      const newStreak = streak + 1;
      setStreak(newStreak);

      let bonus = 0;
      if (newStreak >= 3) {
        if (newStreak === 3) bonus = 2;
        else if (newStreak === 4) bonus = 3;
        else bonus = 5;
      }

      const totalReward = problem.reward + bonus;
      setPoints((prev) => prev + totalReward);
      
      const historyMsg = lang === "ro"
        ? `Provocare completată: ${problem.text} = ${problem.answer}${bonus > 0 ? ` (+${bonus} bonus combo!)` : ""}`
        : `Challenge completed: ${problem.text} = ${problem.answer}${bonus > 0 ? ` (+${bonus} combo bonus!)` : ""}`;
      
      addHistory(historyMsg, totalReward, "earn");

      // Reactia pet-ului la succes
      if (newStreak >= 3) {
        setPetCheer(lang === "ro"
          ? `„Incredibil! Ești în extaz! 🔥 Păstrează ritmul!” miaună ${petState?.name || "pisica"}.`
          : `"Unbelievable! You are on fire! 🔥 Keep it up!" purrs ${petState?.name || "kitten"}.`
        );
      } else {
        const successMessages = lang === "ro" ? [
          `„Uau! Sunt extrem de mândru de tine! 🐾😻” miaună de bucurie ${petState?.name || "pisica"}.`,
          `„Ești un geniu adevărat al matematicii! ⚡” spune ${petState?.name || "pisica"}.`,
          `„Ieei! Am primit energie din mintea ta sclipitoare!” dansează ${petState?.name || "pisica"}. 🎉`
        ] : [
          `"Wow! I am so proud of you! 🐾😻" meows ${petState?.name || "kitten"} with joy.`,
          `"You are a true math genius! ⚡" says ${petState?.name || "kitten"}.`,
          `"Yay! I got energy from your brilliant mind!" dances ${petState?.name || "kitten"}. 🎉`
        ];
        setPetCheer(successMessages[Math.floor(Math.random() * successMessages.length)]);
      }

      const newProgress = levelProgress + totalReward;
      const targetPoints = LEVEL_REQ_POINTS[currentPlayingLevel - 1] || Infinity;

      if (newProgress >= targetPoints && currentPlayingLevel === maxLevel && maxLevel < 5) {
        setMaxLevel(maxLevel + 1);
        setFeedback({
          type: "success",
          message: lang === "ro" 
            ? `Ai primit ${totalReward} steluțe. Ai deblocat nivelul următor! 🎉`
            : `You got ${totalReward} stars. You unlocked the next level! 🎉`,
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
            message: lang === "ro"
              ? `Corect! Ai primit ${totalReward} steluțe. (Încă ${pointsLeft} steluțe necesare)`
              : `Correct! You got ${totalReward} stars. (${pointsLeft} more needed)`,
          });
        } else {
          setFeedback({
            type: "success",
            message: lang === "ro" 
              ? `Corect! Ai primit ${totalReward} steluțe.` 
              : `Correct! You got ${totalReward} stars.`,
          });
        }
      }

      setTimeout(() => {
        generateProblem();
      }, 2500);
    } else {
      // Greșeala resetează combo-ul
      setStreak(0);
      
      const failMessages = lang === "ro" ? [
        `„Nu-i nimic, se mai întâmplă! Știu că poți data viitoare!” te îmbrățișează ${petState?.name || "pisica"}. 🤗`,
        `„Nu renunța! ${petState?.name || "Pisicuța"} crede în tine și te susține! 🐾”`,
        `„Mai încearcă o dată! Suntem o echipă imbatabilă!” spune ${petState?.name || "pisica"}. 💖`
      ] : [
        `"Don't worry, it happens! I know you can do it next time!" hugs you ${petState?.name || "kitten"}. 🤗`,
        `"Don't give up! ${petState?.name || "Kitten"} believes in you and supports you! 🐾"`,
        `"Try one more time! We are an unbeatable team!" says ${petState?.name || "kitten"}. 💖`
      ];
      setPetCheer(failMessages[Math.floor(Math.random() * failMessages.length)]);

      setFeedback({ type: "error", message: lang === "ro" ? `Greșit. Mai încearcă!` : `Wrong. Try again!` });
      logError(problem.opType);
      addHistory(lang === "ro" ? `Ai ratat provocarea: ${problem.text}` : `You missed the challenge: ${problem.text}`, 0, "fail");
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
                  <span>🐾</span> {lang === "ro" ? "Nivel" : "Level"} {currentPlayingLevel} <span>🐾</span>
                </h2>
              </div>
              <div className="w-10"></div>
            </div>

            {/* Combo Badge in Natural Layout Flow */}
            {streak >= 2 && (
              <div className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-sm px-5 py-2 rounded-full shadow-[0_4px_15px_rgba(239,68,68,0.5)] border-2 border-amber-200 animate-pulse justify-center">
                <span>🔥</span>
                <span>Combo x{streak}!</span>
                {streak >= 3 && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-md font-extrabold">
                    +{streak === 3 ? 2 : streak === 4 ? 3 : 5} ⭐
                  </span>
                )}
              </div>
            )}

            <div className="text-amber-50 font-black drop-shadow-[0_5px_10px_rgba(0,0,0,0.6)] tracking-wider transition-all duration-500 text-7xl">
              {problem.text} = ?
            </div>

            <div className="mt-8 inline-flex items-center gap-3 bg-amber-100/10 backdrop-blur-md px-6 py-3 rounded-full text-amber-100 text-lg font-black border-2 border-amber-500/40 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
              <Star
                size={24}
                className="fill-amber-400 text-amber-400 animate-pulse"
              />
              {lang === "ro" ? "Recompensă" : "Reward"}: {problem.reward} {lang === "ro" ? "steluțe" : "stars"}
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
            {t("game_verify")}{" "}
            <Check
              size={40}
              className="group-hover:scale-125 transition-transform drop-shadow-md"
            />
          </button>
        </form>

        {/* Pet Cheering Widget */}
        <div className="px-8 pb-4 bg-amber-50">
          <div className="flex items-center gap-4 bg-amber-100/50 p-4 rounded-[2rem] border-2 border-amber-600/20 shadow-sm relative overflow-hidden">
            <div className="text-4xl shrink-0 bg-white p-3 rounded-2xl shadow-md border border-amber-200 animate-bounce">
              🐱
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                <span>🐾</span>
                <span>{petState?.name || (lang === "ro" ? "Prietenul Pet" : "Pet Friend")}</span>
              </h4>
              <p className="text-sm font-bold text-amber-950/80 italic mt-0.5 leading-relaxed">
                {petCheer}
              </p>
            </div>
          </div>
        </div>

        {feedback && (
          <div className="px-8 pb-8 bg-amber-50">
            <div
              className={`p-6 rounded-[2rem] font-black text-center text-xl shadow-inner border-4 ${feedback.type === "success" ? "bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-900 animate-pop border-emerald-400" : "bg-gradient-to-r from-rose-100 to-rose-200 text-rose-900 animate-wiggle border-rose-400"}`}
            >
              {feedback.type === "success" ? (lang === "ro" ? "🐟 Prrfect! " : "🐟 Purrfect! ") : (lang === "ro" ? "🙀 Miau... " : "🙀 Meow... ")}
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
  t,
  lang,
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
      const itemName = typeof item.name === "object" ? item.name[lang] : item.name;
      addHistory(`${lang === "ro" ? "Ai cumpărat" : "You bought"}: ${itemName}`, -item.cost, "spend");
    } else {
      alert(
        lang === "ro" 
          ? "Nu ai suficiente puncte! Joacă mai mult pentru a strânge steluțe."
          : "Not enough points! Play more to collect stars."
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
          {lang === "ro" ? "Magazin" : "Shop"}
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex-1 py-5 text-xl font-black transition-colors flex justify-center items-center gap-2 ${activeTab === "inventory" ? "bg-blue-100 text-blue-800 border-b-4 border-blue-500" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`}
        >
          {lang === "ro" ? "Lucrurile mele" : "My Stuff"}{" "}
          <span className="bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-inner">
            {inventory.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-5 text-xl font-black transition-colors ${activeTab === "history" ? "bg-slate-200 text-slate-800 border-b-4 border-slate-600" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}
        >
          {lang === "ro" ? "Istoric Puncte" : "Points History"}
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
                    {typeof item.name === "object" ? item.name[lang] : item.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 font-medium line-clamp-2">
                    {typeof item.description === "object" ? item.description[lang] : item.description}
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
                      {lang === "ro" ? "Cumpără" : "Buy"}
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
                <p className="text-xl font-bold">{lang === "ro" ? "Nu ai cumpărat nimic încă." : "You haven't bought anything yet."}</p>
                <p className="text-base mt-2">
                  {t("shop_subtitle")}
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
                      {typeof item.name === "object" ? item.name[lang] : item.name}
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
  petState,
  setPetState,
  lang,
  t
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
        lang === "ro" ? "Introdu noul nume pentru prietenul tău virtual:" : "Enter a new name for your virtual friend:",
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
    addHistory(`${lang === "ro" ? "Premiu folosit/revendicat" : "Reward used/claimed"}: ${itemName}`, 0, "info");
  };

  const handleAddBonus = (e) => {
    e.preventDefault();
    if (!bonusPoints) return;
    const amount = parseInt(bonusPoints, 10);
    setPoints((prev) => prev + amount);
    addHistory(lang === "ro" ? `Bonus acordat de părinte` : `Parental bonus`, amount, amount >= 0 ? "earn" : "spend");
    setBonusPoints("");
    alert(lang === "ro" ? `Punctele au fost actualizate.` : `Points updated.`);
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
      addHistory(lang === "ro" ? `Temă corectată` : `Homework graded`, awarded, "earn");
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
            <h2 className="text-white/80 text-xs font-black uppercase tracking-widest mb-1">{lang === "ro" ? "Control Părinte" : "Parent Control"}</h2>
            <div className="text-white font-black text-3xl">Dashboard</div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView("menu")}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-2xl border border-white/30 transition-colors flex items-center gap-2 text-sm font-bold"
              title={t("exit")}
            >
              <ArrowLeft size={20} /> <span className="hidden sm:inline">{t("exit")}</span>
            </button>
            <button 
              onClick={() => auth.signOut()}
              className="bg-rose-500/80 hover:bg-rose-500 p-3 rounded-2xl border border-white/30 transition-colors flex items-center gap-2 text-sm font-bold"
              title={t("logout")}
            >
              <LogOut size={20} /> <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex overflow-x-auto bg-slate-50 border-b-2 border-slate-200 no-scrollbar">
        {[
          { id: "stats", label: t("parent_stats"), icon: BarChart3 },
          { id: "homework_manage", label: t("parent_homework"), icon: BookOpen },
          { id: "shop_manage", label: t("parent_shop"), icon: ShoppingCart },
          { id: "inventory_manage", label: t("parent_inventory"), icon: Award },
          { id: "points_manage", label: t("parent_points"), icon: Star },
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
                  <Clock size={20} /> {lang === "ro" ? "Timp petrecut (min)" : "Time spent (min)"}
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
                  <AlertCircle size={20} /> {lang === "ro" ? "Greșeli frecvente" : "Common mistakes"}
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
                    <p className="font-bold">{lang === "ro" ? "Nicio greșeală încă!" : "No mistakes yet!"}</p>
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
                <FileText size={24} className="text-indigo-600" /> {lang === "ro" ? "Adaugă o temă nouă" : "Add new homework"}
              </h3>
              <form onSubmit={handleAddHomework} className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="sm:col-span-2 text-left">
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest ml-2 mb-1">{lang === "ro" ? "Cerință" : "Task"}</label>
                  <input type="text" required value={newHwQuestion} onChange={(e) => setNewHwQuestion(e.target.value)} className="w-full p-4 border-2 border-indigo-200 rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder={lang === "ro" ? "Ex: Rezolvă pag. 42..." : "Ex: Solve page 42..."} />
                </div>
                <div className="text-left">
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest ml-2 mb-1">{lang === "ro" ? "Steluțe" : "Stars"}</label>
                  <input type="number" required value={newHwReward} onChange={(e) => setNewHwReward(e.target.value)} className="w-full p-4 border-2 border-indigo-200 rounded-2xl font-bold focus:border-indigo-500 outline-none" placeholder="Ex: 50" />
                </div>
                <div className="text-left">
                  <label className="block text-xs font-black text-indigo-400 uppercase tracking-widest ml-2 mb-1">&nbsp;</label>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#312e81] active:translate-y-1 active:shadow-none transition-all">{lang === "ro" ? "Trimite" : "Send"}</button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <h3 className="font-black text-xl text-slate-800 text-left">{lang === "ro" ? "Teme Active și de Corectat" : "Active Homework to Review"}</h3>
              {homework.filter(h => h.status !== 'graded').length === 0 ? (
                <p className="text-slate-400 font-bold py-12 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">{lang === "ro" ? "Nu există teme în curs." : "No homework in progress."}</p>
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
                             {hw.status === 'new' ? (lang === "ro" ? 'Trimisă' : 'Sent') : hw.status === 'answered' ? (lang === "ro" ? 'De Corectat' : 'To Review') : (lang === "ro" ? 'Returnată' : 'Returned')}
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
                               <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">{lang === "ro" ? "Scor Final" : "Final Score"}</label>
                               <input type="number" placeholder="Ex: 50" className="w-full p-2.5 border-2 border-slate-200 rounded-xl font-bold text-sm" onChange={(e) => setGradePoints({...gradePoints, [hw.id]: e.target.value})} />
                             </div>
                             <button onClick={() => handleGradeHomework(hw.id, hw.reward)} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-2.5 rounded-xl shadow-[0_4px_0_0_#065f46] text-xs">{lang === "ro" ? "Corect & Acordă" : "Grade & Award"}</button>
                             <div className="text-left">
                               <label className="block text-[10px] font-black text-slate-400 uppercase mb-1 ml-1">{lang === "ro" ? "Sfat Refacere" : "Review Tip"}</label>
                               <input type="text" placeholder={lang === "ro" ? "Mai încearcă..." : "Try again..."} className="w-full p-2.5 border-2 border-slate-200 rounded-xl text-xs" onChange={(e) => setParentComments({...parentComments, [hw.id]: e.target.value})} />
                             </div>
                             <button onClick={() => handleReturnHomework(hw.id)} className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-2.5 rounded-xl shadow-[0_4px_0_0_#9f1239] text-xs">{lang === "ro" ? "Returnează" : "Send Back"}</button>
                          </>
                        )}
                        <button onClick={() => handleDeleteHomework(hw.id)} className="w-full text-slate-300 hover:text-rose-500 font-bold text-[10px] uppercase tracking-widest pt-2">{lang === "ro" ? "Elimină Tema" : "Delete Task"}</button>
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
              <h3 className="font-black text-xl mb-4 text-purple-900 text-left">{lang === "ro" ? "Premiu Nou în Magazin" : "New Shop Reward"}</h3>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-left">
                    <label className="block text-xs font-black text-purple-400 uppercase tracking-widest ml-2 mb-1">{lang === "ro" ? "Nume Premiu" : "Reward Name"}</label>
                    <input type="text" required value={newItemName} onChange={(e) => setNewItemName(e.target.value)} className="w-full p-4 border-2 border-purple-200 rounded-2xl font-bold focus:border-purple-500 outline-none" placeholder={lang === "ro" ? "Ex: 30 min jocuri..." : "Ex: 30 min games..."} />
                  </div>
                  <div className="text-left">
                    <label className="block text-xs font-black text-purple-400 uppercase tracking-widest ml-2 mb-1">{lang === "ro" ? "Cost Steluțe" : "Stars Cost"}</label>
                    <input type="number" required value={newItemCost} onChange={(e) => setNewItemCost(e.target.value)} className="w-full p-4 border-2 border-purple-200 rounded-2xl font-bold focus:border-purple-500 outline-none" placeholder="Ex: 100" />
                  </div>
                </div>
                <div className="text-left">
                  <label className="block text-xs font-black text-purple-400 uppercase tracking-widest ml-2 mb-2">{lang === "ro" ? "Alege o Iconiță" : "Choose an Icon"}</label>
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
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-4 rounded-2xl shadow-[0_6px_0_0_#581c87] active:translate-y-1 active:shadow-none transition-all">{lang === "ro" ? "Adaugă Premiul" : "Add Reward"}</button>
                </div>
              </form>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {shopItems.map(item => (
                <div key={item.id} className="bg-white border-4 border-slate-50 p-4 rounded-3xl flex items-center justify-between shadow-sm hover:border-purple-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl bg-slate-50 p-2 rounded-2xl">{item.icon}</span>
                    <div className="text-left">
                       <p className="font-black text-slate-800 leading-tight">{typeof item.name === "object" ? item.name[lang] : item.name}</p>
                       <p className="text-amber-600 font-bold flex items-center gap-1 text-sm"><Star size={14} className="fill-amber-500" /> {item.cost} {lang === "ro" ? "steluțe" : "stars"}</p>
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
            <div className="bg-indigo-50 border-4 border-indigo-100 p-8 rounded-[3rem]">
              <h3 className="text-2xl font-black text-indigo-900 mb-4 flex items-center gap-2">
                <span>🐾</span> {lang === "ro" ? "Nume Animal Virtual" : "Virtual Pet Name"}
              </h3>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={petState.name} 
                  onChange={(e) => setPetState(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1 p-4 border-2 border-indigo-200 rounded-2xl font-bold focus:border-indigo-500 outline-none shadow-sm"
                  placeholder={lang === "ro" ? "Introdu nume nou..." : "Enter new name..."}
                />
              </div>
              <p className="text-indigo-400 text-xs mt-3 font-bold uppercase tracking-widest ml-2">{lang === "ro" ? "Acest nume va apărea în tot jocul copilului" : "This name will appear throughout the child's game"}</p>
            </div>

            <div className="bg-emerald-50 border-4 border-emerald-100 p-8 rounded-[3rem]">
              <h3 className="text-2xl font-black text-emerald-900 mb-2">{lang === "ro" ? "Recompensele Copilului" : "Child's Rewards"}</h3>
              <p className="text-emerald-700 font-medium mb-8 italic">{lang === "ro" ? "Aici poți vedea ce a cumpărat copilul. După ce îi oferi premiul în realitate, apasă butonul de mai jos." : "Here you can see what the child bought. After you give them the reward in real life, press the button below."}</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inventory.length === 0 ? (
                  <p className="col-span-full py-12 text-center text-slate-400 font-bold bg-white/50 rounded-3xl border-4 border-dashed border-emerald-100">{lang === "ro" ? "Nicio recompensă de revendicat momentan." : "No rewards to claim currently."}</p>
                ) : (
                  inventory.map((item, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-[2.5rem] border-4 border-emerald-50 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{item.icon}</span>
                        <div className="flex flex-col">
                          <span className="font-black text-slate-800 leading-tight">{typeof item.name === "object" ? item.name[lang] : item.name}</span>
                          {item.quantity > 1 && (
                            <span className="text-xs font-bold text-indigo-500">{lang === "ro" ? "Cantitate" : "Quantity"}: {item.quantity}</span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleUseInventoryItem(idx, item.name)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-2xl font-black shadow-[0_4px_0_0_#065f46] text-sm">{lang === "ro" ? "Folosit" : "Used"}</button>
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
              <h3 className="text-2xl font-black text-amber-900 mb-8 text-center">{lang === "ro" ? "Gestionează Punctele" : "Manage Points"}</h3>
              <div className="bg-white p-8 rounded-[2.5rem] shadow-inner border-2 border-amber-100 mb-8 text-center">
                <Star size={48} className="text-amber-500 fill-amber-500 mx-auto mb-3 animate-pulse" />
                <p className="text-5xl font-black text-slate-800 text-center">{points}</p>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-1 text-center">{lang === "ro" ? "Steluțe curente" : "Current stars"}</p>
              </div>
              <form onSubmit={handleAddBonus} className="space-y-4">
                <div className="text-left">
                  <label className="block text-xs font-black text-amber-600 uppercase tracking-widest ml-4 mb-1">{lang === "ro" ? "Adaugă sau Scade" : "Add or Subtract"}</label>
                  <input type="number" required value={bonusPoints} onChange={(e) => setBonusPoints(e.target.value)} className="w-full p-5 border-4 border-amber-100 rounded-[2rem] text-center text-3xl font-black focus:border-amber-400 outline-none shadow-sm" placeholder="+ / - 50" />
                </div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black py-5 rounded-[2rem] shadow-[0_8px_0_0_#92400e] active:translate-y-1 active:shadow-none transition-all text-xl">{lang === "ro" ? "Actualizează Portofelul" : "Update Wallet"}</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 🛡️ ZONA SUPER ADMIN (GESTIONARE GLOBALĂ)
// ==========================================
function AdminDashboard({ setView, lang, t }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const fetchUsers = async (forceScan = false) => {
    setLoading(true);
    try {
      const usersRef = collection(db, "artifacts", APP_ID, "users");
      const querySnapshot = await getDocs(usersRef);
      let usersList = [];
      querySnapshot.forEach((doc) => {
        usersList.push({ id: doc.id, ...doc.data() });
      });

      // Dacă lista e goală sau cerem scanare, folosim fallback-ul collectionGroup pentru a găsi utilizatorii "fantomă"
      if (usersList.length === 0 || forceScan) {
        console.log("Scanning for ghost users...");
        const q = query(collectionGroup(db, "state"));
        const stateSnapshot = await getDocs(q);
        const ghostUsers = [];
        stateSnapshot.forEach((docSnap) => {
          if (docSnap.ref.path.includes(`artifacts/${APP_ID}/users/`)) {
            const pathParts = docSnap.ref.path.split('/');
            const userId = pathParts[pathParts.indexOf('users') + 1];
            
            if (!usersList.some(u => u.id === userId) && !ghostUsers.some(u => u.id === userId)) {
               const data = docSnap.data();
               ghostUsers.push({
                 id: userId,
                 points: data.points || 0,
                 name: data.petState?.name || "Copil",
                 email: "Scanat din sub-colecție"
               });
            }
          }
        });
        usersList = [...usersList, ...ghostUsers];
      }

      setUsers(usersList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdatePoints = async (userId, currentPoints, amount) => {
    try {
      const newPoints = (currentPoints || 0) + amount;
      
      // Update in sub-colecție (starea jocului)
      const userDocRef = doc(db, "artifacts", APP_ID, "users", userId, "gameData", "state");
      await updateDoc(userDocRef, { points: newPoints });
      
      // Update in părinte (indexul utilizatorului)
      const userIndexRef = doc(db, "artifacts", APP_ID, "users", userId);
      await setDoc(userIndexRef, { points: newPoints }, { merge: true });
      
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, points: newPoints } : u));
    } catch (err) {
      console.error("Error updating points:", err);
      alert("Eroare la actualizarea punctelor!");
    }
  };

  const filteredUsers = users.filter(u => 
    u.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-[3rem] shadow-2xl overflow-hidden border-4 border-slate-800 animate-fade-in relative z-10 max-w-5xl mx-auto">
      <div className="bg-slate-800 p-8 text-white flex justify-between items-center">
        <div className="text-left">
          <h2 className="text-white/60 text-xs font-black uppercase tracking-widest mb-1">Super Admin</h2>
          <div className="text-3xl font-black">Control Panel</div>
        </div>
        <button 
          onClick={() => setView("menu")}
          className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl border border-white/20 transition-colors flex items-center gap-2 font-bold"
        >
          <ArrowLeft size={20} /> {t("exit")}
        </button>
      </div>

      <div className="p-8">
        <div className="flex gap-4 mb-8">
          <div className="flex-1 text-left">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-2 mb-1">Căutare utilizatori</label>
            <input 
              type="text" 
              placeholder="ID utilizator sau email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 border-2 border-slate-200 rounded-2xl font-bold focus:border-slate-800 outline-none shadow-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="bg-slate-100 px-6 py-4 rounded-2xl font-black text-slate-600">
              {users.length} Utilizatori
            </div>
            <button 
              onClick={() => fetchUsers(true)}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 px-6 py-4 rounded-2xl font-black text-sm transition-colors"
              title="Caută utilizatori vechi care nu apar în listă"
            >
              Scanare Adâncă
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-slate-800" size={48} />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-3xl border-2 border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-widest">
                  <th className="p-4 border-b">User ID / Email</th>
                  <th className="p-4 border-b">Steluțe</th>
                  <th className="p-4 border-b">Acțiuni Rapide</th>
                </tr>
              </thead>
              <tbody className="font-bold text-slate-800">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-10 text-center text-slate-400 italic">Nu am găsit utilizatori.</td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 border-b">
                        <div className="font-black text-slate-800">{u.name || "Copil"}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{u.email || u.id}</div>
                      </td>
                      <td className="p-4 border-b text-amber-600 font-black text-lg">{u.points || 0} ⭐</td>
                      <td className="p-4 border-b">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdatePoints(u.id, u.points || 0, 500)}
                            className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl text-xs hover:bg-emerald-200 transition-colors"
                          >
                            +500 ⭐
                          </button>
                          <button 
                            onClick={() => handleUpdatePoints(u.id, u.points || 0, -500)}
                            className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl text-xs hover:bg-rose-200 transition-colors"
                          >
                            -500 ⭐
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// ECRANE SECURITATE PIN
// ==========================================

function PinSetupScreen({ onComplete, lang }) {
  const [petName, setPetName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!petName.trim()) {
      setError(lang === "ro" ? "Numele pisicuței nu poate fi gol!" : "Kitten's name cannot be empty!");
      return;
    }
    if (pin.length !== 4) {
      setError(lang === "ro" ? "PIN-ul trebuie să aibă 4 cifre!" : "PIN must be 4 digits!");
      return;
    }
    if (pin !== confirmPin) {
      setError(lang === "ro" ? "PIN-urile nu coincid!" : "PINs do not match!");
      return;
    }
    onComplete(pin, petName.trim());
  };

  return (
    <div className="fixed inset-0 z-[100] bg-indigo-950/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] p-8 max-w-sm w-full text-center shadow-2xl border-8 border-amber-400 animate-fade-in relative overflow-hidden">
        <div className="absolute -top-10 -right-10 text-9xl opacity-10 rotate-12 pointer-events-none">😼</div>
        <div className="text-6xl mb-4 drop-shadow-md">🔐🐾</div>
        <h2 className="text-2xl font-black text-indigo-900 mb-2">{lang === "ro" ? "Prima Configurare" : "First-time Setup"}</h2>
        <p className="text-slate-500 mb-6 font-bold text-xs leading-tight">
          {lang === "ro" 
            ? "Stabilește numele pisicuței tale și PIN-ul de siguranță al părinților!" 
            : "Set your kitten's name and the safety Parent PIN!"}
        </p>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-2xl mb-4 font-black text-sm border-2 border-red-200 animate-wiggle">{error}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 text-left">
              {lang === "ro" ? "🐾 Numele pisicuței tale" : "🐾 Your kitten's name"}
            </label>
            <input 
              type="text" 
              placeholder={lang === "ro" ? "ex: Teo, Miau..." : "e.g. Teo, Meow..."}
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full text-center text-lg p-3 border-4 border-indigo-50 rounded-2xl focus:border-amber-400 outline-none font-bold text-slate-700 shadow-inner transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 text-left">
              {lang === "ro" ? "🔑 PIN nou Părinte (4 cifre)" : "🔑 New Parent PIN (4 digits)"}
            </label>
            <input 
              type="password" 
              maxLength={4} 
              inputMode="numeric"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center text-2xl p-3 border-4 border-indigo-50 rounded-2xl focus:border-amber-400 outline-none font-black tracking-[0.5em] shadow-inner transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1 text-left">
              {lang === "ro" ? "🔑 Confirmă PIN Părinte" : "🔑 Confirm Parent PIN"}
            </label>
            <input 
              type="password" 
              maxLength={4} 
              inputMode="numeric"
              placeholder="••••"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
              className="w-full text-center text-2xl p-3 border-4 border-indigo-50 rounded-2xl focus:border-amber-400 outline-none font-black tracking-[0.5em] shadow-inner transition-colors"
            />
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-white font-black py-4 rounded-2xl shadow-[0_8px_0_0_#92400e] active:translate-y-1 active:shadow-none transition-all text-xl mt-4 border-t-2 border-amber-200"
          >
            {lang === "ro" ? "Salvează și Începe" : "Save and Start"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PinEntryScreen({ correctPin, onCorrect, onCancel, onForgotPin, userEmail, uid, lang }) {
  const [input, setInput] = useState("");
  const [isError, setIsError] = useState(false);

  const handleKey = async (num) => {
    if (input.length < 4) {
      const newInput = input + num;
      setInput(newInput);
      if (newInput.length === 4) {
        // Verificăm PIN-ul (suportăm și formatul vechi plain text pentru migrare)
        const hashedInput = await hashPin(newInput, uid);
        if (newInput === correctPin || hashedInput === correctPin) {
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
      <h2 className="text-3xl font-black text-indigo-950 mb-2">{lang === "ro" ? "Acces Securizat" : "Secure Access"}</h2>
      <p className="text-slate-500 mb-8 font-bold">{lang === "ro" ? "Introdu codul PIN pentru părinți" : "Enter the parent PIN code"}</p>
      
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

