import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";

export default function GroupsPage({ onEnterGroup }) {
  const { user, logout } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");
  const [joiningLoading, setJoiningLoading] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchGroups = async () => {
    try {
      const r = await api.get("/groups");
      setGroups(r.data.groups);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoinError(""); setJoinSuccess(""); setJoiningLoading(true);
    try {
      const r = await api.post("/groups/join", { code: joinCode.toUpperCase() });
      setJoinSuccess(r.data.message);
      setJoinCode("");
      fetchGroups();
      setTimeout(() => { setShowJoinModal(false); setJoinSuccess(""); }, 1500);
    } catch (err) {
      setJoinError(err.response?.data?.message || "Erro ao entrar no grupo.");
    } finally {
      setJoiningLoading(false);
    }
  };

  const levelColor = (level) => {
    if (level >= 8) return "#fbbf24";
    if (level >= 5) return "#8b5cf6";
    if (level >= 3) return "#10b981";
    return "#64748b";
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)" }}>
      {/* Header */}
      <header className="glass-dark sticky top-0 z-50" style={{ borderBottom: "1px solid rgba(100,116,139,.15)" }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
              <span className="text-lg">🌐</span>
            </div>
            <div>
              <span className="text-white font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="gradient-text">to</span>Gather
              </span>
              <p className="text-slate-500 text-xs">Ecossistema Nexus</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 glass rounded-xl px-3 py-2">
              <img src={user?.avatar} alt={user?.username} className="w-7 h-7 rounded-lg" />
              <span className="text-sm font-semibold text-slate-200">{user?.username}</span>
            </div>
            <button onClick={logout} className="btn-ghost text-sm" style={{ padding: "0.5rem 0.875rem" }}>
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-8 animate-slide-up">
          <h2 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Meus Círculos
          </h2>
          <p className="text-slate-400">Seus grupos fechados, sem algoritmos.</p>
        </div>

        {/* Groups grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          </div>
        ) : groups.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="text-6xl mb-4 animate-float">🌌</div>
            <p className="text-slate-400 text-lg mb-2">Você ainda não está em nenhum grupo.</p>
            <p className="text-slate-500 text-sm">Use um código de convite para entrar no seu primeiro círculo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {groups.map((g, i) => (
              <button key={g.id} onClick={() => onEnterGroup(g.id)}
                      className="glass rounded-2xl p-5 text-left card-hover animate-slide-up cursor-pointer"
                      style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl glass">
                      {g.emoji}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm leading-tight">{g.name}</h3>
                      <p className="text-slate-500 text-xs mt-0.5">{g.members.length} membros</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                          style={{ color: levelColor(g.level), background: `${levelColor(g.level)}20` }}>
                      Nv.{g.level}
                    </span>
                    <span className="text-xs" style={{ color: "#fbbf24" }}>🔥 {g.streak}d</span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs mb-4 line-clamp-2">{g.description}</p>

                {/* XP bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>XP</span>
                    <span>{g.xp}/{g.xpToNext}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(100,116,139,.2)" }}>
                    <div className="h-full rounded-full xp-bar-fill"
                         style={{ width: `${(g.xp / g.xpToNext) * 100}%` }} />
                  </div>
                </div>

                {/* Members avatars */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {g.members.slice(0, 4).map((m) => (
                      <img key={m.id} src={m.avatar} alt={m.username}
                           className="w-7 h-7 rounded-lg border-2"
                           style={{ borderColor: "#0f172a" }}
                           title={m.username} />
                    ))}
                    {g.members.length > 4 && (
                      <div className="w-7 h-7 rounded-lg border-2 flex items-center justify-center text-xs font-bold text-slate-400"
                           style={{ borderColor: "#0f172a", background: "#1e293b" }}>
                        +{g.members.length - 4}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {g.spotlightPostedToday ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(16,185,129,.15)", color: "#34d399", border: "1px solid rgba(16,185,129,.3)" }}>
                        ✓ Spotlight ok
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: "rgba(251,191,36,.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,.3)" }}>
                        ⏳ Aguardando
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Join group button */}
        <div className="flex justify-center animate-fade-in">
          <button onClick={() => setShowJoinModal(true)} className="btn-primary flex items-center gap-2"
                  style={{ padding: "0.875rem 2rem" }}>
            <span>＋</span> Entrar em um Grupo
          </button>
        </div>
      </main>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)" }}
             onClick={e => e.target === e.currentTarget && setShowJoinModal(false)}>
          <div className="glass rounded-2xl p-8 w-full max-w-md animate-slide-up">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🔑</div>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Entrar em um Círculo
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                Insira o código do grupo para fazer parte do círculo.
              </p>
            </div>

            <form onSubmit={handleJoin} className="space-y-4">
              <input type="text" placeholder="Código do grupo (ex: FAC2024)"
                     value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
                     className="input-base text-center text-lg font-mono tracking-widest" />

              {joinError && (
                <div className="text-sm text-rose-400 text-center py-2 px-3 rounded-xl"
                     style={{ background: "rgba(244,63,94,.1)", border: "1px solid rgba(244,63,94,.3)" }}>
                  {joinError}
                </div>
              )}
              {joinSuccess && (
                <div className="text-sm text-emerald-400 text-center py-2 px-3 rounded-xl"
                     style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.3)" }}>
                  ✅ {joinSuccess}
                </div>
              )}

              <button type="submit" disabled={joiningLoading || !joinCode} className="btn-emerald w-full">
                {joiningLoading ? "Verificando..." : "Entrar no Grupo"}
              </button>
              <button type="button" onClick={() => setShowJoinModal(false)} className="btn-ghost w-full">
                Cancelar
              </button>
            </form>

            <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(15,23,42,.6)" }}>
              <p className="text-xs text-slate-500 mb-1.5 font-semibold">Códigos disponíveis (demo):</p>
              {["FAC2024", "FAMILIA01", "DEVNEX42"].map(c => (
                <button key={c} onClick={() => setJoinCode(c)}
                        className="text-xs font-mono mr-2 px-2 py-1 rounded-lg cursor-pointer transition-all"
                        style={{ color: "#a78bfa", background: "rgba(139,92,246,.1)" }}
                        onMouseEnter={e => e.target.style.background = "rgba(139,92,246,.2)"}
                        onMouseLeave={e => e.target.style.background = "rgba(139,92,246,.1)"}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
