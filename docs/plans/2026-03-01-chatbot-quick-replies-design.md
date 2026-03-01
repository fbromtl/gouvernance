# Public Chatbot — Quick Replies UI Enhancement

## Goal

Add clickable suggestion chips below the welcome message to guide visitors toward common questions and reduce friction on first interaction.

## Design

### Suggestions (4 chips)

1. "Quels outils sont gratuits ?"
2. "Comment fonctionne le diagnostic ?"
3. "Quels sont vos plans tarifaires ?"
4. "J'ai des questions sur la gouvernance IA"

### Behavior

- Displayed after the welcome message bubble in the messages area
- Aligned left (assistant side), wrapped in `flex flex-wrap gap-2`
- On click: sends the chip text as a user message via `sendMessage()`
- **Disappear** once any user message is sent (`messages.length > 1`)

### Style

- `border border-[#ab54f3] text-[#ab54f3] rounded-full text-xs px-3 py-1.5`
- Hover: `bg-[#ab54f3]/10`
- Cursor pointer, transition on hover

## Files Modified

- `src/components/PublicChat.tsx` — Add `QUICK_REPLIES` array and render chips in messages area
