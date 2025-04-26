// MongoDB connection string
// Eğer MongoDB lokalde kurulu değilse, MongoDB Atlas ücretsiz sunucusu kullanılabilir
// veya varsayılan olarak yerel MongoDB bağlantısı

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/landmarksapp',
  PORT: process.env.PORT || 5000
};