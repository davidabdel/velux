import { useState } from 'react';
import SkylightSelector from '@/components/SkylightSelector';
import { Button } from '@/components/ui/button';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1941') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md bg-white p-10 rounded-xl border shadow-sm text-center">
          <img src="/velux logo.svg" alt="VELUX" className="h-12 mx-auto mb-8" />
          <h2 className="text-xl font-light mb-6 text-gray-700">Protected Access</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-md focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Enter Password"
              autoFocus
            />
            {error && <p className="text-primary text-sm font-medium">Incorrect password</p>}
            <Button type="submit" className="w-full h-12 text-base">Enter</Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
      <SkylightSelector />
    </div>
  );
}

export default App;
