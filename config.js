module.exports = {
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT
  },

  mongoURI: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  jwtCookieExpiresIn: process.env.JWT_COOKIE_EXPIRES_IN,

  google_client_id: process.env.CLIENT_ID,
  google_client_secret: process.env.CLIENT_SECRET,

  env: process.env.NODE_ENV || 'development'
};
