require('dotenv').config();
const express = require('express');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const connectDb = require('./utils/dbConnect');
const path = require('path');
const Product = require('./models/productModel');
const userModel = require('./models/userModel');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const viewRoutes = require('./routes/viewRoutes');
const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const passport = require('passport');

// Connect to database
connectDb();

const app = express();
const cors = require('cors');

app.use(
  cors({
    origin: [
      'http://localhost:3000', // لو بتجرب من React
      'http://127.0.0.1:3000',
      'https://clickpower.onrender.com', // حط هنا الدومين اللي هتستخدمه بعدين
    ],
    credentials: true, // 🔥 لازم عشان الكوكي تبعت مع كل request
  }),
);
app.set('trust proxy', 1);
setInterval(() => {
  fetch('https://click-power-2.onrender.com')
    .then(() => console.log('Ping sent to keep server awake ⏰'))
    .catch((err) => console.error('Ping failed:', err.message));
}, 5 * 60 * 1000); // كل 5 دقايق


app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://clickpower.onrender.com"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "https://clickpower.onrender.com");
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  next();
});


// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Security middleware - معدل عشان يسمح بكل حاجة
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          "'unsafe-inline'",
          "'unsafe-eval'",
          'https://cdnjs.cloudflare.com',
          'https://api.mapbox.com',
          'https://js.stripe.com',
          'https://unpkg.com',
          'https://prod.spline.design',
        ],
        'script-src-attr': ["'self'", "'unsafe-inline'"],
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://cdnjs.cloudflare.com',
          'https://api.mapbox.com',
          'https://fonts.googleapis.com',
        ],
        'font-src': [
          "'self'",
          'https://fonts.gstatic.com',
          'https://cdnjs.cloudflare.com',
          'data:',
        ],
        'img-src': ["'self'", 'data:', 'blob:', 'https:'],
        'worker-src': ["'self'", 'blob:'],
        'connect-src': [
          "'self'",
          'http://localhost:3000',
          'http://127.0.0.1:3000',
          'https://clickpower.onrender.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'https://js.stripe.com',
          'https://*.spline.design',
          'https://www.gstatic.com',
          'https://unpkg.com',
          'ws://127.0.0.1:1234',
          'ws://localhost:1234',
        ],

        'frame-src': ['https://js.stripe.com', 'https://www.google.com'],
      },
    },
  }),
);

// Development logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Data sanitization and security
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
app.use(passport.initialize());

// Request time middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Redirect .html to without extension
app.get('*.html', (req, res) => {
  const pathWithoutHtml = req.path.replace('.html', '');
  res.redirect(pathWithoutHtml);
});
// Static files (AFTER routes)
app.use(express.static(path.join(__dirname, 'public')));
// Routes
app.use('/', viewRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);



// Ignore browser/devtools requests
app.use((req, res, next) => {
  if (req.path.includes('.well-known') || req.path === '/favicon.ico') {
    return res.status(204).end();
  }
  next();
});

// 404 handler for all other routes
app.all('*', (req, res, next) => {
  console.log('❌ Route not found:', req.originalUrl);
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Global error handler (MUST be last)
app.use(globalErrorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
