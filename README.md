# 🧾 ใบสั่ง (Baisang) - แอปหารบิลจบปัญหาวุ่นวาย

**Baisang (ใบสั่ง)** คือเว็บแอปพลิเคชันสำหรับ "หารค่าใช้จ่าย" (Bill Splitting) ที่ออกแบบมาให้ใช้งานง่าย รวดเร็ว และเป็นมิตรกับผู้ใช้งานชาวไทย ไม่ว่าจะเป็นค่าทริปเที่ยว, ค่าหมูกระทะ, หรือค่าใช้จ่ายกองกลาง ก็สามารถจัดการได้ในไม่กี่คลิก

![Baisang Logo](https://i.ibb.co/27smhg2b/Baisang-Logo.png)

🌐 **Live Demo:** [baisang.vercel.app](https://baisang.vercel.app) *(ใส่ลิงก์ของคุณที่นี่)*

---

## ✨ ฟีเจอร์หลัก (Features)
- **สร้างห้องง่าย:** เพียงกดสร้างปาร์ตี้ ระบบจะออกรหัส PIN 6 หลักให้ทันที แชร์รหัสให้เพื่อนเข้ามาร่วมดูบิลได้เลย
- **จัดการสมาชิกรวดเร็ว:** เพิ่มชื่อเพื่อนทุกคนที่เกี่ยวข้อง (ทั้งคนจ่ายเงิน และคนที่จะต้องหาร)
- **เพิ่มรายการค่าใช้จ่าย:** ระบุชื่อรายการ ราคา และเลือกว่า "ใครเป็นคนออกเงินไปก่อน" และ "ใครบ้างที่ต้องหารในรายการนี้"
- **คำนวณหนี้อัตโนมัติ (Smart Auto-calculate):** ระบบจะสรุปให้ทันทีในหน้า "สรุปบิล" ว่าใครต้องโอนให้ใคร เป็นจำนวนเงินเท่าไหร่
- **คัดลอกเลขบัญชีพร้อมโอน:** สามารถแนบเลขบัญชี/พร้อมเพย์ของคนรับเงิน และกดปุ่มคัดลอกได้ทันที
- **บันทึกข้อมูลอัตโนมัติ (Auto-save):** ระบบจะบันทึกข้อมูลขึ้นคลาวด์ทุกครั้งที่มีการเปลี่ยนแปลงแบบเรียลไทม์
- **LINE Login:** ล็อกอินผ่าน LINE เพื่อบันทึกประวัติปาร์ตี้ของคุณไว้ดูย้อนหลังได้ (สามารถใช้งานโดยไม่ล็อกอินได้เช่นกัน)

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)
- **Frontend:** [Next.js 15](https://nextjs.org/) (App Router), React, TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (Radix UI), Lucide Icons
- **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** Custom LINE Login API
- **Deployment:** [Vercel](https://vercel.com)

---

## 🚀 การติดตั้งและรันโปรเจกต์ (Local Development)

หากต้องการนำโค้ดไปรันในเครื่องของคุณเอง ให้ทำตามขั้นตอนต่อไปนี้:

### 1. Clone โปรเจกต์
```bash
git clone https://github.com/pntblz/Baisang.git
cd Baisang
```

### 2. ติดตั้ง Dependencies
```bash
npm install
```

### 3. ตั้งค่า Environment Variables
สร้างไฟล์ `.env.local` ไว้ที่โฟลเดอร์นอกสุดของโปรเจกต์ และใส่ค่าเหล่านี้:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# LINE Login Configuration
NEXT_PUBLIC_LINE_CLIENT_ID=your_line_channel_id
LINE_CLIENT_SECRET=your_line_channel_secret
```

### 4. รันคำสั่งฐานข้อมูล (Supabase SQL)
ไปที่ Supabase SQL Editor และรันสคริปต์นี้เพื่อสร้างตาราง:
```sql
CREATE TABLE IF NOT EXISTS parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pin text NOT NULL UNIQUE,
  data jsonb DEFAULT '{}'::jsonb,
  host_id text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 5. เริ่มต้นรันเซิร์ฟเวอร์
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

## 📝 License
This project is open-sourced software licensed under the MIT license.
