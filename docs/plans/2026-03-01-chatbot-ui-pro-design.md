# Public Chatbot — Professional UI Redesign

## Goal

Transform the public chatbot from a functional widget into a polished, premium experience that matches the professional quality of the rest of the site.

## Design

### 1. Header with Animated Avatar

- Avatar: 36px circle, `bg-white/20`, Sparkles icon with slow continuous rotation (Framer Motion)
- Green dot: 8px bottom-right of avatar, CSS pulse animation
- Title: "Assistant Gouvernance IA" — `text-sm font-semibold`
- Subtitle: "En ligne" — `text-[11px] text-white/70`
- Background: gradient `bg-gradient-to-r from-[#ab54f3] to-[#7c2cd4]`
- Buttons (reset/close): unchanged, hover `bg-white/20`

### 2. Rich Animations (Framer Motion)

- **Panel open**: `motion.div` — `initial={{ opacity: 0, y: 20, scale: 0.95 }}` → `animate={{ opacity: 1, y: 0, scale: 1 }}`, spring
- **Messages**: slide-in from left (assistant) or right (user) + fade, 50ms stagger
- **Typing indicator**: 3 bouncing dots (replace Loader2 spinner), stagger bounce
- **Floating button**: scale + shadow elevation on hover
- **Quick reply chips**: staggered fade-in (80ms delay each)

### 3. Size & Responsive

- **Desktop**: `w-[400px] h-[580px]` (up from 380×520)
- **Mobile** (<640px): `fixed inset-0` fullscreen, `rounded-none`, sticky header
- Detection via Tailwind responsive classes (`sm:`)

### 4. Improved Messages

- **Assistant bubbles**: `bg-neutral-50 border border-neutral-200/60` (lighter, with subtle border)
- **User bubbles**: `bg-gradient-to-r from-[#ab54f3] to-[#9333ea]`
- Spacing: `gap-4` (up from `gap-3`)
- Custom thin scrollbar (violet, via CSS `::-webkit-scrollbar`)

### 5. Input Area

- Input background: `bg-neutral-50` with `focus:bg-white` transition
- Send button: gradient matching user bubbles
- Padding: `p-4` (up from `p-3`)

### 6. Floating Button

- Gradient matching user bubbles
- Shadow: `shadow-xl` default, `shadow-2xl` hover
- Unread badge: unchanged

## Files Modified

- `src/components/PublicChat.tsx` — Full UI overhaul with Framer Motion animations, responsive layout, gradient styles, typing indicator, custom scrollbar
