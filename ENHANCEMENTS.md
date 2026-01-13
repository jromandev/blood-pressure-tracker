# HearthPulse BP Tracker

A modern, mobile-first blood pressure tracking application with AI-powered health insights, built with React 19, TypeScript, and Tailwind CSS.

## ✨ Recent Enhancements (January 2026)

### 🏗️ Architecture Improvements

#### 1. **React Context API for State Management**
- **Before**: Props drilled through multiple levels, 357-line monolithic App.tsx
- **After**: Centralized `BPContext` provider managing logs, profile, and handlers
- **Benefits**: 
  - Eliminated prop drilling
  - Cleaner component interfaces
  - Easier state access across the app
  - Better separation of concerns

#### 2. **Component Modularization**
- **Extracted Tab Components**: 
  - `/components/tabs/Dashboard.tsx` - Health trends and recent history
  - `/components/tabs/AIAnalysis.tsx` - Gemini AI insights
  - `/components/tabs/StatusRadar.tsx` - Visual BP category radar
  - `/components/tabs/Settings.tsx` - User profile management
- **Benefits**:
  - Reduced App.tsx from 357 to ~100 lines
  - Improved maintainability
  - Easier testing
  - Better code organization

#### 3. **Toast Notification System**
- **Replaced**: Native `alert()` calls
- **Added**: Custom toast component with context provider
- **Features**:
  - Non-blocking notifications
  - Success, error, warning, and info types
  - Auto-dismiss after 3 seconds
  - Click to dismiss
  - Smooth animations
  - Mobile-optimized positioning

### 🎨 UI/UX Enhancements

#### 4. **Build-Time Tailwind CSS**
- **Before**: CDN-based Tailwind (larger bundle, no purging)
- **After**: PostCSS-processed Tailwind with tree-shaking
- **Benefits**:
  - ~70% smaller CSS bundle
  - Faster load times
  - Custom configuration support
  - Production-optimized

#### 5. **Accessibility (WCAG AA Compliance)**
- Added comprehensive ARIA labels on all interactive elements
- Keyboard navigation support for tab switching (Enter/Space keys)
- Focus indicators with `focus:ring` styles
- Screen reader announcements via `aria-live` regions
- Semantic HTML with proper roles (`dialog`, `navigation`)
- Color contrast improvements
- Improved form labels with proper associations

### 📱 Mobile & PWA Features

#### 6. **Progressive Web App (PWA) Support**
- **manifest.json**: Installable app with icons and metadata
- **Service Worker**: Offline caching strategy for static assets
- **iOS Safe Area**: Support for notched devices (iPhone X+)
- **Meta Tags**: Mobile-optimized viewport and theme color
- **Features**:
  - Add to Home Screen
  - Splash screen
  - Standalone mode (no browser chrome)
  - Offline functionality for cached content

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

## 📁 Project Structure

```
blood-pressure-tracker/
├── components/
│   ├── tabs/              # Tab content components
│   │   ├── Dashboard.tsx
│   │   ├── AIAnalysis.tsx
│   │   ├── StatusRadar.tsx
│   │   └── Settings.tsx
│   ├── BPChart.tsx        # Recharts area chart
│   ├── CategoryChart.tsx  # BP category visualization
│   ├── LogModal.tsx       # Add reading modal with OCR
│   └── Toast.tsx          # Toast notification system
├── context/
│   └── BPContext.tsx      # Global state management
├── services/
│   └── geminiService.ts   # AI integration (insights + OCR)
├── public/
│   ├── manifest.json      # PWA manifest
│   └── sw.js              # Service worker
├── App.tsx                # Root component with providers
├── constants.tsx          # BP categories and colors
├── types.ts               # TypeScript interfaces
├── styles.css             # Tailwind imports
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

## 🎯 Core Features

### 📊 Blood Pressure Tracking
- Manual entry with date/time picker
- Camera OCR scanning of BP monitors (Gemini Vision API)
- Historical data with visual trends
- Category-based color coding (Normal → Crisis)

### 🤖 AI-Powered Insights
- Gemini AI analysis of trends
- Personalized recommendations
- Trend detection (improving/declining/stable)
- Profile-aware suggestions

### 📈 Visualizations
- Area chart with systolic/diastolic/pulse trends
- Category radar showing BP zones
- Real-time status indicators

### 👤 User Profile
- Age, gender, weight tracking
- Medical conditions notes
- AI uses profile for personalized insights

## 🔧 Technical Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | React | 19.2.3 |
| **Language** | TypeScript | 5.8.2 |
| **Build Tool** | Vite | 6.4.1 |
| **Styling** | Tailwind CSS | 3.x |
| **Charts** | Recharts | 3.6.0 |
| **AI** | Google Gemini | 1.35.0 |

## 🎨 Design System

### Colors
- **Primary**: Indigo/Violet gradient
- **Normal BP**: Emerald green
- **Elevated**: Amber
- **Hypertension**: Red shades
- **Neutrals**: Slate palette

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300-900
- **Style**: Bold, uppercase tracking for headers

### Components
- **Border Radius**: Large (2rem-3rem) for modern look
- **Shadows**: Subtle with color tints
- **Animations**: Smooth transitions, scale transforms

## 📱 Mobile-First Features

- Bottom tab navigation (thumb-friendly)
- Large touch targets (48px+)
- Bottom sheet modals
- Swipe-friendly UI
- iOS safe area support
- Portrait orientation optimized
- Responsive breakpoints (sm: 640px)

## 🔒 Data Privacy

- All data stored locally in browser `localStorage`
- No server-side storage
- API calls only to Gemini AI (for insights and OCR)
- User controls all data deletion

## 🚧 Future Enhancements

### Suggested Next Steps
1. **Dark Mode**: System preference detection + manual toggle
2. **Testing**: Vitest + React Testing Library + Playwright
3. **Swipe Gestures**: Horizontal navigation between tabs
4. **Export Data**: CSV/PDF reports
5. **Reminders**: Notification API for measurement reminders
6. **Multi-User**: Support for family tracking
7. **Data Visualization**: More chart types (scatter, histogram)
8. **Medication Tracking**: Log medications alongside BP readings

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Google Gemini AI** for health insights and OCR
- **Recharts** for beautiful, responsive charts
- **Tailwind CSS** for rapid UI development
- **Vite** for lightning-fast development experience

---

**Built with ❤️ for better heart health tracking**
