import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SpotifyAuthPopup from './Components/AuthPopup'
import App from './App';

function Root() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/auth-popup" element={<SpotifyAuthPopup />} />
      </Routes>
    </Router>
  );
}

export default Root;
