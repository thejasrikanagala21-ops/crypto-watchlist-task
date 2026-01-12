const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


let nodemailer;
try {
  nodemailer = require('nodemailer');
  console.log('Nodemailer READY');
} catch (e) {
  console.log('Nodemailer missing → Demo mode');
}

const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect('mongodb://localhost:27017/watchlist')
  .then(() => console.log('MongoDB Connected '))
  .catch(() => console.log('Demo mode active'));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: String,
  profile: { name: String },
  watchlist: [String],
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => res.json({ 
  message: 'Crypto Watchlist API ', 
  mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Demo'
}));

app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json({ 
      count: users.length,
      users: users.map(u => ({
        email: u.email,
        verified: u.isVerified,
        watchlistCount: u.watchlist?.length || 0
      }))
    });
  } catch {
    res.json({ count: 0, message: 'Demo mode' });
  }
});

app.delete('/api/debug/clear', async (req, res) => {
  try {
    const result = await User.deleteMany({});
    res.json({ message: `🗑️ Deleted ${result.deletedCount} users` });
  } catch {
    res.json({ message: '🗑️ Cleared demo data' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name = email.split('@')[0] } = req.body;
    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: '❌ Email already exists' });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    const user = new User({ 
      email, 
      password: hashedPassword, 
      profile: { name },
      verificationToken,
      isVerified: false
    });
    await user.save();

    console.log(`🆕 New user: ${email}`);

   
    if (nodemailer) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'thejasrikanagala21@gmail.com',          
            pass: 'dldc hgyk yedh nodv'  
          }
        });

        const verifyUrl = `http://localhost:3000/verify?token=${verificationToken}`;
        
        await transporter.sendMail({
          from: 'test@auroraevents.in',
          to: email,
          subject: 'Verify Crypto Watchlist Account',
          html: `
            <h2 style="color: #00ff64;">Welcome to Crypto Watchlist!</h2>
            <p>Click below to verify your email:</p>
            <a href="${verifyUrl}" style="background: #00ff64; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify Email Now
            </a>
            <p>Or use this token: <strong>${verificationToken}</strong></p>
          `
        });
        
        console.log(`REAL email sent to ${email}`);
        return res.json({ message: 'Check your email for verification link!' });
      } catch (emailErr) {
        console.log('Email failed:', emailErr.message);
        // Still create demo login token
        const demoToken = jwt.sign({ email, name }, 'primetrade123');
        res.json({ 
          message: 'Registered! (Email service unavailable)',
          demoToken
        });
      }
    } else {
      res.json({ message: 'Demo mode - install: npm install nodemailer' });
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});


app.get('/api/auth/verify/:token', async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
    
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    console.log(` ${user.email} verified!`);
    res.json({ message: 'Email verified! You can now login.' });
  } catch (err) {
    res.status(500).json({ message: 'Verification failed' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
    
    const user = await User.findOne({ email, password: hashedPassword });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    if (!user.isVerified) {
      return res.status(400).json({ message: 'Please verify your email first' });
    }
    
    const token = jwt.sign({ userId: user._id, email }, 'primetrade123', { expiresIn: '30d' });
    res.json({ 
      token, 
      user: { email: user.email, name: user.profile.name }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});


const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '❌ No token' });
  try {
    req.user = jwt.verify(token, 'primetrade123');
    next();
  } catch {
    res.status(401).json({ message: '❌ Invalid token' });
  }
};


app.get('/api/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json(user.watchlist || []);
  } catch {
    res.json([]);
  }
});

app.post('/api/watchlist', auth, async (req, res) => {
  const { coin } = req.body;
  try {
    await User.findByIdAndUpdate(req.user.userId, { 
      $addToSet: { watchlist: coin.toUpperCase() } 
    });
  } catch {}
  res.json({ message: `✅ ${coin.toUpperCase()} added!` });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n Server: http://localhost:${PORT}`);
  console.log(' Users: http://localhost:5000/api/debug/users');
  console.log(' Clear: http://localhost:5000/api/debug/clear');
  
  
});
