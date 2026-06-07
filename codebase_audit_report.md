# SuperCareer Frontend Codebase Audit Report

I have conducted a thorough audit of the codebase to identify bugs, logical flaws, design inconsistencies, lint errors, and missing functionality. Below is a detailed summary of my findings, categorized by severity.

---

## 1. Critical Bugs (Severity: High)

### 🔴 Out-of-Sync Redux Auth State & Stale User ID
* **File:** [AuthContext.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/context/AuthContext.tsx) (lines 137–155, 187–203) & [authSlice.ts](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/store/slices/authSlice.ts)
* **Description:** The Redux store contains an `auth` slice with `login` and `logout` actions, but they are **never dispatched** by the [AuthContext](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/context/AuthContext.tsx) hook when user actions occur at runtime. This causes the Redux auth state to remain at its default (`isAuthenticated = false`, `user = null`) until the page is fully reloaded.
* **Impact:** In [ATSScore.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/cv-builder/components/ATSScore.tsx#L26), the code uses the Redux hook `useAppSelector(selectUser)` to retrieve the current user and derive their user ID. If the user logs in and immediately builds a CV without refreshing, the user state is `null`, so `userId` defaults to `0` (line 52). The CV is then saved to the database on the backend with `user = 0`, causing it to be orphaned or rejected.
* **Suggested Fix:** Inject the Redux dispatch hook into [AuthContext.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/context/AuthContext.tsx) and dispatch the Redux `login` / `logout` actions when updating the local session:
  ```typescript
  import { useAppDispatch } from '@/store/hooks'
  import { login as reduxLogin, logout as reduxLogout } from '@/store/slices/authSlice'
  ```

### 🔴 No Way to Log Out from the UI
* **Files:** [Sidebar.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/layouts/Sidebar.tsx), [TopNav.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/layouts/TopNav.tsx), [ProfilePage.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/settings/ProfilePage.tsx)
* **Description:** Although the `logout` function is defined in [AuthContext.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/context/AuthContext.tsx#L187), there is **no button, link, or dropdown item** anywhere in the navigation or settings UI to trigger it. Once a user logs in, they remain logged in indefinitely unless they manually clear their browser's local storage.
* **Suggested Fix:** Add a logout option to the bottom of the sidebar or inside the profile avatar settings dropdown in [TopNav.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/layouts/TopNav.tsx).

---

## 2. Logical Flaws & Unimplemented Handlers (Severity: Medium)

### 🟡 Hardcoded ATS Score in RingProgress
* **File:** [ATSScore.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/cv-builder/components/ATSScore.tsx#L121)
* **Description:** The score indicator shows a hardcoded `94%` (lines 121 and 125). However, a dynamic ATS score heuristic based on the user's skill list length is calculated on line 55 for backend persistence:
  ```typescript
  const atsScore = Math.min(100, 60 + Math.min(40, data.skills.length * 4));
  ```
* **Impact:** The progress ring and score display do not change as the user updates their skills or details, breaking the interactive experience.
* **Suggested Fix:** Calculate `atsScore` at the render level and bind it to the `RingProgress` component:
  ```typescript
  const atsScore = Math.min(100, 60 + Math.min(40, data.skills.length * 4));
  // Replace sections={[{ value: 94, ... }]} with sections={[{ value: atsScore, ... }]}
  ```

### 🟡 Non-Functional Copy Buttons on Proposal Page
* **File:** [ProposalPage.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/freelance/ProposalPage.tsx#L66)
* **Description:** The copy icons on lines 66 and 85 have no click handlers bound to them. Additionally, the [Proposal](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/freelance/ProposalPage.tsx#L38) interface defined on the frontend does not include the proposal's text content (`content: string`), meaning the data is not available to be copied.
* **Suggested Fix:** Update the `Proposal` shape and mapping functions in [freelanceApi.ts](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/services/freelanceApi.ts#L131) to include the `content` field. Implement a clipboard copy function in the page.

### 🟡 Non-Functional Download Button on Custom CV Page
* **File:** [CustomCVPage.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/jobs/CustomCVPage.tsx#L123)
* **Description:** The "Download CV" action button on line 123 has no `onClick` handler.
* **Suggested Fix:** Wire up the download button to trigger the PDF export utility `generatePDFFromCV`.

### 🟡 Hardcoded Signature in Proposal Generator
* **File:** [CreateProposalPage.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/freelance/CreateProposalPage.tsx#L42)
* **Description:** The AI proposal text template generator hardcodes the sign-off signature as `"Alex Morgan"` (line 42) rather than using the logged-in user's name from the Auth state.
* **Suggested Fix:** Retrieve the logged-in user's name from `useAuth()` and pass it dynamically to `buildProposalText`.

### 🟡 Mock Data and TODOs on CV Edit Pages
* **Files:** [CvEditPage.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/jobs/CvEditPage.tsx) (line 70) and [CvAiEditPage.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/jobs/CvAiEditPage.tsx) (line 99)
* **Description:** These views load static mock objects (`MOCK_INITIAL_DATA` and `MOCK_CV_DATA`) and have `TODO` markers. They do not load or edit real CV content by their URL ID parameters.

---

## 3. UI/UX & Code Quality Polish (Severity: Low)

### 🟢 Typo in Bottom Navigation Menu
* **File:** [BottomNav.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/layouts/BottomNav.tsx#L7)
* **Description:** The tab label for the jobs route is set to `'JOPS'` instead of `'Jobs'`.
  ```typescript
  { label: 'JOPS', icon: Briefcase, href: ROUTES.jobs.jobMatch },
  ```

### 🟢 Unconditional Login Link in Marketing Navbar
* **File:** [MarketingNavbar.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/features/marketing/components/MarketingNavbar.tsx#L20)
* **Description:** The landing page navbar always shows a "Login" button, even if a user is already authenticated.
* **Suggested Fix:** Use the `useAuth` hook to toggle the button: show "Dashboard" if authenticated, otherwise "Login".

### 🟢 ESLint Rule Warning (Fast Refresh)
* **File:** [AuthContext.tsx](file:///c:/Users/aldrs/Desktop/supercareer-frontend/src/context/AuthContext.tsx#L220)
* **Description:** The file exports the hook `useAuth` and the context object `AuthContext` alongside the `AuthProvider` component, causing ESLint to throw the error:
  `Fast refresh only works when a file only exports components. Use a new file to share constants or functions between components (react-refresh/only-export-components)`
* **Suggested Fix:** Split the hook and context declarations into a separate file like `src/context/AuthContextCore.ts`, or tell ESLint to ignore the file with a comment.
