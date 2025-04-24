import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Context Providers
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NewRequest from './pages/NewRequest';
import RequestDetail from './pages/RequestDetail';
import AdminPanel from './pages/AdminPanel';
import ModelUpload from './pages/ModelUpload';
import EmbedCode from './pages/EmbedCode';
import ModelEmbed from './pages/ModelEmbed';

// Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// AppContent component to use context after it's provided
const AppContent = () => {
  return (
    <Router>
      <div className="App d-flex flex-column min-vh-100">
        <Navbar />
        <main className="flex-grow-1 py-3">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/embed/:modelId" element={<ModelEmbed />} />
            
            {/* Protected Routes (require authentication) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/requests/new" element={<NewRequest />} />
              <Route path="/requests/:requestId" element={<RequestDetail />} />
              <Route path="/models/:modelId" element={<EmbedCode />} />
            </Route>
            
            {/* Admin Routes (require admin permission) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/admin/requests/:requestId" element={<RequestDetail />} />
              <Route path="/admin/upload/:requestId" element={<ModelUpload />} />
            </Route>
          </Routes>
        </main>
        <footer className="bg-dark text-light py-3">
          <Container>
            <p className="text-center mb-0">&copy; {new Date().getFullYear()} 3D Model Request Platform</p>
          </Container>
        </footer>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
