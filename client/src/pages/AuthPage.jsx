import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #1a0a2e 100%)" }}>
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20"
             style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-15"
             style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
             style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)" }} />
      </div>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
               style={{
                 width: Math.random() * 2 + 1 + "px", height: Math.random() * 2 + 1 + "px",
                 left: Math.random() * 100 + "%", top: Math.random() * 100 + "%",
                 opacity: Math.random() * 0.5 + 0.1,
                 animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
                 animationDelay: Math.random() * 2 + "s"
               }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5 glow-violet animate-pulse-ring"
               style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
            <span className="text-4xl">🌐</span>
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="gradient-text">to</span>
            <span className="text-white">Gather</span>
          </h1>
          <p className="text-slate-400 text-sm">Rede Social do Ecossistema Nexus</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          {/* Tabs */}
          <div className="flex rounded-xl p-1 mb-8"
               style={{ background: "rgba(15, 23, 42, 0.6)" }}>
            {["login", "register"].map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); setForm({ username: "", email: "", password: "" }); }}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer"
                      style={mode === m ? {
                        background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                        color: "white", boxShadow: "0 4px 12px rgba(124,58,237,.4)"
                      } : { color: "#64748b" }}>
                {m === "login" ? "Entrar" : "Criar Conta"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="animate-fade-in">
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Nome de usuário
                </label>
                <input name="username" type="text" placeholder="ex: alexnexus" value={form.username}
                       onChange={handleChange} required className="input-base" />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                E-mail Nexus
              </label>
              <input name="email" type="email" placeholder="seu@nexus.io" value={form.email}
                     onChange={handleChange} required className="input-base" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Senha
              </label>
              <input name="password" type="password" placeholder="••••••••" value={form.password}
                     onChange={handleChange} required className="input-base" />
            </div>

            {error && (
              <div className="animate-fade-in px-4 py-3 rounded-xl text-sm"
                   style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.3)", color: "#fb7185" }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base mt-2"
                    style={{ padding: "0.875rem" }}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar no toGather" : "Criar Conta"}
            </button>
          </form>

          {/* SSO Nexus */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: "rgba(100,116,139,.3)" }} />
              <span className="text-xs text-slate-500">ou continue com</span>
              <div className="flex-1 h-px" style={{ background: "rgba(100,116,139,.3)" }} />
            </div>
            <button className="btn-ghost w-full flex items-center justify-center gap-3"
                    onClick={() => alert("SSO Nexus: Integração com o ecossistema Nexus ID. (Demo)")}>
              <span className="text-xl">🔮</span>
              <span>SSO Nexus ID</span>
            </button>
          </div>
        </div>

        {/* Demo hint */}
        <div className="mt-6 glass rounded-xl p-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">Contas de demo</p>
          <div className="space-y-1">
            {["alex@nexus.io", "bruna@nexus.io", "carlos@nexus.io", "diana@nexus.io"].map(e => (
              <button key={e} onClick={() => setForm(f => ({ ...f, email: e, password: "123456" }))}
                      className="block w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                      style={{ color: "#a78bfa" }}
                      onMouseEnter={ev => ev.target.style.background = "rgba(139,92,246,.1)"}
                      onMouseLeave={ev => ev.target.style.background = "transparent"}>
                {e}
              </button>
            ))}
            <p className="text-xs text-slate-600 mt-1 pl-3">Senha: 123456</p>
          </div>
        </div>
      </div>
    </div>
  );
}
