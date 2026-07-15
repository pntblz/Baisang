<div align="center">
  <img src="https://i.ibb.co/27smhg2b/Baisang-Logo.png" alt="Baisang Logo" width="200" />
  
  # 🧾 ใบสั่ง (Baisang) - แอปหารบิลจบปัญหาวุ่นวาย

  **แอปพลิเคชันสำหรับ "หารค่าใช้จ่าย" (Bill Splitting) ที่ดีที่สุดสำหรับคนไทย** <br />
  ออกแบบมาให้ใช้งานง่าย รวดเร็ว และไม่ต้องปวดหัวกับการคิดเงินอีกต่อไป ไม่ว่าจะเป็นค่าทริปเที่ยว, ค่าหมูกระทะ, หรือค่าใช้จ่ายกองกลาง ก็จัดการจบได้ในเว็บเดียว!

  [![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
  [![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://vercel.com/)

  🌐 **Live Demo:** [baisang.vercel.app](https://baisang.vercel.app) 
</div>

---

## ✨ ทำไมต้องใช้ "ใบสั่ง" ?

บ่อยครั้งที่การไปเที่ยวกับเพื่อน หรือกินข้าวกลุ่มใหญ่ มักจะจบลงด้วยความสับสนว่า **"ใครจ่ายอะไรไปบ้าง?"** และ **"ใครต้องโอนให้ใครเท่าไหร่?"**
**ใบสั่ง (Baisang)** ถูกสร้างขึ้นมาเพื่อแก้ปัญหานี้โดยเฉพาะ ด้วยระบบคำนวณหนี้แบบ **Smart Auto-calculate** ที่จะจับคู่คนที่ต้องจ่ายและคนที่ต้องรับเงินให้อัตโนมัติ ทำให้การเคลียร์บิลเป็นเรื่องง่ายนิดเดียว

### 🌟 ฟีเจอร์เด่น (Key Features)

- ⚡ **สร้างห้องแบบไม่ต้องสมัครสมาชิก (No Sign-up Required):** กดสร้างปาร์ตี้ปุ๊บ ระบบออกรหัส PIN 6 หลักให้ทันที แชร์ให้เพื่อนเข้ามาร่วมเพิ่มบิลได้เลย
- 📱 **LINE Login Integration:** สำหรับคนที่อยากเก็บประวัติทริปไว้ดูย้อนหลัง สามารถเลือกล็อกอินผ่าน LINE ได้ (ข้อมูลไม่หายแม้ลืม PIN)
- 💸 **ระบบเพิ่มรายการที่ยืดหยุ่น:** 
  - กำหนดได้ว่า **ใครเป็นคนสำรองจ่าย** (Payer)
  - กำหนดได้ว่า **ใครบ้างที่ต้องหารในรายการนี้** (Splitters) ไม่บังคับว่าต้องหารทุกคน!
- 🧮 **คำนวณหนี้อัจฉริยะ (Smart Debt Calculation):** หักลบกลบหนี้ให้อัตโนมัติ สรุปผลลัพธ์ว่าใครต้องโอนให้ใคร พร้อมแสดงจำนวนเงินสุทธิ
- 🏦 **คัดลอกเลขบัญชีพร้อมโอน:** ใส่เลขบัญชีหรือ PromptPay ของคนรับเงินไว้ เมื่อถึงเวลาเคลียร์บิล เพื่อนสามารถกด "คัดลอก" และนำไปโอนในแอปธนาคารได้ทันที
- ☁️ **บันทึกข้อมูลเรียลไทม์ (Auto-save on Cloud):** ทุกๆ การเปลี่ยนแปลงจะถูกบันทึกลงฐานข้อมูล Supabase อัตโนมัติ รีเฟรชกี่ครั้งข้อมูลก็ไม่หาย

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

โปรเจกต์นี้ถูกพัฒนาด้วยเทคโนโลยี Modern Web Development ล่าสุด:

| หมวดหมู่ | เทคโนโลยีที่ใช้ |
| :--- | :--- |
| **Frontend Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) (Radix UI) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Database & Auth** | [Supabase](https://supabase.com/) (PostgreSQL) |
| **Authentication** | Custom LINE Login OAuth 2.1 |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## 📁 โครงสร้างโปรเจกต์ (Folder Structure)

```text
Baisang/
├── src/
│   ├── app/                # Next.js App Router (หน้าเว็บทั้งหมด)
│   │   ├── api/            # API Routes (เช่น LINE Auth callback)
│   │   ├── party/          # หน้าจัดการบิล /party/[id]
│   │   ├── globals.css     # ไฟล์ CSS หลัก
│   │   └── page.tsx        # หน้าแรก (Home) / สร้างห้อง / ใส่ PIN
│   ├── components/         # React Components ที่นำไปใช้ซ้ำ
│   │   └── ui/             # shadcn/ui components (ปุ่ม, input, ฯลฯ)
│   └── lib/                # Utility functions & Configurations
│       ├── supabase.ts     # ไฟล์เชื่อมต่อ Supabase Client
│       └── utils.ts        # ฟังก์ชันช่วยเหลือ (เช่น twMerge, clsx)
├── public/                 # รูปภาพและ Static Assets
├── tailwind.config.ts      # ตั้งค่า Tailwind CSS
└── next.config.ts          # ตั้งค่า Next.js
```

---

## 🚀 การติดตั้งและรันโปรเจกต์ (Local Development)

หากคุณต้องการนำโค้ดไปพัฒนาต่อในเครื่องของคุณเอง สามารถทำตามขั้นตอนด้านล่างนี้ได้เลยครับ

### 1. Clone โปรเจกต์
```bash
git clone https://github.com/pntblz/Baisang.git
cd Baisang
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่าตัวแปรแวดล้อม (Environment Variables)
สร้างไฟล์ `.env.local` ไว้ที่โฟลเดอร์นอกสุด (Root directory) ของโปรเจกต์ และใส่ค่า Config เหล่านี้:
```env
# ----------------------------------------------------
# 1. Supabase Configuration (สำหรับฐานข้อมูล)
# ----------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# ----------------------------------------------------
# 2. LINE Login Configuration (สำหรับการล็อกอิน)
# ----------------------------------------------------
NEXT_PUBLIC_LINE_CLIENT_ID=your_line_channel_id
LINE_CLIENT_SECRET=your_line_channel_secret
```

### 4. เตรียมฐานข้อมูล (Supabase SQL Setup)
โปรเจกต์นี้ใช้ตารางเพียง 1 ตารางหลักในการเก็บข้อมูล ให้ไปที่ **SQL Editor** ใน Supabase Project ของคุณ และรันสคริปต์นี้:

```sql
CREATE TABLE IF NOT EXISTS parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text NOT NULL UNIQUE,       -- รหัสเข้าห้อง 6 หลัก
  data jsonb DEFAULT '{}'::jsonb, -- ข้อมูลบิล, สมาชิก, รายการใช้จ่าย
  host_id text,                   -- User ID ของคนที่สร้างห้อง (จาก LINE)
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- สร้าง Index เพื่อให้ค้นหา PIN ได้รวดเร็วขึ้น
CREATE INDEX idx_parties_pin ON parties(pin);
```

### 5. เริ่มต้นรันเซิร์ฟเวอร์
```bash
npm run dev
```
🎉 เสร็จเรียบร้อย! เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000) เพื่อเริ่มใช้งานแอปในเครื่องของคุณได้เลย

---

## 🤝 การมีส่วนร่วม (Contributing)
ยินดีต้อนรับนักพัฒนาทุกท่านที่สนใจร่วมพัฒนาแอป "ใบสั่ง" ให้ดียิ่งขึ้น! 
1. Fork โปรเจกต์นี้
2. สร้าง Branch ใหม่ (`git checkout -b feature/AmazingFeature`)
3. Commit สิ่งที่คุณแก้ไข (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request 

---

## 📄 License
โปรเจกต์นี้เป็น Open-source ภายใต้ลิขสิทธิ์ [MIT License](LICENSE) สามารถนำไปใช้งาน พัฒนาต่อ หรือแจกจ่ายได้อย่างอิสระ
