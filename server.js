// toGather — Back-end (Node.js + Express) — Atividade Pratica REST API
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3001;

// === BANCO DE DADOS EM MEMORIA ===
const db = {
  users: [
    { id: "u1", username: "Alex",   email: "alex@nexus.io",   password: "$2b$10$lMlFTzWJIQsBpvdVlNUpqOFtQ84c7ZDmGbnCTWeqfBfFZi/FOPLTm", avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Alex&backgroundColor=8b5cf6",  createdAt: new Date("2024-01-15").toISOString() },
    { id: "u2", username: "Bruna",  email: "bruna@nexus.io",  password: "$2b$10$lMlFTzWJIQsBpvdVlNUpqOFtQ84c7ZDmGbnCTWeqfBfFZi/FOPLTm", avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Bruna&backgroundColor=10b981", createdAt: new Date("2024-01-16").toISOString() },
    { id: "u3", username: "Carlos", email: "carlos@nexus.io", password: "$2b$10$lMlFTzWJIQsBpvdVlNUpqOFtQ84c7ZDmGbnCTWeqfBfFZi/FOPLTm", avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Carlos&backgroundColor=6366f1", createdAt: new Date("2024-01-17").toISOString() },
    { id: "u4", username: "Diana",  email: "diana@nexus.io",  password: "$2b$10$lMlFTzWJIQsBpvdVlNUpqOFtQ84c7ZDmGbnCTWeqfBfFZi/FOPLTm", avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=Diana&backgroundColor=ec4899",  createdAt: new Date("2024-01-18").toISOString() },
  ],
  groups: [
    { id: "g1", name: "Amigos da Faculdade", code: "FAC2024",   emoji: "🎓", description: "Nosso grupo do curso de ADS!", members: ["u1","u2","u3"], adminId: "u1", level: 5, xp: 750, xpToNext: 1000, streak: 14, spotlightQueue: ["u2","u3","u1"], spotlightIndex: 0, spotlightPostedToday: false, createdAt: new Date("2024-02-01").toISOString() },
    { id: "g2", name: "Familia",              code: "FAMILIA01", emoji: "🏠", description: "Nossa familia conectada!",     members: ["u1","u4"],        adminId: "u4", level: 3, xp: 420, xpToNext: 600,  streak: 7,  spotlightQueue: ["u4","u1"],     spotlightIndex: 0, spotlightPostedToday: true,  createdAt: new Date("2024-02-10").toISOString() },
    { id: "g3", name: "Devs Nexus",           code: "DEVNEX42",  emoji: "💻", description: "A guilda dos devs Nexus.",     members: ["u2","u3","u4"], adminId: "u2", level: 8, xp: 920, xpToNext: 1200, streak: 21, spotlightQueue: ["u3","u4","u2"], spotlightIndex: 1, spotlightPostedToday: true,  createdAt: new Date("2024-01-20").toISOString() },
  ],
  posts: [
    { id: "p1", groupId: "g1", authorId: "u2", type: "photo",    url: "https://picsum.photos/seed/bruna1/400/400",        caption: "Estudando pra prova de amanha 📚",     likes: 3,  createdAt: new Date().toISOString() },
    { id: "p2", groupId: "g1", authorId: "u3", type: "photo",    url: "https://picsum.photos/seed/carlos1/400/400",       caption: "Cafe e codigo, combinacao perfeita ☕", likes: 5,  createdAt: new Date().toISOString() },
    { id: "p3", groupId: "g2", authorId: "u4", type: "spotlight", url: "https://www.w3schools.com/html/mov_bbb.mp4",       caption: "Bom dia familia! 🌅",                  likes: 8,  createdAt: new Date().toISOString() },
    { id: "p4", groupId: "g3", authorId: "u3", type: "photo",    url: "https://picsum.photos/seed/carlos2/400/400",       caption: "Deploy feito com sucesso! 🚀",          likes: 12, createdAt: new Date().toISOString() },
    { id: "p5", groupId: "g3", authorId: "u4", type: "spotlight", url: "https://www.w3schools.com/html/mov_bbb.mp4",       caption: "Showcase da nova feature do Nexus!",   likes: 20, createdAt: new Date().toISOString() },
  ],
  messages: [
    { id: "m1", groupId: "g1", authorId: "u2", text: "Oi gente! Prontos pra prova? 😅", createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
    { id: "m2", groupId: "g1", authorId: "u3", text: "Nem! Estudando ainda 😭",           createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
    { id: "m3", groupId: "g1", authorId: "u1", text: "Enviei meu spotlight hoje! 🎬",     createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: "m4", groupId: "g2", authorId: "u4", text: "Bom dia familia! ❤️",               createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: "m5", groupId: "g3", authorId: "u2", text: "Testaram a nova API do Nexus?",    createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: "m6", groupId: "g3", authorId: "u3", text: "Sim! Latencia zero 🔥",             createdAt: new Date(Date.now() - 900000).toISOString() },
  ],
  nudges: [],
};

// Helpers
const getUserById = (id) => db.users.find((u) => u.id === id);
const getGroupById = (id) => db.groups.find((g) => g.id === id);
const getPostById = (id) => db.posts.find((p) => p.id === id);
const safeUser = (u) => ({ id: u.id, username: u.username, email: u.email, avatar: u.avatar, createdAt: u.createdAt });
const enrichPost = (post) => { const a = getUserById(post.authorId); return { ...post, author: a ? safeUser(a) : null }; };
const getSpotlightMember = (g) => getUserById(g.spotlightQueue[g.spotlightIndex % g.spotlightQueue.length]);

// === MIDDLEWARES ===
app.use(cors({ origin: "http://localhost:5173", credentials: true, methods: ["GET","POST","PUT","DELETE"], allowedHeaders: ["Content-Type"] }));
app.use(express.json());
app.use(session({
  secret: "toGather_nexus_secret_2024_v1",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: false, maxAge: 86400000, sameSite: "lax" },
}));

const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) return res.status(401).json({ error: "Unauthorized", message: "Autenticacao necessaria." });
  next();
};

const requireGroupMember = (req, res, next) => {
  const group = getGroupById(req.params.groupId);
  if (!group) return res.status(404).json({ error: "Not Found", message: "Grupo nao encontrado." });
  if (!group.members.includes(req.session.userId)) return res.status(403).json({ error: "Forbidden", message: "Voce nao e membro deste grupo." });
  req.group = group;
  next();
};

// === AUTH ROUTES ===

// POST /api/auth/register [201 / 400]
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: "Bad Request", message: "username, email e password sao obrigatorios." });
  if (password.length < 6) return res.status(400).json({ error: "Bad Request", message: "Senha deve ter no minimo 6 caracteres." });
  if (db.users.find((u) => u.email === email.toLowerCase())) return res.status(400).json({ error: "Bad Request", message: "E-mail ja cadastrado." });
  if (db.users.find((u) => u.username.toLowerCase() === username.toLowerCase())) return res.status(400).json({ error: "Bad Request", message: "Username ja em uso." });

  const hashed = await bcrypt.hash(password, 10);
  const newUser = { id: uuidv4(), username: username.trim(), email: email.toLowerCase().trim(), password: hashed, avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(username)}&backgroundColor=8b5cf6`, createdAt: new Date().toISOString() };
  db.users.push(newUser);
  req.session.userId = newUser.id;
  return res.status(201).json({ message: "Conta criada com sucesso!", user: safeUser(newUser) });
});

// POST /api/auth/login [200 / 400 / 401]
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Bad Request", message: "E-mail e senha sao obrigatorios." });
  const user = db.users.find((u) => u.email === email.toLowerCase().trim());
  if (!user) return res.status(401).json({ error: "Unauthorized", message: "Credenciais invalidas." });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Unauthorized", message: "Credenciais invalidas." });
  req.session.userId = user.id;
  return res.status(200).json({ message: "Login realizado com sucesso!", user: safeUser(user) });
});

// POST /api/auth/logout [200 / 401]
app.post("/api/auth/logout", requireAuth, (req, res) => {
  req.session.destroy(() => {});
  res.clearCookie("connect.sid");
  return res.status(200).json({ message: "Sessao encerrada." });
});

// GET /api/auth/me [200 / 401]
app.get("/api/auth/me", requireAuth, (req, res) => {
  const user = getUserById(req.session.userId);
  if (!user) { req.session.destroy(() => {}); return res.status(401).json({ error: "Unauthorized", message: "Sessao invalida." }); }
  return res.status(200).json({ user: safeUser(user) });
});

// === GROUP ROUTES ===

// GET /api/groups [200 / 401]
app.get("/api/groups", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const groups = db.groups.filter((g) => g.members.includes(userId)).map((g) => {
    const today = new Date().toDateString();
    return {
      id: g.id, name: g.name, emoji: g.emoji, description: g.description,
      level: g.level, xp: g.xp, xpToNext: g.xpToNext, streak: g.streak, adminId: g.adminId,
      members: g.members.map((id) => { const u = getUserById(id); return u ? safeUser(u) : null; }).filter(Boolean),
      spotlightPostedToday: g.spotlightPostedToday,
      spotlightUser: safeUser(getSpotlightMember(g)),
      postsToday: db.posts.filter((p) => p.groupId === g.id && new Date(p.createdAt).toDateString() === today).length,
    };
  });
  return res.status(200).json({ groups });
});

// POST /api/groups/join [200 / 400 / 401 / 404]
app.post("/api/groups/join", requireAuth, (req, res) => {
  const { code } = req.body;
  const userId = req.session.userId;
  if (!code) return res.status(400).json({ error: "Bad Request", message: "Codigo do grupo e obrigatorio." });
  const group = db.groups.find((g) => g.code === code.trim().toUpperCase());
  if (!group) return res.status(404).json({ error: "Not Found", message: "Grupo nao encontrado com este codigo." });
  if (group.members.includes(userId)) return res.status(400).json({ error: "Bad Request", message: "Voce ja e membro deste grupo." });
  group.members.push(userId);
  if (!group.spotlightQueue.includes(userId)) group.spotlightQueue.push(userId);
  return res.status(200).json({ message: `Voce entrou no grupo "${group.name}"!`, group: { id: group.id, name: group.name, emoji: group.emoji } });
});

// GET /api/groups/:groupId/hq [200 / 401 / 404]
app.get("/api/groups/:groupId/hq", requireAuth, requireGroupMember, (req, res) => {
  const g = req.group;
  const userId = req.session.userId;
  const today = new Date().toDateString();
  const spotlightUser = getSpotlightMember(g);
  const spotlightPost = db.posts.find((p) => p.groupId === g.id && p.type === "spotlight" && new Date(p.createdAt).toDateString() === today);
  const todayPhotos = db.posts.filter((p) => p.groupId === g.id && p.type === "photo" && new Date(p.createdAt).toDateString() === today).map(enrichPost);
  const messages = db.messages.filter((m) => m.groupId === g.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(-50).map((m) => { const a = getUserById(m.authorId); return { ...m, author: a ? safeUser(a) : null }; });
  const nudgesCount = db.nudges.filter((n) => n.groupId === g.id && n.toUserId === spotlightUser?.id && new Date(n.timestamp).toDateString() === today).length;

  return res.status(200).json({
    group: { id: g.id, name: g.name, emoji: g.emoji, description: g.description, code: g.code, level: g.level, xp: g.xp, xpToNext: g.xpToNext, streak: g.streak, adminId: g.adminId, members: g.members.map((id) => { const u = getUserById(id); return u ? safeUser(u) : null; }).filter(Boolean) },
    spotlight: { user: spotlightUser ? safeUser(spotlightUser) : null, post: spotlightPost ? enrichPost(spotlightPost) : null, postedToday: g.spotlightPostedToday, isCurrentUserSpotlight: spotlightUser?.id === userId, nudgesCount },
    photos: todayPhotos,
    chat: messages,
    currentUserId: userId,
  });
});

// === CRUD DE POSTS ===

// GET /api/groups/:groupId/posts [200 / 401 / 403 / 404]
app.get("/api/groups/:groupId/posts", requireAuth, requireGroupMember, (req, res) => {
  const posts = db.posts
    .filter((p) => p.groupId === req.group.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map(enrichPost);
  return res.status(200).json({ posts, total: posts.length });
});

// GET /api/posts/:id [200 / 401 / 404]
app.get("/api/posts/:id", requireAuth, (req, res) => {
  const post = getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: "Not Found", message: "Post nao encontrado." });
  return res.status(200).json({ post: enrichPost(post) });
});

// POST /api/groups/:groupId/posts [201 / 400 / 401]
app.post("/api/groups/:groupId/posts", requireAuth, requireGroupMember, (req, res) => {
  const { type, url, caption } = req.body;
  const userId = req.session.userId;
  const group = req.group;
  if (!type || !url) return res.status(400).json({ error: "Bad Request", message: "Campos 'type' e 'url' sao obrigatorios." });
  if (!["photo", "spotlight"].includes(type)) return res.status(400).json({ error: "Bad Request", message: "'type' deve ser 'photo' ou 'spotlight'." });

  if (type === "spotlight") {
    const sl = getSpotlightMember(group);
    if (!sl || sl.id !== userId) return res.status(403).json({ error: "Forbidden", message: "Apenas o sorteado pode enviar o Spotlight hoje." });
    const today = new Date().toDateString();
    if (db.posts.find((p) => p.groupId === group.id && p.type === "spotlight" && new Date(p.createdAt).toDateString() === today)) return res.status(400).json({ error: "Bad Request", message: "Spotlight de hoje ja publicado." });
  }

  const newPost = { id: uuidv4(), groupId: group.id, authorId: userId, type, url, caption: caption || "", likes: 0, createdAt: new Date().toISOString() };
  db.posts.push(newPost);

  if (type === "spotlight") {
    group.spotlightPostedToday = true;
    group.xp += 50;
    if (group.xp >= group.xpToNext) { group.level += 1; group.xp -= group.xpToNext; group.xpToNext = Math.floor(group.xpToNext * 1.5); }
    group.streak += 1;
  } else {
    group.xp = Math.min(group.xp + 10, group.xpToNext - 1);
  }

  return res.status(201).json({ message: type === "spotlight" ? "Spotlight publicado! +50 XP! 🎉" : "Foto do dia publicada! +10 XP! 📸", post: enrichPost(newPost) });
});

// PUT /api/posts/:id [200 / 400 / 401 / 403 / 404]
app.put("/api/posts/:id", requireAuth, (req, res) => {
  const { caption } = req.body;
  const userId = req.session.userId;
  if (caption === undefined || caption === null) return res.status(400).json({ error: "Bad Request", message: "Campo 'caption' e obrigatorio." });
  const post = getPostById(req.params.id);
  if (!post) return res.status(404).json({ error: "Not Found", message: "Post nao encontrado." });
  if (post.authorId !== userId) return res.status(403).json({ error: "Forbidden", message: "Sem permissao para editar este post." });
  post.caption = caption.trim();
  return res.status(200).json({ message: "Legenda atualizada.", post: enrichPost(post) });
});

// DELETE /api/posts/:id [200 / 401 / 403 / 404]
app.delete("/api/posts/:id", requireAuth, (req, res) => {
  const userId = req.session.userId;
  const idx = db.posts.findIndex((p) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not Found", message: "Post nao encontrado." });
  const post = db.posts[idx];
  if (post.authorId !== userId) return res.status(403).json({ error: "Forbidden", message: "Sem permissao para excluir este post." });
  if (post.type === "spotlight") { const g = getGroupById(post.groupId); if (g) { g.spotlightPostedToday = false; g.streak = Math.max(0, g.streak - 1); } }
  db.posts.splice(idx, 1);
  return res.status(200).json({ message: "Post excluido com sucesso." });
});

// === NUDGE ===

// POST /api/groups/:groupId/nudge [200 / 400 / 401 / 404]
app.post("/api/groups/:groupId/nudge", requireAuth, requireGroupMember, (req, res) => {
  const userId = req.session.userId;
  const group = req.group;
  const sl = getSpotlightMember(group);
  if (!sl) return res.status(404).json({ error: "Not Found", message: "Nao ha membro sorteado para hoje." });
  if (sl.id === userId) return res.status(400).json({ error: "Bad Request", message: "Voce nao pode se cutucar." });
  if (group.spotlightPostedToday) return res.status(400).json({ error: "Bad Request", message: "Spotlight ja postado! Nao precisa cutucar." });
  const today = new Date().toDateString();
  if (db.nudges.find((n) => n.groupId === group.id && n.fromUserId === userId && n.toUserId === sl.id && new Date(n.timestamp).toDateString() === today)) return res.status(400).json({ error: "Bad Request", message: `Voce ja cutucou ${sl.username} hoje.` });
  db.nudges.push({ id: uuidv4(), groupId: group.id, fromUserId: userId, toUserId: sl.id, timestamp: new Date().toISOString() });
  const nudgesCount = db.nudges.filter((n) => n.groupId === group.id && n.toUserId === sl.id && new Date(n.timestamp).toDateString() === today).length;
  return res.status(200).json({ message: `Voce cutucou ${sl.username}! 👉`, nudgesCount, nudgedUser: safeUser(sl) });
});

// === CHAT ===

// POST /api/groups/:groupId/chat [201 / 400 / 401]
app.post("/api/groups/:groupId/chat", requireAuth, requireGroupMember, (req, res) => {
  const { text } = req.body;
  const userId = req.session.userId;
  const group = req.group;
  if (!text || !text.trim()) return res.status(400).json({ error: "Bad Request", message: "Mensagem nao pode estar vazia." });
  const msg = { id: uuidv4(), groupId: group.id, authorId: userId, text: text.trim(), createdAt: new Date().toISOString() };
  db.messages.push(msg);
  const author = getUserById(userId);
  return res.status(201).json({ message: "Mensagem enviada.", chatMessage: { ...msg, author: author ? safeUser(author) : null } });
});

// GET /api/health
app.get("/api/health", (_req, res) => res.status(200).json({ status: "ok", service: "toGather API", version: "1.0.0", timestamp: new Date().toISOString() }));

// START
app.listen(PORT, () => {
  console.log(`\n=== toGather API em http://localhost:${PORT} ===`);
  console.log("Usuarios (senha: 123456): alex@nexus.io | bruna@nexus.io | carlos@nexus.io | diana@nexus.io");
  console.log("Codigos: FAC2024 | FAMILIA01 | DEVNEX42\n");
});
