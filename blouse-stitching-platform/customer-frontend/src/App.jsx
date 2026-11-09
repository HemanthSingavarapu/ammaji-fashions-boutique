import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalogue from './pages/Catalogue';
import DesignDetails from './pages/DesignDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import MeasurementsGuide from './pages/MeasurementsGuide';
import Wishlist from './pages/Wishlist';
import Success from './pages/Success';
import CustomStudio from './pages/CustomStudio';
import ForgotPassword from './pages/ForgotPassword';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppChat from './components/WhatsAppChat';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="app-container">
        <ScrollToTop />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogue" element={<Catalogue />} />
            <Route path="/studio" element={<CustomStudio />} />
            <Route path="/design/:id" element={<DesignDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/:id" element={<Checkout />} />
            <Route path="/success" element={<Success />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/guide" element={<MeasurementsGuide />} />
            <Route path="/wishlist" element={<Wishlist />} />
          </Routes>
        </main>
        <WhatsAppChat />
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
