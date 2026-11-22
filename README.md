# KisanSetu

**“Technology that connects every farmer to better decisions.”**

KisanSetu is an AI-powered agricultural intelligence and market-connect prototype structured around the core farmer workflow:

**SCAN → UNDERSTAND → IMPROVE → FIND MARKET → SELL**

---

## Key Modules Implemented

1. **Animated Opening Experience**: Seed-to-field visual transition into a precision-agriculture grid with a **Skip Intro** control.
2. **Authentication & 5-Step Onboarding**: Mobile/Email/Password login, Create Account, Password Reset UI, Google Prototype Sign-In, English / Hindi / Gujarati language switch, and **Continue as Demo Farmer (Rameshbhai Patel)**.
3. **Personalized Farmer Dashboard**: Farm Health index, Active Crops, Weather & Spray Advisory, Market Pulse, Alerts, and quick action links.
4. **My Farm**: Plot details, soil & irrigation metadata, crop health bars, 6-week health trend chart, and recent scan summary.
5. **AI Crop Scanner + Visual Quality Assessment + Disease Guidance**:
   - Supports camera capture, photo upload, or 3 built-in sample field specimens.
   - Animated multi-stage scanning interface.
   - Evaluates crop identification, growth stage, visual quality score (`0–100`), suggested grade (`A`/`B`/`C`), 6 visual traits, possible disease symptoms, severity, safe immediate & preventive actions, and **Find Verified Treatment Guidance**.
   - Never prescribes commercial medicine brands/dosages irresponsibly; directs farmers to verify chemical categories and dosage with a local KVK / agricultural officer.
6. **Market Intelligence & Price Positioning**: 14-day mandi trend charts, nearby market comparisons, and direct quality-grade-to-market recommendations.
7. **AI Crop Decision Engine ("What Should I Grow?")**: Compares 4 crop options across investment, water requirement, demand, risk, and suitability reasoning.
8. **Multilingual AI Farm Assistant**: Conversational + voice-input UI supporting English, Hindi, and Gujarati.
9. **B2B Buyer Portal & Supply Matching Engine**: Dedicated Buyer workspace (`/buyer`, `/buyer/requirements`, `/buyer/marketplace`) to post crop requirements, compute real-time farmer supply matches across villages, send purchase inquiries, and create orders directly.
10. **End-to-End Orders & Farm-to-Buyer Transport Logistics**: Shared Order lifecycle (`/orders`: `Order Created → Transport Requested → Pickup → In Transit → Delivered → Completed`), Transport Request & simulated route tracking (`/transport`), and Transport Provider dispatch console (`/transport/provider` for Kisan Logistics).
11. **12-Section Admin Operations & Governance Console**: Full `/admin` panel covering Overview KPIs & analytics charts, Farmers, Buyers, Crop Listings moderation, Buyer Requirements, Orders, Transport, Crop Scans audit, AI Assistant Logs, Agricultural Guidance CRUD, Reports, and Settings.
12. **Farm History & Notification Center**: End-to-end crop lifecycle timeline and role-filtered notifications drawer.

---

## Running Locally

```bash
npm install
npm run dev
```

The Express + Vite server runs on `http://localhost:3000`.

For production build & start:

```bash
npm run build
npm run start
```

---

## Configuring Gemini API Keys

1. Add `GEMINI_API_KEY` in the **Settings > Secrets** panel (or `.env` locally based on `.env.example`).
2. All `@google/genai` SDK calls (`gemini-4-hydrogen`) execute strictly server-side inside `server.ts` via `/api/ai/*` proxy routes:
   - `POST /api/ai/scan-crop`
   - `POST /api/ai/decision`
   - `POST /api/ai/chat` (powered by **Gemini Interactions API** `ai.interactions.create()` with `previous_interaction_id` multi-turn memory and live KisanSetu context tool calls)
   - `POST /api/ai/assistant`
   - `POST /api/ai/treatment-guidance`
3. If `GEMINI_API_KEY` is not set or an upstream request fails, `src/services/aiService.ts` transparently switches to **Demo Screening Fallback** and labels the output clearly in the UI.

---

## Demo Data vs. Live / AI-Powered Layers

| Layer | Current Mode | Service Location | Future Production Integration |
|---|---|---|---|
| Crop Vision Scan & Disease Screening | Live Gemini Vision (`/api/ai/scan-crop`) with labeled Demo Screening fallback | `server.ts`, `src/services/aiService.ts` | Live field agronomy models / KVK verification |
| Crop Decision Engine | Live Gemini (`/api/ai/decision`) with labeled Demo Decision fallback | `server.ts`, `src/services/aiService.ts` | District soil-health & seasonal yield APIs |
| AI Farm Assistant | Live Gemini Interactions API (`/api/ai/chat`) with stateful tool execution & Demo fallback | `server.ts`, `src/services/aiService.ts` | Live voice ASR + agronomy RAG |
| Mandi Prices & Trends | Structured Demo Dataset (clearly labeled in UI) | `src/services/marketService.ts` | eNAM / Agmarknet / APMC live feeds |
| Weather & Spray Alerts | Structured Demo Dataset (clearly labeled in UI) | `src/services/weatherService.ts` | IMD / OpenWeatherMap API |
| Transport Estimates & Route Visual | Simulated Prototype Estimates & Route Schematic (clearly labeled) | `src/services/marketplaceService.ts`, `src/pages/TransportPage.tsx` | Logistics carrier & fleet telematics APIs |
| Multi-Role Marketplace, Orders & Admin | LocalStorage-backed prototype repository | `src/services/farmRepository.ts`, `src/context/KisanSetuContext.tsx` | PostgreSQL / Firestore backend |
