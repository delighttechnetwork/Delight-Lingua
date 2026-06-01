<<<<<<< HEAD
import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
];

interface HistoryEntry {
  id: number;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  createdAt: string;
}

function App() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [isLoading, setIsLoading] = useState(false);

  const [user, setUser] = useState<{ email: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setUser(JSON.parse(savedUser));
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/history`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistory(data);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegistering ? 'register' : 'login';
    try {
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setShowAuth(false);
        fetchHistory();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setHistory([]);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceLang === 'auto' ? undefined : sourceLang,
          targetLang,
        }),
      });

      const data = await response.json();
      if (data.translatedText) {
        setTranslatedText(data.translatedText);
        if (user) fetchHistory();
      } else {
        console.error('Translation error:', data.error);
      }
    } catch (error) {
      console.error('Failed to translate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHistory = async (id: number) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchHistory();
    } catch (error) {
      console.error('Failed to delete history:', error);
    }
  };

  const handleClear = () => {
    setSourceText('');
    setTranslatedText('');
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <nav className="w-full max-w-4xl flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-blue-600">Delight Lingua</h1>
        <div>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Hi, {user.email}</span>
              <button onClick={handleLogout} className="text-blue-600 hover:underline text-sm">Logout</button>
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} className="bg-blue-600 text-white px-4 py-2 rounded-md">Login</button>
          )}
        </div>
      </nav>

      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{isRegistering ? 'Register' : 'Login'}</h2>
            <form onSubmit={handleAuth}>
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full p-2 border rounded mb-4"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mb-4">
                {isRegistering ? 'Sign Up' : 'Sign In'}
              </button>
            </form>
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 hover:underline text-sm">
              {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
            <button onClick={() => setShowAuth(false)} className="block mt-4 text-gray-500 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <main className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <div className="flex mb-4 gap-2">
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value)}
                className="p-2 border rounded-md bg-gray-50 flex-grow"
              >
                <option value="auto">Auto-detect</option>
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button onClick={handleClear} className="p-2 text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Type or paste text here..."
              className="w-full h-48 p-4 border rounded-md resize-none focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex mb-4 gap-2">
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="p-2 border rounded-md bg-gray-50 flex-grow"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <button onClick={() => handleCopy(translatedText)} disabled={!translatedText} className="p-2 text-blue-500 hover:text-blue-700 disabled:text-gray-300">📋</button>
            </div>
            <div className="w-full h-48 p-4 border rounded-md bg-gray-50 overflow-auto whitespace-pre-wrap">
              {isLoading ? (
                <span className="text-gray-400 italic">Translating...</span>
              ) : (
                translatedText || <span className="text-gray-400 italic">Translation will appear here</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleTranslate}
            disabled={isLoading || !sourceText.trim()}
            className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 shadow-lg"
          >
            Translate
          </button>
        </div>
      </main>

      {user && history.length > 0 && (
        <section className="w-full max-w-4xl bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">History</h2>
          <div className="space-y-4">
            {history.map((entry) => (
              <div key={entry.id} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-sm text-gray-500">
                    {entry.sourceLang} → {entry.targetLang} • {new Date(entry.createdAt).toLocaleString()}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleCopy(entry.translatedText)} className="text-blue-500 hover:text-blue-700 text-sm">Copy</button>
                    <button onClick={() => deleteHistory(entry.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </div>
                </div>
                <p className="text-gray-700 font-medium">{entry.sourceText}</p>
                <p className="text-blue-600 mt-1">{entry.translatedText}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-auto pt-10 text-gray-400 text-sm">
        © 2024 Delight Lingua. All rights reserved.
      </footer>
    </div>
  );
}

=======
import React from 'react';
function App() {
  return <h1>Delight Lingua</h1>;
}
>>>>>>> main
export default App;
