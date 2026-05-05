import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // brief UX delay
    const ok = login(email.trim(), password);
    setLoading(false);
    if (ok) {
      const role = useAuthStore.getState().user?.role;
      navigate(role === 'CEO' ? '/ceo' : '/cfo');
    }
  };

  const fillDemo = (email: string, pwd: string) => {
    setEmail(email);
    setPassword(pwd);
  };

  return (
    <div className="min-h-screen bg-lw-navy flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lw-red via-lw-gold to-lw-red" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-lw-red/5 rounded-full" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-lw-gold/5 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-lw-darkCard border border-lw-darkBorder rounded-2xl shadow-2xl overflow-hidden">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-lw-red to-lw-gold" />

          <div className="p-8">
            {/* Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-lw-red rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-xl">LW</span>
              </div>
              <div>
                <h1 className="text-lw-darkText font-bold text-lg font-serif leading-tight">
                  Leadway Assurance
                </h1>
                <p className="text-lw-darkMuted text-sm">Executive Dashboard System</p>
              </div>
            </div>

            <h2 className="text-lw-darkText font-bold text-xl mb-1 font-serif">Sign in</h2>
            <p className="text-lw-darkMuted text-sm mb-6">
              Access your role-based executive intelligence dashboard.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-lw-darkMuted mb-1.5 uppercase tracking-wide">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@leadway.com"
                  required
                  className="w-full bg-lw-darkCard2 border border-lw-darkBorder text-lw-darkText placeholder-lw-darkMuted rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-lw-gold focus:ring-1 focus:ring-lw-gold/30 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-lw-darkMuted mb-1.5 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-lw-darkCard2 border border-lw-darkBorder text-lw-darkText placeholder-lw-darkMuted rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:border-lw-gold focus:ring-1 focus:ring-lw-gold/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-lw-darkMuted hover:text-lw-darkText transition-colors"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="bg-lw-danger/10 border border-lw-danger/30 text-lw-danger text-sm rounded-xl px-4 py-3">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-lw-red hover:bg-lw-redD text-white font-semibold py-3 px-6 rounded-xl transition-colors disabled:opacity-60 text-sm"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-6 border-t border-lw-darkBorder">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-3.5 h-3.5 text-lw-darkMuted" />
                <p className="text-xs font-semibold text-lw-darkMuted uppercase tracking-wide">Demo Credentials</p>
              </div>
              <div className="space-y-2">
                {[
                  { role: 'CFO', email: 'cfo@leadway.com', pwd: 'cfo2025', color: 'text-lw-gold' },
                  { role: 'CEO', email: 'ceo@leadway.com', pwd: 'ceo2025', color: 'text-lw-green' },
                  { role: 'Admin', email: 'admin@leadway.com', pwd: 'admin2025', color: 'text-lw-red' },
                ].map(({ role, email: e, pwd, color }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => fillDemo(e, pwd)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-lw-darkCard2 border border-lw-darkBorder rounded-lg hover:border-lw-gold/40 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${color}`}>{role}</span>
                      <span className="text-xs text-lw-darkMuted font-mono">{e}</span>
                    </div>
                    <span className="text-xs text-lw-darkMuted font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {pwd}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-lw-darkMuted mt-4">
          Leadway Assurance Company Limited Group · Confidential
        </p>
      </div>
    </div>
  );
};

export default Login;
