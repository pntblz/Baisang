"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Plus, LogIn } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [pin, setPin] = useState("");

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
          <p className="text-muted-foreground text-sm mt-1">หารเงินง่ายๆ จบในพริบตา</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full shadow-sm text-xs font-semibold gap-2 border-[#00B900] text-[#00B900] hover:bg-[#00B900]/10">
          <MessageCircle className="w-4 h-4" />
          เข้าสู่ระบบ
        </Button>
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
      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>ล็อกอินด้วย LINE เพื่อดูประวัติการหารเงิน</p>
      </div>
    </div>
  );
}
