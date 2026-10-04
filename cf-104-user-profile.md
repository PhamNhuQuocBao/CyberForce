# Implementation Plan - CF-104: Public Profile & Privacy Settings (US-01.03)

**Branch:** `feature/CF-104-user-profile`  
**Agents:** `@frontend-specialist` + `@backend-specialist`  
**Skills:** `@frontend-design`, `@api-patterns`, `@clean-code`  
**References:**  
- `docs/05-epics/EPIC_01_USER_IDENTITY_PROFILES_RBAC.md` (US-01.03)
- `docs/07-wireframes/EPIC_01_WIREFRAMES_IDENTITY_PROFILES_RBAC.md` (Wireframe 2.1 & 2.2)
- `DESIGN.md` (Positivus Theme / Neo-Brutalism)

---

## 🎯 Objectives
Build an interactive Operator Portfolio HUD at `/user/[username]` showcasing:
1. Operator Dossier (Avatar, Rank tier, EXP, streak, specialty, member since).
2. Pure SVG 8-Axis Cyber Skill Radar (Web Exploit, Cloud Sec, Net Pentest, DevSecOps, Crypto, Reverse Eng, OSINT, Binary).
3. Verified Certificates & Badges cabinet.
4. Two-Perspective Privacy Shield:
   - **Public Mode:** Full telemetry viewable by visitors & recruiters.
   - **Private Mode (Visitor):** Classified shield screen (`Wireframe 2.2 Perspective A`).
   - **Private Mode (Self):** Full view + Amber banner notice + Settings dialog (`Wireframe 2.2 Perspective B`).
5. `ProfileSettingsDialog`: Edit bio, specialty, and toggle Public/Private mode.
6. Share CV link with intelligent privacy check before copying.

---

## 📋 Task Breakdown

### Phase 1: Database & Backend API
- [ ] **Task 1: Git Branch & Database Schema Updates**
  - Checkout `feature/CF-104-user-profile` from `main`.
  - Add `bio`, `specialty`, and `isPublic` to `User` in `prisma/schema.prisma`.
  - Run `prisma db push` to synchronize dev database.

- [ ] **Task 2: User Profile Service, Controller & Routes**
  - Create `services/api-core/src/modules/users/users.schemas.ts`: Zod validation for profile query and update.
  - Create `services/api-core/src/modules/users/users.service.ts`:
    - `getProfileByUsername(username, requesterUserId)`: Checks privacy flag; returns dossier, 8-axis telemetry, certificates, badges.
    - `updateMyProfile(userId, data)`: Updates bio, specialty, avatarUrl, and isPublic.
  - Create `services/api-core/src/modules/users/users.controller.ts` & `users.routes.ts`:
    - `GET /api/v1/users/:username/profile` (public, optional auth).
    - `PATCH /api/v1/users/me/profile` (protected).
  - Register route in `services/api-core/src/app.ts`.

- [ ] **Task 3: Backend Integration Tests**
  - Create `services/api-core/src/modules/users/users.api.test.ts`.
  - Test public profile retrieval, private profile restriction for visitors, private profile bypass for self, and profile update endpoint.
  - Verify `pnpm --filter @cyberforce/api-core test`.

---

### Phase 2: Frontend Components & Pages
- [ ] **Task 4: Frontend API Client & Types**
  - Extend `apps/web/src/lib/api.ts` with `UserProfileDetail`, `RadarTelemetry`, `userApi.getProfile(username, token?)`, and `userApi.updateProfile(data, token)`.

- [ ] **Task 5: Pure SVG 8-Axis Skill Radar Component**
  - Create `apps/web/src/components/profile/SkillRadarChart.tsx`:
    - Pure SVG polygon rendering with 8 axes, concentric grid rings, labeled vertices, and Neo-Brutalist styling (Electric Lime `#B9FF66` fill, `#191A23` borders).
    - Responsive, zero extra npm dependencies.

- [ ] **Task 6: Profile Settings Dialog**
  - Create `apps/web/src/components/profile/ProfileSettingsDialog.tsx`:
    - Form to edit Bio and Specialty.
    - Toggle switch for Public Profile (`isPublic`).
    - Connect to `userApi.updateProfile` and update local state upon save.

- [ ] **Task 7: Operator Dossier Page (`/user/[username]`)**
  - Create `apps/web/src/app/(dashboard)/user/[username]/page.tsx`:
    - Perspective A: Visitor accessing Public Profile -> Full HUD.
    - Perspective B: Visitor accessing Private Profile -> "DOSSIER CLASSIFIED" Shield (Wireframe 2.2).
    - Perspective C: Owner accessing Private Profile -> Full HUD with amber preview banner + quick-toggle button.
    - Copy CV Share Link button with auto-check: prompt to make public if private.

---

### Phase 3: Verification & Quality Assurance
- [ ] **Task 8: End-to-End Verification & Build Checks**
  - Run all backend tests (`pnpm --filter @cyberforce/api-core test`).
  - Run frontend typecheck (`pnpm --filter @cyberforce/web typecheck`).
  - Run frontend lint (`pnpm --filter @cyberforce/web lint`).
  - Run Next.js production build (`pnpm --filter @cyberforce/web build`).
  - Update `task-breakdown.md` marking CF-104 complete.
