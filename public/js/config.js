// API URL Configurasyonu
const isProduction = window.location.hostname !== 'localhost';

// Production'da Vercel URL'ini, geliştirme ortamında localhost'u kullan
const API_BASE_URL = isProduction
  ? '/api' // Vercel'da aynı origin'den servis ediliyor
  : 'http://localhost:3000/api';

// API endpoints
const LANDMARKS_API = `${API_BASE_URL}/landmarks`;
const VISITED_API = `${API_BASE_URL}/visited`;

export { LANDMARKS_API, VISITED_API };