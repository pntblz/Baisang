"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Plus, LogIn } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [session, setSession] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistory = async (userId: string) => {
      const { data } = await supabase.from('parties').select('pin, data, created_at').eq('host_id', userId).order('created_at', { ascending: false });
      if (data) setHistory(data);
    };

    // Debug URL hash for errors
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash && hash.includes('error=')) {
        alert("🚨 ระบบตรวจพบ Error: " + decodeURIComponent(hash));
      }
    }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) alert("🚨 GetSession Error: " + error.message);
      setSession(session);
      if (session?.user?.id) fetchHistory(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.id) {
        fetchHistory(session.user.id);
      } else {
        setHistory([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'custom:line' as any,
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim()) {
      router.push(`/party/${pin.toUpperCase()}`);
    }
  };

  const generatePin = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreate = () => {
    const newPin = generatePin();
    router.push(`/party/${newPin}?mode=create`);
  };

  return (
    <div className="flex flex-col min-h-screen p-6 relative">
      {/* Header */}
      <header className="flex justify-between items-center py-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">ใบสั่ง (Baisang)</h1>
          <p className="text-muted-foreground text-sm mt-1">ใครยังไม่จ่าย กรุณาชำระด่วน!</p>
        </div>
        {session ? (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{session.user.user_metadata.full_name}</p>
            </div>
            {session.user.user_metadata.avatar_url ? (
              <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-9 h-9 rounded-full border-2 border-white shadow-sm" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {session.user.user_metadata.full_name?.charAt(0) || "U"}
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-xs text-muted-foreground ml-1">
              ออก
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin} variant="outline" size="sm" className="rounded-full shadow-sm text-xs font-semibold gap-2 border-[#00B900] text-[#00B900] hover:bg-[#00B900]/10">
            <MessageCircle className="w-4 h-4" />
            เข้าสู่ระบบ
          </Button>
        )}
      </header>

      {/* Main Actions */}
      <main className="flex-1 flex flex-col gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-white to-slate-50">
          <CardHeader>
            <CardTitle className="text-xl">เข้าร่วมปาร์ตี้</CardTitle>
            <CardDescription>ใส่รหัส PIN 6 หลักเพื่อเข้าร่วมบิล</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="flex gap-3">
              <Input
                placeholder="เช่น A1B2C3"
                value={pin}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                maxLength={6}
                className="text-center font-mono text-lg tracking-widest uppercase"
              />
              <Button type="submit" disabled={pin.length < 6} className="px-8 font-bold">
                <LogIn className="w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-medium">หรือ</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <Button onClick={handleCreate} size="lg" className="w-full gap-2 text-lg shadow-md">
          <Plus className="w-6 h-6" />
          สร้างปาร์ตี้หารเงินใหม่
        </Button>
      </main>

      {/* Footer / Recent Parties Placeholder */}
      <div className="mt-12 w-full max-w-md mx-auto pb-8">
        {session ? (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              ประวัติปาร์ตี้ของคุณ
            </h3>
            {history.length > 0 ? (
              <div className="grid gap-2">
                {history.map(party => (
                  <Button 
                    key={party.pin} 
                    variant="outline" 
                    className="w-full justify-between h-auto py-3 px-4 shadow-sm hover:border-primary/50 bg-white"
                    onClick={() => router.push(`/party/${party.pin}`)}
                  >
                    <div className="flex flex-col items-start min-w-0">
                      <span className="font-bold text-base truncate w-full text-left">{party.data?.partyName || "ปาร์ตี้ไม่ได้ตั้งชื่อ"}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{new Date(party.created_at).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <span className="font-mono font-bold text-primary tracking-wider">{party.pin}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 uppercase">รหัสห้อง</span>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground bg-white/50 rounded-xl border border-dashed shadow-sm">
                ยังไม่มีประวัติการสร้างปาร์ตี้
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>ล็อกอินด้วย LINE เพื่อดูประวัติการหารเงินของคุณ</p>
          </div>
        )}
      </div>
    </div>
  );
}
