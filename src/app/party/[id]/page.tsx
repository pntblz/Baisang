"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Copy, Plus, Users, Receipt, CreditCard, CheckCircle2, Upload, Trash2, Check, ChevronDown, Wallet, HelpCircle, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

// Types
type BankDetails = { bankName: string; accountName: string; accountNumber: string };
type Member = { id: string; name: string; bankDetails?: BankDetails; colorClass: string };
type Item = { id: string; name: string; price: number; paidBy: string; sharedBy: string[] }; 
type PaymentStatus = { owerId: string; payeeId: string; isPaid: boolean };

const COLORS = [
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-purple-100 text-purple-700 border-purple-200",
  "bg-orange-100 text-orange-700 border-orange-200",
  "bg-pink-100 text-pink-700 border-pink-200",
  "bg-indigo-100 text-indigo-700 border-indigo-200",
  "bg-rose-100 text-rose-700 border-rose-200",
];

export default function PartyRoom() {
  const params = useParams();
  const router = useRouter();
  const pin = params.id as string;

  const [activeTab, setActiveTab] = useState<"items" | "members" | "summary">("items");
  const [partyName, setPartyName] = useState("");
  
  // State
  const [members, setMembers] = useState<Member[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [paymentStatuses, setPaymentStatuses] = useState<PaymentStatus[]>([]);

  // Supabase Realtime State
  const [isLoaded, setIsLoaded] = useState(false);
  const clientId = useMemo(() => Math.random().toString(36).substring(2, 15), []);
  const isUpdatingFromRealtime = useRef(false);
  const [hostId, setHostId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [copiedPin, setCopiedPin] = useState(false);
  const [copiedBank, setCopiedBank] = useState<string | null>(null);

  // Input states
  const [newMemberName, setNewMemberName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemPaidBy, setNewItemPaidBy] = useState("");

  // Start Tour
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      nextBtnText: 'ต่อไป',
      prevBtnText: 'ย้อนกลับ',
      doneBtnText: 'เข้าใจแล้ว',
      steps: [
        { element: '#tour-room-pin', popover: { title: 'รหัสห้อง', description: 'ชวนเพื่อนเข้ามาหารบิลด้วยการแชร์รหัสนี้ให้เพื่อน', side: "bottom", align: 'start' } },
        { element: '#tour-tabs', popover: { title: 'เมนูหลัก', description: 'มี 3 ส่วนคือ จัดการรายการ, จัดการสมาชิก, และดูสรุปบิล', side: "bottom", align: 'start' } },
        { 
          element: '#tab-members', 
          popover: { title: '1. จัดการสมาชิก', description: 'เริ่มจากเพิ่มชื่อเพื่อนๆ ทุกคนที่มีส่วนร่วมที่นี่', side: "bottom", align: 'center' },
          onHighlightStarted: () => setActiveTab("members")
        },
        { 
          element: '#tab-items', 
          popover: { title: '2. จัดการรายการ', description: 'เพิ่มค่าใช้จ่ายต่างๆ และเลือกว่าใครต้องหารบ้าง', side: "bottom", align: 'center' },
          onHighlightStarted: () => setActiveTab("items")
        },
        { 
          element: '#tab-summary', 
          popover: { title: '3. สรุปบิล', description: 'เมื่อครบแล้ว มาดูสรุปยอดว่าใครต้องโอนให้ใคร พร้อมแนบบัญชีรับเงินได้เลย', side: "bottom", align: 'center' },
          onHighlightStarted: () => setActiveTab("summary")
        }
      ]
    });
    driverObj.drive();
    localStorage.setItem("hasSeenTour", "true");
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem("hasSeenTour")) {
      setTimeout(startTour, 2000);
    }
  }, []);

  // 1. Initial Load & Subscribe to Supabase
  useEffect(() => {
    let channel: any;

    const setup = async () => {
      const { data, error } = await supabase.from('parties').select('data, host_id').eq('pin', pin).single();
      
      let currentHostId = data?.host_id || null;

      if (!data) {
        // If room doesn't exist, we are creating it. Get current user's ID.
        const { data: { session } } = await supabase.auth.getSession();
        currentHostId = session?.user?.id || null;
      }
      setHostId(currentHostId);

      if (data?.data) {
        isUpdatingFromRealtime.current = true;
        setPartyName(data.data.partyName || "");
        setMembers(data.data.members || []);
        setItems(data.data.items || []);
        setPaymentStatuses(data.data.paymentStatuses || []);
      }
      setIsLoaded(true);

      channel = supabase.channel(`room:${pin}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'parties', filter: `pin=eq.${pin}` },
          (payload: any) => {
            const newData = payload.new?.data;
            if (newData && newData.lastUpdatedBy !== clientId) {
              isUpdatingFromRealtime.current = true;
              setPartyName(newData.partyName || "");
              setMembers(newData.members || []);
              setItems(newData.items || []);
              setPaymentStatuses(newData.paymentStatuses || []);
            }
          }
        )
        .subscribe();
    };

    setup();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [pin, clientId]);

  // 2. Auto-save to Supabase on state changes
  useEffect(() => {
    if (!isLoaded) return;
    
    // Ignore updates that came from Supabase Realtime
    if (isUpdatingFromRealtime.current) {
      isUpdatingFromRealtime.current = false;
      return;
    }
    
    const saveToSupabase = async () => {
      setSaveStatus("saving");
      const payload: any = {
        pin,
        data: { partyName, members, items, paymentStatuses, lastUpdatedBy: clientId }
      };
      if (hostId) payload.host_id = hostId;

      await supabase.from('parties').upsert(payload, { onConflict: 'pin' });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    };

    // Debounce save to prevent spamming database
    const timer = setTimeout(saveToSupabase, 400);
    return () => clearTimeout(timer);
  }, [partyName, members, items, paymentStatuses, isLoaded, pin, clientId, hostId]);

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    const colorClass = COLORS[members.length % COLORS.length];
    const newMember = { id: Date.now().toString(), name: newMemberName, colorClass };
    setMembers([...members, newMember]);
    setNewMemberName("");
    if (!newItemPaidBy) setNewItemPaidBy(newMember.id);
  };

  const deleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
    setItems(items.map(item => ({
      ...item,
      sharedBy: item.sharedBy.filter(memberId => memberId !== id),
      paidBy: item.paidBy === id ? "" : item.paidBy
    })));
  };

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || isNaN(Number(newItemPrice)) || !newItemPaidBy) return;
    setItems([
      ...items,
      { 
        id: Date.now().toString(), 
        name: newItemName, 
        price: Number(newItemPrice), 
        paidBy: newItemPaidBy,
        sharedBy: [] // Start with empty selection
      }
    ]);
    setNewItemName("");
    setNewItemPrice("");
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const toggleShare = (itemId: string, memberId: string) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const isShared = item.sharedBy.includes(memberId);
        return {
          ...item,
          sharedBy: isShared ? item.sharedBy.filter(id => id !== memberId) : [...item.sharedBy, memberId]
        };
      }
      return item;
    }));
  };

  const toggleShareAll = (itemId: string, shareWithEveryone: boolean) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          sharedBy: shareWithEveryone ? members.map(m => m.id) : []
        };
      }
      return item;
    }));
  };

  const updateBankDetails = (memberId: string, details: BankDetails) => {
    setMembers(members.map(m => m.id === memberId ? { ...m, bankDetails: details } : m));
  };

  const togglePaymentStatus = (owerId: string, payeeId: string) => {
    setPaymentStatuses(prev => {
      const existing = prev.find(p => p.owerId === owerId && p.payeeId === payeeId);
      if (existing) {
        return prev.map(p => p.owerId === owerId && p.payeeId === payeeId ? { ...p, isPaid: !p.isPaid } : p);
      } else {
        return [...prev, { owerId, payeeId, isPaid: true }];
      }
    });
  };

  const isPaymentPaid = (owerId: string, payeeId: string) => {
    return paymentStatuses.find(p => p.owerId === owerId && p.payeeId === payeeId)?.isPaid || false;
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(true);
    setTimeout(() => setCopiedPin(false), 2000);
  };

  const handleCopyBank = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBank(id);
    setTimeout(() => setCopiedBank(null), 2000);
  };

  // Calculations
  const debts = useMemo(() => {
    const debtMap = new Map<string, Map<string, { total: number, breakdown: {name: string, amount: number}[] }>>();

    items.forEach(item => {
      if (item.sharedBy.length === 0 || !item.paidBy) return;
      const costPerPerson = item.price / item.sharedBy.length;
      
      item.sharedBy.forEach(borrowerId => {
        if (borrowerId === item.paidBy) return; 

        if (!debtMap.has(borrowerId)) debtMap.set(borrowerId, new Map());
        const payeeMap = debtMap.get(borrowerId)!;
        
        if (!payeeMap.has(item.paidBy)) payeeMap.set(item.paidBy, { total: 0, breakdown: [] });
        const currentDebt = payeeMap.get(item.paidBy)!;
        
        currentDebt.total += costPerPerson;
        currentDebt.breakdown.push({ name: item.name, amount: costPerPerson });
      });
    });

    return debtMap;
  }, [items]);

  const grandTotal = items.reduce((acc, item) => acc + item.price, 0);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="animate-pulse flex flex-col items-center">
          <Wallet className="w-12 h-12 text-primary/30 mb-4 animate-bounce" />
          <p className="text-muted-foreground font-bold">กำลังเชื่อมต่อห้อง...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      {/* Top Header */}
      <header className="bg-card px-4 md:px-6 py-4 border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 md:gap-2">
              <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9 text-muted-foreground hover:bg-muted" onClick={() => router.push('/')}>
                <Home className="w-5 h-5" />
              </Button>
              <div className="w-7 h-7 rounded-full bg-primary/10 hidden md:flex items-center justify-center shrink-0">
                <Wallet className="w-3.5 h-3.5 text-primary" />
              </div>
              <input 
                value={partyName} 
                onChange={(e) => setPartyName(e.target.value)} 
                placeholder="ตั้งชื่อปาร์ตี้ที่นี่..."
                className="bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-1 text-lg md:text-xl font-bold w-full placeholder:text-muted-foreground/60 placeholder:font-semibold truncate"
              />
            </div>
            <div className="mt-2 ml-10 flex items-center gap-2" id="tour-room-pin">
              <p className="text-xs font-semibold text-muted-foreground">รหัสห้อง:</p>
              <span className="font-mono font-bold bg-primary/10 text-primary px-3 py-1 text-sm md:text-base rounded-md tracking-wider border border-primary/20">{pin}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/20 relative" onClick={handleCopyPin}>
                {copiedPin ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copiedPin && <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-200">คัดลอกแล้ว</span>}
              </Button>
            </div>
          </div>
          <div className="text-right shrink-0 mt-1 flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1.5">
              {saveStatus === "saving" && <span className="text-[10px] text-muted-foreground animate-pulse">กำลังบันทึก... ☁️</span>}
              {saveStatus === "saved" && <span className="text-[10px] text-green-600 font-bold">บันทึกแล้ว ✔️</span>}
              <Button variant="default" size="sm" onClick={startTour} className="text-xs font-bold h-7 px-3 rounded-full shadow-sm"><HelpCircle className="w-3.5 h-3.5 mr-1"/> วิธีใช้</Button>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">ยอดรวม (บาท)</p>
            <p className="font-black text-xl text-primary leading-tight">฿{grandTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div id="tour-tabs" className="flex px-2 md:px-4 pt-3 gap-1 md:gap-2 bg-card border-b border-border">
        {(["items", "members", "summary"] as const).map(tab => (
          <button
            key={tab}
            id={`tab-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 pb-3 text-sm font-bold transition-all border-b-[3px]",
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-t-lg"
            )}
          >
            {tab === "items" && <span className="flex items-center justify-center gap-1.5"><Receipt className="w-4 h-4"/> รายการ</span>}
            {tab === "members" && <span className="flex items-center justify-center gap-1.5"><Users className="w-4 h-4"/> สมาชิก ({members.length})</span>}
            {tab === "summary" && <span className="flex items-center justify-center gap-1.5"><CreditCard className="w-4 h-4"/> สรุปบิล</span>}
          </button>
        ))}
      </div>

      {/* Content */}
      <main className="flex-1 p-3 md:p-4 overflow-y-auto pb-24">
        {activeTab === "members" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card id="tour-add-member" className="border-border/50 shadow-sm">
              <CardHeader className="pb-3 px-4 md:px-6">
                <CardTitle className="text-lg">เพิ่มคนร่วมปาร์ตี้</CardTitle>
                <CardDescription>เพิ่มชื่อเพื่อนๆ ทุกคนที่มีส่วนร่วม (ทั้งคนจ่ายและคนหาร)</CardDescription>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                <form onSubmit={addMember} className="flex gap-2">
                  <Input 
                    placeholder="พิมพ์ชื่อเพื่อน..." 
                    value={newMemberName} 
                    onChange={e => setNewMemberName(e.target.value)} 
                    className="font-medium"
                  />
                  <Button type="submit" className="shrink-0 gap-1 font-bold"><Plus className="w-4 h-4"/> เพิ่ม</Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {members.length === 0 && (
                <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed shadow-sm">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="font-medium">ยังไม่มีสมาชิก</p>
                  <p className="text-xs mt-1">พิมพ์เพิ่มชื่อด้านบนได้เลย</p>
                </div>
              )}
              {members.map(member => (
                <div key={member.id} className="flex justify-between items-center p-3 md:p-4 bg-card rounded-xl md:rounded-2xl border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border", member.colorClass)}>
                      {member.name.charAt(0)}
                    </div>
                    <span className="font-semibold text-base md:text-lg">{member.name}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => deleteMember(member.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "items" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Card id="tour-add-item" className="border-border/50 shadow-sm">
              <CardHeader className="pb-3 px-4 md:px-6">
                <CardTitle className="text-lg">เพิ่มรายการใช้จ่าย</CardTitle>
              </CardHeader>
              <CardContent className="px-4 md:px-6">
                {members.length === 0 ? (
                  <div className="text-center p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm font-medium">
                    ต้องไปเพิ่มเพื่อนในแท็บ "สมาชิก" ก่อนถึงจะเพิ่มรายการได้
                  </div>
                ) : (
                  <form onSubmit={addItem} className="flex flex-col gap-3">
                    <Input placeholder="ชื่อรายการ (เช่น ชาบู, ค่าที่พัก)" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="font-medium" />
                    <Input placeholder="ราคารวม (บาท)" type="number" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="font-medium font-mono" />
                    
                    <div className="flex flex-col gap-1.5 mt-1">
                      <label className="text-sm font-bold text-slate-700">ใครเป็นคนสำรองจ่าย?</label>
                      <div className="relative">
                        <select 
                          className="w-full h-12 appearance-none rounded-2xl border border-border bg-slate-50 font-medium px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          value={newItemPaidBy}
                          onChange={e => setNewItemPaidBy(e.target.value)}
                        >
                          <option value="" disabled>เลือกคนจ่าย...</option>
                          {members.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    <Button type="submit" className="mt-2 font-bold" disabled={!newItemPaidBy}>เพิ่มรายการ</Button>
                  </form>
                )}
              </CardContent>
            </Card>

            <div className="space-y-4">
              {items.map(item => {
                const payer = members.find(m => m.id === item.paidBy);
                const allSelected = item.sharedBy.length === members.length && members.length > 0;

                return (
                  <Card key={item.id} className="overflow-hidden shadow-md border-border/50">
                    <div className="p-4 border-b border-border/50 bg-gradient-to-br from-slate-50 to-white">
                      <div className="flex justify-between items-start mb-1 gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-lg text-slate-800 truncate">{item.name}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn("text-[11px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border", payer ? payer.colorClass : "bg-slate-100 text-slate-500")}>
                              จ่ายโดย: {payer?.name || "ไม่ทราบ"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex flex-col items-end">
                          <p className="text-primary font-black text-xl">฿{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                          <Button variant="ghost" size="sm" className="h-7 px-2 mt-1 text-muted-foreground hover:text-destructive text-xs" onClick={() => deleteItem(item.id)}>
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> ลบ
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-white">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800">ติ๊กเลือกคนที่ต้องหาร</p>
                          <p className="text-xs font-semibold text-primary mt-0.5">
                            (หาร {item.sharedBy.length || 0} คน ตกคนละ ฿{item.sharedBy.length ? (item.price / item.sharedBy.length).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"})
                          </p>
                        </div>
                        <Button 
                          variant={allSelected ? "secondary" : "outline"} 
                          size="sm" 
                          className="h-8 text-xs font-bold rounded-full w-full sm:w-auto"
                          onClick={() => toggleShareAll(item.id, !allSelected)}
                        >
                          {allSelected ? "ไม่เลือกใครเลย" : "หารเท่ากันทุกคน"}
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {members.map(member => {
                          const isShared = item.sharedBy.includes(member.id);
                          return (
                            <div 
                              key={member.id}
                              onClick={() => toggleShare(item.id, member.id)}
                              className={cn(
                                "flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition-all active:scale-95",
                                isShared 
                                  ? "bg-primary/5 border-primary text-primary shadow-sm" 
                                  : "bg-transparent border-border text-muted-foreground hover:border-slate-300"
                              )}
                            >
                              <div className={cn(
                                "w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0",
                                isShared ? "bg-primary text-primary-foreground" : "border-2 border-slate-300"
                              )}>
                                {isShared && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className="font-semibold text-sm truncate">{member.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                )
              })}
              {items.length === 0 && members.length > 0 && (
                <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed shadow-sm">
                  <Receipt className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="font-medium">ยังไม่มีรายการค่าใช้จ่าย</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "summary" && (
          <div id="tour-summary" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Setup Bank Details for Payees */}
            {(() => {
              const payees = Array.from(new Set(items.map(i => i.paidBy))).map(id => members.find(m => m.id === id)).filter(Boolean) as Member[];
              
              if (payees.length === 0) return (
                <div className="text-center py-12 text-muted-foreground bg-white rounded-2xl border border-dashed shadow-sm">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="font-medium">ยังไม่มีการคำนวณบิล</p>
                </div>
              );

              return (
                <div className="space-y-4 mb-8">
                  <h3 className="font-black text-lg px-1 text-slate-800">บัญชีรับเงิน (สำหรับคนออกเงินไปก่อน)</h3>
                  {payees.map(payee => (
                    <Card key={payee.id} className="border-border/50 shadow-sm overflow-hidden">
                      <CardHeader className={cn("pb-3 py-3 px-4 bg-opacity-20", payee.colorClass.split(' ')[0])}>
                        <CardTitle className="text-base font-bold flex justify-between items-center text-slate-800">
                          <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> บัญชีของ {payee.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3 bg-white">
                        <Input 
                          placeholder="ธนาคาร (เช่น กสิกรไทย)" 
                          value={payee.bankDetails?.bankName || ""} 
                          onChange={e => updateBankDetails(payee.id, { ...payee.bankDetails, bankName: e.target.value } as BankDetails)} 
                          className="h-10 text-sm font-medium"
                        />
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                          <Input 
                            placeholder="ชื่อบัญชี" 
                            value={payee.bankDetails?.accountName || ""} 
                            onChange={e => updateBankDetails(payee.id, { ...payee.bankDetails, accountName: e.target.value } as BankDetails)} 
                            className="h-10 text-sm font-medium flex-1"
                          />
                          <Input 
                            placeholder="เลขบัญชี" 
                            value={payee.bankDetails?.accountNumber || ""} 
                            onChange={e => updateBankDetails(payee.id, { ...payee.bankDetails, accountNumber: e.target.value } as BankDetails)} 
                            className="h-10 text-sm font-mono font-bold flex-1"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )
            })()}

            {/* Debts Summary */}
            {Array.from(debts.entries()).length > 0 && (
              <div>
                <h3 className="font-black text-lg mb-4 px-1 text-slate-800">ใครต้องโอนให้ใครบ้าง?</h3>
                <div className="space-y-4 md:space-y-5">
                  {Array.from(debts.entries()).map(([owerId, payeeMap]) => {
                    const ower = members.find(m => m.id === owerId);
                    if (!ower) return null;

                    return (
                      <Card key={owerId} className="overflow-hidden border-border/80 shadow-md rounded-2xl">
                        <div className="bg-slate-800 text-white p-3 px-4 flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white/20", ower.colorClass)}>
                            {ower.name.charAt(0)}
                          </div>
                          <h4 className="font-bold text-lg">{ower.name} ต้องจ่าย:</h4>
                        </div>
                        
                        <div className="divide-y divide-border/50">
                          {Array.from(payeeMap.entries()).map(([payeeId, debtInfo]) => {
                            const payee = members.find(m => m.id === payeeId);
                            if (!payee) return null;
                            const isPaid = isPaymentPaid(owerId, payeeId);

                            return (
                              <div key={payeeId} className={cn("p-4 transition-colors", isPaid ? "bg-green-50" : "bg-white")}>
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-800 flex items-center gap-1.5 text-base">
                                      โอนให้ <span className={cn("px-2 py-0.5 rounded-md text-xs border", payee.colorClass)}>{payee.name}</span>
                                    </p>
                                    <div className="mt-2.5 space-y-1.5 border-l-2 border-slate-200 pl-2.5 ml-1">
                                      {debtInfo.breakdown.map((b, i) => (
                                        <div key={i} className="flex justify-between items-center text-xs text-slate-600">
                                          <span className="truncate pr-2">{b.name}</span>
                                          <span className="font-semibold shrink-0 font-mono">฿{b.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 gap-3 sm:gap-2">
                                    <span className={cn("font-black text-xl sm:text-2xl font-mono", isPaid ? "text-green-600" : "text-slate-800")}>
                                      ฿{debtInfo.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                    </span>
                                    <Button 
                                      size="sm" 
                                      variant={isPaid ? "default" : "outline"} 
                                      className={cn(
                                        "h-9 sm:h-8 rounded-full px-4 text-xs font-bold transition-all whitespace-nowrap shadow-sm",
                                        isPaid 
                                          ? "bg-green-500 hover:bg-green-600 text-white border-none" 
                                          : "border-slate-300 text-slate-700 hover:bg-slate-50"
                                      )}
                                      onClick={() => togglePaymentStatus(owerId, payeeId)}
                                    >
                                      {isPaid ? (
                                        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> จ่ายแล้ว (กดเพื่อยกเลิก)</span>
                                      ) : (
                                        <span className="flex items-center gap-1.5"><Upload className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> ทำเครื่องหมายว่าจ่ายแล้ว</span>
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                {!isPaid && payee.bankDetails?.accountNumber && (
                                  <div className="mt-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-inner">
                                    <div className="min-w-0 pr-4">
                                      <p className="text-xs font-bold text-slate-500 mb-0.5">{payee.bankDetails.bankName}</p>
                                      <p className="text-sm font-bold text-slate-800 truncate">{payee.bankDetails.accountName}</p>
                                      <p className="font-mono text-base font-black tracking-wider text-slate-700 mt-1">{payee.bankDetails.accountNumber}</p>
                                    </div>
                                    <Button size="icon" variant="outline" className={cn("shrink-0 h-10 w-10 transition-colors rounded-full relative", copiedBank === payeeId ? "border-green-500 text-green-500" : "border-slate-300 text-primary hover:bg-primary hover:text-white")} onClick={() => handleCopyBank(payee.bankDetails!.accountNumber, payeeId)}>
                                      {copiedBank === payeeId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                      {copiedBank === payeeId && <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap animate-in fade-in slide-in-from-bottom-1 duration-200">คัดลอกแล้ว</span>}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
