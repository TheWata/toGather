import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import api from "../api";

// ============================================================
// Sub-components
// ============================================================

function XPTopBar({ group, onBack }) {
  const xpPct = group ? Math.round((group.xp / group.xpToNext) * 100) : 0;
  return (
    <div className="glass-dark sticky top-0 z-50" style={{ borderBottom: "1px solid rgba(100,116,139,.15)" }}>
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-ghost flex items-center gap-2 text-sm"
                  style={{ padding: "0.4rem 0.875rem" }}>
            ← Círculos
          </button>

          {group && (
            <div className="flex-1 flex items-center gap-4 min-w-0">
              <span className="text-2xl flex-shrink-0">{group.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-white text-sm truncate">{group.name}</span>
                  <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                    <span className="text-xs font-bold" style={{ color: "#a78bfa" }}>
                      Nv.{group.level} — {group.xp}/{group.xpToNext} XP
                    </span>
                    <span className="text-sm flex items-center gap-1" style={{ color: "#fbbf24" }}>
                      🔥 <span className="text-xs font-bold">{group.streak}d</span>
                    </span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(100,116,139,.2)" }}>
                  <div className="h-full rounded-full xp-bar-fill transition-all duration-1000"
                       style={{ width: `${xpPct}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SpotlightSection({ spotlight, currentUserId, groupId, onPostSuccess }) {
  const { user } = useAuth();
  const [nudging, setNudging] = useState(false);
  const [nudgeMsg, setNudgeMsg] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadUrl, setUploadUrl] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [nudgeCount, setNudgeCount] = useState(spotlight?.nudgesCount || 0);

  const handleNudge = async () => {
    setNudging(true);
    try {
      const r = await api.post(`/groups/${groupId}/nudge`);
      setNudgeMsg(`👉 Você cutucou ${spotlight.user.username}! (${r.data.nudgesCount} cutucadas hoje)`);
      setNudgeCount(r.data.nudgesCount);
    } catch (err) {
      setNudgeMsg(err.response?.data?.message || "Erro.");
    } finally {
      setNudging(false);
      setTimeout(() => setNudgeMsg(""), 3000);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadUrl) return;
    setUploadLoading(true);
    try {
      await api.post(`/groups/${groupId}/posts`, {
        type: "spotlight", url: uploadUrl, caption: uploadCaption,
      });
      setShowUploadModal(false);
      setUploadUrl(""); setUploadCaption("");
      onPostSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || "Erro ao publicar.");
    } finally {
      setUploadLoading(false);
    }
  };

  if (!spotlight) return null;
  const { user: slUser, post: slPost, postedToday, isCurrentUserSpotlight } = spotlight;

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🎬</span>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Spotlight do Dia</h3>
        <div className="flex-1 h-px" style={{ background: "rgba(100,116,139,.2)" }} />
      </div>

      <div className="glass rounded-2xl overflow-hidden gradient-border">
        {postedToday && slPost ? (
          // Video posted
          <div>
            <div className="relative" style={{ aspectRatio: "16/9", background: "#000" }}>
              <video src={slPost.url} controls className="w-full h-full object-cover"
                     poster="https://picsum.photos/seed/spotlight/800/450" />
              <div className="absolute top-3 left-3 flex items-center gap-2 glass rounded-xl px-3 py-1.5">
                <img src={slPost.author?.avatar} alt="" className="w-6 h-6 rounded-lg" />
                <span className="text-xs font-semibold text-white">{slPost.author?.username}</span>
                <span className="text-xs text-slate-400">• Spotlight de hoje</span>
              </div>
            </div>
            {slPost.caption && (
              <div className="px-4 py-3">
                <p className="text-slate-300 text-sm">{slPost.caption}</p>
              </div>
            )}
          </div>
        ) : (
          // Waiting for spotlight
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img src={slUser?.avatar} alt={slUser?.username}
                     className="w-20 h-20 rounded-2xl animate-pulse-ring" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl flex items-center justify-center text-lg"
                     style={{ background: "#fbbf24" }}>⏳</div>
              </div>
            </div>
            <p className="text-slate-300 font-semibold mb-1">
              {isCurrentUserSpotlight ? "Você é o destaque de hoje!" : `Aguardando o vídeo de ${slUser?.username}`}
            </p>
            <p className="text-slate-500 text-xs mb-5">
              {nudgeCount > 0 ? `${nudgeCount} cutucada${nudgeCount > 1 ? "s" : ""} enviadas` : "Nenhuma cutucada ainda"}
            </p>

            {isCurrentUserSpotlight ? (
              <button onClick={() => setShowUploadModal(true)} className="btn-primary animate-pulse-ring"
                      style={{ padding: "0.75rem 2rem" }}>
                🎬 Gravar Spotlight do Dia
              </button>
            ) : (
              <div className="space-y-3">
                <button onClick={handleNudge} disabled={nudging}
                        className="btn-primary flex items-center gap-2 mx-auto animate-nudge"
                        style={{ padding: "0.75rem 2rem" }}>
                  <span>👉</span> {nudging ? "Cutucando..." : `Cutucar ${slUser?.username}`}
                </button>
                {nudgeMsg && (
                  <p className="text-sm animate-fade-in" style={{ color: "#a78bfa" }}>{nudgeMsg}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: "rgba(2,6,23,.85)", backdropFilter: "blur(8px)" }}
             onClick={e => e.target === e.currentTarget && setShowUploadModal(false)}>
          <div className="glass rounded-2xl p-8 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-1">🎬 Spotlight do Dia</h3>
            <p className="text-slate-400 text-sm mb-6">Compartilhe seu momento em destaque com o grupo!</p>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">URL do Vídeo</label>
                <input type="url" placeholder="https://..." value={uploadUrl} onChange={e => setUploadUrl(e.target.value)}
                       required className="input-base" />
                <p className="text-xs text-slate-600 mt-1">Cole a URL de um vídeo MP4 ou link público.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Legenda (opcional)</label>
                <textarea placeholder="Conte como foi o seu dia..." value={uploadCaption}
                          onChange={e => setUploadCaption(e.target.value)}
                          className="input-base" rows={3} style={{ resize: "none" }} />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(139,92,246,.1)", border: "1px solid rgba(139,92,246,.2)" }}>
                <span>💡</span>
                <p className="text-xs text-slate-400">Demo: use <code className="text-violet-400">https://www.w3schools.com/html/mov_bbb.mp4</code></p>
              </div>
              <button type="submit" disabled={uploadLoading} className="btn-primary w-full">
                {uploadLoading ? "Publicando..." : "Publicar Spotlight 🎉"}
              </button>
              <button type="button" onClick={() => setShowUploadModal(false)} className="btn-ghost w-full">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function PhotosSection({ photos, currentUserId, groupId, onPostSuccess }) {
  const [showUpload, setShowUpload] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editCaption, setEditCaption] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    try {
      await api.post(`/groups/${groupId}/posts`, { type: "photo", url, caption });
      setShowUpload(false); setUrl(""); setCaption("");
      onPostSuccess?.();
    } catch (err) {
      alert(err.response?.data?.message || "Erro.");
    } finally { setLoading(false); }
  };

  const handleDelete = async (postId) => {
    if (!confirm("Excluir este post?")) return;
    try {
      await api.delete(`/posts/${postId}`);
      onPostSuccess?.();
    } catch (err) { alert(err.response?.data?.message || "Erro."); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await api.put(`/posts/${editingPost.id}`, { caption: editCaption });
      setEditingPost(null);
      onPostSuccess?.();
    } catch (err) { alert(err.response?.data?.message || "Erro."); }
    finally { setEditLoading(false); }
  };

  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">📸</span>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Fotos do Dia</h3>
        <div className="flex-1 h-px" style={{ background: "rgba(100,116,139,.2)" }} />
        <button onClick={() => setShowUpload(true)} className="btn-emerald text-xs flex items-center gap-1"
                style={{ padding: "0.4rem 0.875rem" }}>
          + Enviar Foto
        </button>
      </div>

      {photos.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="text-4xl mb-2 animate-float">📷</div>
          <p className="text-slate-400 text-sm">Nenhuma foto do dia ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((p, i) => (
            <div key={p.id} className="glass rounded-xl overflow-hidden card-hover animate-slide-up group"
                 style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="relative" style={{ aspectRatio: "1/1" }}>
                <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                     style={{ background: "linear-gradient(to top, rgba(2,6,23,.9) 0%, transparent 60%)" }}>
                  {p.authorId === currentUserId && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingPost(p); setEditCaption(p.caption); }}
                              className="text-xs px-2 py-1 rounded-lg cursor-pointer"
                              style={{ background: "rgba(139,92,246,.4)", color: "#a78bfa" }}>
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(p.id)}
                              className="text-xs px-2 py-1 rounded-lg cursor-pointer"
                              style={{ background: "rgba(244,63,94,.3)", color: "#fb7185" }}>
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <img src={p.author?.avatar} alt="" className="w-5 h-5 rounded-md" />
                  <span className="text-xs font-semibold text-slate-300 truncate">{p.author?.username}</span>
                </div>
                {p.caption && <p className="text-slate-500 text-xs truncate">{p.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: "rgba(2,6,23,.85)", backdropFilter: "blur(8px)" }}
             onClick={e => e.target === e.currentTarget && setShowUpload(false)}>
          <div className="glass rounded-2xl p-8 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-1">📸 Foto do Dia</h3>
            <form onSubmit={handleSubmit} className="space-y-4 mt-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">URL da Foto</label>
                <input type="url" placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} required className="input-base" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Legenda</label>
                <input type="text" placeholder="Conta algo sobre esse momento..." value={caption} onChange={e => setCaption(e.target.value)} className="input-base" />
              </div>
              <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(16,185,129,.08)", border: "1px solid rgba(16,185,129,.2)" }}>
                <p className="text-xs text-slate-400">💡 Demo: use URLs do <code className="text-emerald-400">picsum.photos</code> ou qualquer imagem pública.</p>
              </div>
              <button type="submit" disabled={loading} className="btn-emerald w-full">
                {loading ? "Publicando..." : "Publicar Foto 📸"}
              </button>
              <button type="button" onClick={() => setShowUpload(false)} className="btn-ghost w-full">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
             style={{ background: "rgba(2,6,23,.85)", backdropFilter: "blur(8px)" }}
             onClick={e => e.target === e.currentTarget && setEditingPost(null)}>
          <div className="glass rounded-2xl p-8 w-full max-w-md animate-slide-up">
            <h3 className="text-xl font-bold text-white mb-4">✏️ Editar Legenda</h3>
            <form onSubmit={handleEdit} className="space-y-4">
              <input type="text" value={editCaption} onChange={e => setEditCaption(e.target.value)}
                     className="input-base" placeholder="Nova legenda..." />
              <button type="submit" disabled={editLoading} className="btn-primary w-full">
                {editLoading ? "Salvando..." : "Salvar"}
              </button>
              <button type="button" onClick={() => setEditingPost(null)} className="btn-ghost w-full">Cancelar</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

function ChatSection({ chat, groupId, currentUserId, onNewMessage }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const r = await api.post(`/groups/${groupId}/chat`, { text });
      onNewMessage?.(r.data.chatMessage);
      setText("");
    } catch (err) {
      alert(err.response?.data?.message || "Erro.");
    } finally { setSending(false); }
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <section id="chat-area" className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">💬</span>
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Bate-papo do Grupo</h3>
        <div className="flex-1 h-px" style={{ background: "rgba(100,116,139,.2)" }} />
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {/* Messages */}
        <div className="overflow-y-auto p-4 space-y-3" style={{ height: "380px" }}>
          {chat.length === 0 && (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-500 text-sm">Nenhuma mensagem ainda. Diga oi! 👋</p>
            </div>
          )}
          {chat.map((m, i) => {
            const isOwn = m.authorId === currentUserId;
            return (
              <div key={m.id} className={`flex gap-2.5 animate-fade-in ${isOwn ? "flex-row-reverse" : ""}`}
                   style={{ animationDelay: `${i * 0.02}s` }}>
                {!isOwn && (
                  <img src={m.author?.avatar} alt="" className="w-8 h-8 rounded-xl flex-shrink-0 mt-0.5" />
                )}
                <div className={`max-w-xs ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
                  {!isOwn && (
                    <span className="text-xs font-semibold mb-1" style={{ color: "#a78bfa" }}>
                      {m.author?.username}
                    </span>
                  )}
                  <div className={`px-3.5 py-2.5 ${isOwn ? "bubble-own" : "bubble-other"}`}>
                    <p className="text-sm text-slate-200 leading-relaxed">{m.text}</p>
                  </div>
                  <span className="text-xs text-slate-600 mt-1">{formatTime(m.createdAt)}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(100,116,139,.15)" }}>
          <form onSubmit={handleSend} className="flex gap-2">
            <input type="text" placeholder="Digite uma mensagem..." value={text}
                   onChange={e => setText(e.target.value)}
                   className="input-base flex-1" style={{ padding: "0.625rem 1rem" }} />
            <button type="submit" disabled={sending || !text.trim()} className="btn-primary flex-shrink-0"
                    style={{ padding: "0.625rem 1.25rem" }}>
              {sending ? "⏳" : "→"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// Main HQ Page
// ============================================================
export default function HQPage({ groupId, onBack }) {
  const { user } = useAuth();
  const [hq, setHq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const chatRef = useRef(null);
  const [showScrollUp, setShowScrollUp] = useState(false);

  const fetchHQ = useCallback(async () => {
    try {
      const r = await api.get(`/groups/${groupId}/hq`);
      setHq(r.data);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao carregar HQ.");
    } finally { setLoading(false); }
  }, [groupId]);

  useEffect(() => { fetchHQ(); }, [fetchHQ]);

  // Scroll detection for chat focus
  useEffect(() => {
    const handleScroll = () => {
      const chatEl = document.getElementById("chat-area");
      if (chatEl) {
        const rect = chatEl.getBoundingClientRect();
        setShowScrollUp(rect.top < 200);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const scrollToChat = () => {
    const el = document.getElementById("chat-area");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNewMessage = (msg) => {
    setHq(prev => prev ? { ...prev, chat: [...prev.chat, msg] } : prev);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "linear-gradient(135deg, #020617, #0f172a)" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Carregando HQ...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "linear-gradient(135deg, #020617, #0f172a)" }}>
        <div className="text-center glass rounded-2xl p-8 max-w-sm">
          <div className="text-4xl mb-3">⚠️</div>
          <p className="text-rose-400 mb-4">{error}</p>
          <button onClick={onBack} className="btn-ghost">← Voltar</button>
        </div>
      </div>
    );
  }

  const { group, spotlight, photos, chat, currentUserId } = hq;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #020617 0%, #0f172a 60%, #0a1628 100%)" }}>
      <XPTopBar group={group} onBack={onBack} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Group info strip */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
              <span className="text-xs text-slate-400">Membros:</span>
              <div className="flex -space-x-1.5">
                {group.members.map(m => (
                  <img key={m.id} src={m.avatar} alt={m.username}
                       className="w-6 h-6 rounded-lg border"
                       style={{ borderColor: "#0f172a" }} title={m.username} />
                ))}
              </div>
            </div>
            <div className="glass rounded-xl px-3 py-2">
              <span className="text-xs text-slate-400">Código: </span>
              <span className="text-xs font-mono font-bold text-violet-400">{group.code}</span>
            </div>
          </div>
          <button onClick={scrollToChat}
                  className="text-xs flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            💬 Chat <span className="text-slate-600">↓</span>
          </button>
        </div>

        <SpotlightSection spotlight={spotlight} currentUserId={currentUserId}
                          groupId={groupId} onPostSuccess={fetchHQ} />

        <PhotosSection photos={photos} currentUserId={currentUserId}
                       groupId={groupId} onPostSuccess={fetchHQ} />

        <ChatSection chat={chat} groupId={groupId} currentUserId={currentUserId}
                     onNewMessage={handleNewMessage} />
      </main>

      {/* Floating scroll-up button */}
      {showScrollUp && (
        <button onClick={scrollToTop}
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 animate-fade-in glow-violet"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6366f1)",
                  color: "white", fontWeight: 600, padding: "0.625rem 1rem",
                  borderRadius: "999px", border: "none", cursor: "pointer",
                  boxShadow: "0 8px 24px rgba(124,58,237,.5)"
                }}>
          ⬆️ <span className="text-xs">Spotlight & Galeria</span>
        </button>
      )}
    </div>
  );
}
