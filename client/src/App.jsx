import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { N } from './neu';
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TripList from './pages/TripList';
import CreateTrip from './pages/CreateTrip';
import ItineraryBuilder from './pages/ItineraryBuilder';
import ItineraryView from './pages/ItineraryView';
import Budget from './pages/Budget';
import Packing from './pages/Packing';
import Notes from './pages/Notes';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Invoice from './pages/Invoice';
import PublicTrip from './pages/PublicTrip';
import CitySearch from './pages/CitySearch';
import ActivitySearch from './pages/ActivitySearch';
import AIChatbot from './components/ui/AIChatbot';
import GlobalBudgetAlert from './components/ui/BudgetAlertModal';

function Guard({ children }) {
  const token = useAuthStore(s => s.token);
  return token ? <>{children}<AIChatbot /><GlobalBudgetAlert /></> : <Navigate to="/login" replace />;
}

function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: N.bg }}>
      <Navbar />
      <main style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '32px 20px',
        fontFamily: N.font,
      }}>
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background:   N.bg,
            color:        N.fg,
            boxShadow:    N.shadow,
            borderRadius: N.radiusBtn,
            fontFamily:   N.font,
            fontWeight:   500,
            fontSize:     '14px',
          },
          success: { iconTheme: { primary: N.accentSecondary, secondary: N.bg } },
          error:   { iconTheme: { primary: N.danger,          secondary: N.bg } },
        }}
      />
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/trip/public/:id" element={<PublicTrip />} />
        <Route path="/"                element={<Guard><Layout><Dashboard /></Layout></Guard>} />
        <Route path="/trips"           element={<Guard><Layout><TripList /></Layout></Guard>} />
        <Route path="/cities"          element={<Guard><Layout><CitySearch /></Layout></Guard>} />
        <Route path="/activities"      element={<Guard><Layout><ActivitySearch /></Layout></Guard>} />
        <Route path="/trips/new"       element={<Guard><Layout><CreateTrip /></Layout></Guard>} />
        <Route path="/trips/:id/build" element={<Guard><Layout><ItineraryBuilder /></Layout></Guard>} />
        <Route path="/trips/:id/view"  element={<Guard><Layout><ItineraryView /></Layout></Guard>} />
        <Route path="/trips/:id/budget"  element={<Guard><Layout><Budget /></Layout></Guard>} />
        <Route path="/trips/:id/packing" element={<Guard><Layout><Packing /></Layout></Guard>} />
        <Route path="/trips/:id/notes"   element={<Guard><Layout><Notes /></Layout></Guard>} />
        <Route path="/trips/:id/invoice" element={<Guard><Layout><Invoice /></Layout></Guard>} />
        <Route path="/community"       element={<Guard><Layout><Community /></Layout></Guard>} />
        <Route path="/profile"         element={<Guard><Layout><Profile /></Layout></Guard>} />
        <Route path="/admin"           element={<Guard><Layout><Admin /></Layout></Guard>} />
      </Routes>
    </BrowserRouter>
  );
}
