

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import CTA from './components/CTA';
import FAQ from './components/FAQ';
import Tips from './components/Tips';
import Footer from './components/Footer';
import Booking from './components/Booking';
import History from './components/History';
import Transport from './components/Transport';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Contact from './components/Contact';
import Terms from './components/Terms';
import Privacy from './components/Privacy';


function App() {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="container my-4 flex-grow-1">
          <Routes>
            <Route path="/" element={
              <>
                <Hero />
                <Destinations />
                <CTA />
                <FAQ />
                <Tips />
              </>
            } />
            <Route path="/booking" element={<Booking />} />
            <Route path="/history" element={<History />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
