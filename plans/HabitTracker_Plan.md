# Islamic Habit Tracker - Development Plan

## Project Overview
An Islamic habit tracking mobile app that works offline and syncs with Firebase when online. Built with React Native/Expo.

---

## Current Development Plan (Task by Task)

### Phase 1: Foundation & Setup
- [ ] 1. Configure app.json with proper icons and splash screen
- [ ] 2. Set up project folder structure (screens, components, services, hooks, types, utils)
- [ ] 3. Configure Firebase project (Firebase config file ready at lib/firebase.ts)
- [ ] 4. Create TypeScript types/interfaces for Habit, User, Completion records

### Phase 2: Authentication (Login Page)
- [ ] 5. Design and implement Login screen with email/password
- [ ] 6. Implement Firebase authentication (sign in, sign up, sign out)
- [ ] 7. Add user session persistence (AsyncStorage for offline)
- [ ] 8. Create auth context/hooks for managing user state

### Phase 3: Core Habit Tracking (Daily Tracker)
- [ ] 9. Create Daily Tracker screen with date selector
- [ ] 10. Implement habit list display with checkboxes
- [ ] 11. Add habit completion toggle functionality
- [ ] 12. Store completions locally (AsyncStorage) for offline access
- [ ] 13. Sync completions with Firebase when online

### Phase 4: Goal Management
- [ ] 14. Create "Add New Habit" form (name, category, frequency)
- [ ] 15. Implement edit habit functionality
- [ ] 16. Add delete habit with confirmation
- [ ] 17. Pre-defined Islamic habit categories (Salah, Quran, Fasting, etc.)

### Phase 5: Analytics & Stats
- [ ] 18. Create Analytics screen with stats cards
- [ ] 19. Calculate streak (consecutive days)
- [ ] 20. Show total completions per habit
- [ ] 21. Display weekly/monthly progress visualization

### Phase 6: Profile Management
- [ ] 22. Create Profile screen with user info
- [ ] 23. Implement admin panel (for admin users)
- [ ] 24. Add account deletion (danger zone)
- [ ] 25. Settings (notifications, theme preferences)

### Phase 7: Offline Sync System
- [ ] 26. Implement offline detection (NetInfo)
- [ ] 27. Create local-first data layer
- [ ] 28. Implement sync queue for pending changes
- [ ] 29. Handle sync conflicts (last-write-wins)
- [ ] 30. Show sync status indicator in UI

---

## User Task Flow

You will provide tasks one by one in this format:

1. **Task 1**: "Build the login screen with email/password"
2. **Task 2**: "Add Firebase authentication"
3. **Task 3**: "Create the daily tracker with date picker"
...and so on

I'll implement each task and wait for your confirmation before proceeding to the next.

---

## Future Features (Phase 2+)

### Islamic-Specific Features
- [ ] **Prayer Times Integration** - Show prayer times based on location
- [ ] **Quran Reading Tracker** - Track pages/verses read daily
- [ ] **Ramadan Mode** - Special tracking for Ramadan habits
- [ ] **Duas & Remembrances** - Morning/evening adhkar tracking
- [ ] **Zakat Calculator** - Helper for calculating Zakat
- [ ] **Islamic Calendar** - Show hijri dates alongside gregorian

### Advanced Features
- [ ] **Notifications/Reminders** - Habit reminders at set times
- [ ] **Widgets** - Home screen widgets for quick tracking
- [ ] **Dark Mode** - Full dark theme support
- [ ] **Data Export** - Export habits data as PDF/CSV
- [ ] **Achievements/Badges** - Gamification elements
- [ ] **Multi-language** - Support Arabic, Urdu, English
- [ ] **Family Sharing** - Track family members' habits

### Technical Enhancements
- [ ] **Redux Integration** - Your Redux setup for state management
- [ ] **Push Notifications** - Firebase Cloud Messaging
- [ ] **Apple Watch / Wear OS** - Companion app
- [ ] **Backup/Restore** - Manual backup to cloud storage

---

## Architecture Notes

### Offline-First Approach
```
app will work normal without internet and without login too 
(But the data will stored only in that device ) (when signup that data should save to db of that signup account)(in this situation when user logged in we'll think later what'll do with that data that is stored in local) 
User Action → Local Storage (AsyncStorage) → UI Update
                ↓
         Check Internet
                ↓
      Online? → Sync to Firebase
      Offline? → Queue for later
```

### Guest User Data Migration Strategy
**Option A (Recommended for MVP):** Clear local data after login and fetch fresh from Firebase
- Simpler to implement
- Less potential for data conflicts
- User starts fresh after signup

**Option B (Future):** Merge local guest data with user's Firebase data
- Preserve guest habits when user logs in
- More complex conflict resolution needed
- Better user experience

### Storage Architecture
```
┌─────────────────────────────────────────┐
│          REDUX PERSIST                   │
│  - User token                           │
│  - User details (name, email, isAdmin)  │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         ASYNCSTORAGE                     │
│  - Habits data                          │
│  - Completions data                      │
│  - Sync queue (pending changes)         │
└────────────────┬────────────────────────┘
                 │ (when online)
                 ▼
┌─────────────────────────────────────────┐
│            FIREBASE                      │
│  - Cloud backup                         │
│  - Cross-device sync                    │
└─────────────────────────────────────────┘
```

### Data Structure (for Firebase + Local)
```typescript
interface Habit {
  id: string;
  userId: string;
  name: string;
  category: 'prayer' | 'quran' | 'fasting' | 'charity' | 'other';
  createdAt: Date;
  isActive: boolean;
}

interface Completion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  syncedAt?: Date;
}
```

---

## App Color Theme (from HTML reference)
- Primary: #667eea (Purple-Blue gradient)
- Secondary: #764ba2
- Success: #28a745 (Completed habits)
- Background: #f8f9fa
- Text: #333333

---

*Plan created for Hamzah's Islamic Habit Tracker*
*Date: February 2026*
