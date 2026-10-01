import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import AuthPage from "./pages/AuthPage";
import GroupsPage from "./pages/GroupsPage";
import HQPage from "./pages/HQPage";

export default function App() {
  const { user, loading } = useAuth();
  const [activeGroupId, setActiveGroupId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: "linear-gradient(135deg, #020617, #0f172a)" }}>
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
               style={{ background: "linear-gradient(135deg, #7c3aed, #6366f1)" }}>
            <span className="text-3xl">🌐</span>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Conectando ao toGather...</p>
        </div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  if (activeGroupId) {
    return (
      <HQPage
        groupId={activeGroupId}
        onBack={() => setActiveGroupId(null)}
      />
    );
  }

  return (
    <GroupsPage onEnterGroup={(id) => setActiveGroupId(id)} />
  );
}
