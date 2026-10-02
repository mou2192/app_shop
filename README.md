# دفتر الزهوب — فواتير وديون

تطبيق React / Express لإدارة العملاء والفواتير والأصناف وسندات القبض ومشاركة الفواتير عبر واتساب.

## التشغيل

```bash
pnpm install
pnpm check
pnpm dev
```

لإنشاء نسخة الإنتاج:

```bash
pnpm build
pnpm start
```

## Supabase

ملف الجداول الجاهز موجود في:

```text
supabase/001_debtbook_schema.sql
```

شغّله في **Supabase → SQL Editor**.

إعدادات الواجهة موجودة في `client/src/lib/supabase.ts`، ويمكن تخصيصها عبر ملف `.env`:

```env
VITE_SUPABASE_URL=https://qobwwszmfrxitlibpnws.supabase.co
VITE_SUPABASE_ANON_KEY=ضع_مفتاح_anon_هنا
```

مفتاح `anon` عام ومسموح ظهوره في تطبيق المتصفح. **لا تضع مفتاح `service_role` في ملفات `client` أو في GitHub**؛ هذا المفتاح للخادم فقط.

> ملاحظة: جداول SQL مفعّل عليها RLS. لن تسمح بالقراءة والكتابة من المتصفح حتى تضيف سياسات RLS مرتبطة بتسجيل دخول المستخدم. هذا مقصود لحماية بيانات العملاء والفواتير.

## الأوامر

- `pnpm dev`: تشغيل خادم التطوير.
- `pnpm build`: بناء الواجهة والخادم.
- `pnpm start`: تشغيل الإنتاج.
- `pnpm check`: فحص TypeScript.
- `pnpm test`: تشغيل الاختبارات.
