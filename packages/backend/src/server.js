const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/project-management';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB Error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  color: { type: String, default: '#6B6B6B' },
  type: { type: String, enum: ['productive', 'neutral', 'distracting'], default: 'neutral' },
  domains: [String],
  apps: [String],
  createdAt: { type: Date, default: Date.now }
});

const Category = mongoose.model('Category', categorySchema);

// Activity Tracking Schema
const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['website', 'application', 'tab', 'task'], required: true },
  title: String,
  description: String,
  url: String,
  domain: String,
  application: String,
  taskId: { type: mongoose.Schema.Types.ObjectId },
  boardId: { type: mongoose.Schema.Types.ObjectId },
  category: mongoose.Schema.Types.Mixed, // Allow both ObjectId reference and string ('productive', 'neutral', 'distracting')
  duration: { type: Number, default: 0 }, // in seconds
  startTime: { type: Date, required: true },
  endTime: Date,
  isActive: { type: Boolean, default: true },
  metadata: {
    tabCount: Number,
    tabSwitches: Number,
    scrollDepth: Number,
    keystrokes: Number,
    clicks: Number,
    listId: String,
    boardName: String,
    cardTitle: String,
    hoursWorked: String
  },
  date: { type: Date, default: Date.now }
});

const Activity = mongoose.model('Activity', activitySchema);

// Productivity Summary Schema
const productivitySummarySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  totalTime: { type: Number, default: 0 }, // seconds
  productiveTime: { type: Number, default: 0 },
  neutralTime: { type: Number, default: 0 },
  distractingTime: { type: Number, default: 0 },
  topWebsites: [{
    domain: String,
    time: Number,
    visits: Number
  }],
  topApplications: [{
    name: String,
    time: Number
  }],
  categories: [{
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    time: Number
  }],
  hourlyBreakdown: [{
    hour: Number,
    time: Number
  }]
});

const ProductivitySummary = mongoose.model('ProductivitySummary', productivitySummarySchema);

// Board Schema
const boardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lists: [{
    id: String,
    title: String,
    position: Number,
    cards: [{
      id: String,
      title: String,
      description: String,
      assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      dueDate: Date,
      priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
      timeTracking: {
        estimatedHours: { type: Number, default: 0 },
        loggedHours: { type: Number, default: 0 },
        isTimerRunning: { type: Boolean, default: false },
        timerStartedAt: Date,
        timerStartedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        timeLogs: [{
          user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          hours: Number,
          description: String,
          date: { type: Date, default: Date.now }
        }]
      },
      comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now }
      }],
      attachments: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
      }],
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  createdAt: { type: Date, default: Date.now }
});

const Board = mongoose.model('Board', boardSchema);

// Auth Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error();
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId);
    
    if (!user) throw new Error();
    
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    
    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key');
    
    res.json({
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    }
  });
});

// Board Routes (existing routes remain the same)
app.get('/api/boards', authMiddleware, async (req, res) => {
  try {
    const boards = await Board.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id }
      ]
    }).populate('owner members', 'name email');
    
    res.json(boards);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/boards', authMiddleware, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const board = new Board({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
      lists: []
    });
    
    await board.save();
    await board.populate('owner members', 'name email');
    
    res.status(201).json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/boards/:id', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id)
      .populate('owner members', 'name email')
      .populate('lists.cards.assignedTo', 'name email')
      .populate('lists.cards.comments.user', 'name email');
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const hasAccess = board.owner._id.equals(req.user._id) || 
                      board.members.some(m => m._id.equals(req.user._id));
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/boards/:id', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    const hasAccess = board.owner.equals(req.user._id) || 
                      board.members.some(m => m.equals(req.user._id));
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: false }
    ).populate('owner members', 'name email')
     .populate('lists.cards.assignedTo', 'name email')
     .populate('lists.cards.comments.user', 'name email');
    
    io.to(req.params.id).emit('boardUpdated', updatedBoard);
    
    res.json(updatedBoard);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/boards/:id', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    if (!board.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only owner can delete board' });
    }
    
    await board.deleteOne();
    
    res.json({ message: 'Board deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/boards/:id/members', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    if (!board.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only owner can add members' });
    }
    
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ error: 'User not found with that email' });
    }
    
    if (board.members.some(m => m.equals(userToAdd._id))) {
      return res.status(400).json({ error: 'User is already a member' });
    }
    
    board.members.push(userToAdd._id);
    await board.save();
    await board.populate('owner members', 'name email');
    
    res.json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/boards/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    
    if (!board.owner.equals(req.user._id)) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }
    
    board.members = board.members.filter(m => !m.equals(req.params.userId));
    await board.save();
    await board.populate('owner members', 'name email');
    
    res.json(board);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// PRODUCTIVITY TRACKING ROUTES
// ============================================

// Category Routes
app.get('/api/categories', authMiddleware, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/categories', authMiddleware, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', authMiddleware, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Activity Tracking Routes
app.post('/api/activities', authMiddleware, async (req, res) => {
  try {
    console.log('📊 POST /api/activities received:', {
      type: req.body.type,
      title: req.body.title,
      duration: req.body.duration,
      category: req.body.category,
      user: req.user._id
    });
    
    const activityData = {
      ...req.body,
      user: req.user._id
    };
    
    // Auto-categorize based on domain/app (only if category is not already set as string)
    if (!activityData.category || typeof activityData.category !== 'string') {
      if (activityData.domain) {
        const category = await Category.findOne({
          domains: activityData.domain
        });
        if (category) {
          activityData.category = category._id;
        }
      } else if (activityData.application) {
        const category = await Category.findOne({
          apps: activityData.application
        });
        if (category) {
          activityData.category = category._id;
        }
      }
    }
    
    const activity = new Activity(activityData);
    await activity.save();
    
    // Only populate if category is ObjectId
    if (activityData.category && typeof activityData.category !== 'string') {
      await activity.populate('category');
    }
    
    console.log('✅ Activity saved:', {
      _id: activity._id,
      type: activity.type,
      duration: activity.duration,
      startTime: activity.startTime
    });
    
    // Emit real-time update
    io.to(req.user._id.toString()).emit('activityUpdate', activity);
    
    res.status(201).json(activity);
  } catch (error) {
    console.error('❌ POST /api/activities error:', error);
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/activities/:id', authMiddleware, async (req, res) => {
  try {
    const activity = await Activity.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    ).populate('category');
    
    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }
    
    res.json(activity);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/activities', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const query = { user: req.user._id };
    
    if (startDate && endDate) {
      // Filter by startTime instead of date field
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      query.startTime = {
        $gte: start,
        $lte: end
      };
    }
    
    if (type) {
      query.type = type;
    }
    
    const activities = await Activity.find(query)
      .populate('category')
      .sort({ startTime: -1 });
    
    res.json(activities);
  } catch (error) {
    console.error('GET /api/activities error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Analytics Routes
app.get('/api/analytics/summary', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    
    let summary = await ProductivitySummary.findOne({
      user: req.user._id,
      date: targetDate
    }).populate('categories.category');
    
    if (!summary) {
      // Generate summary if it doesn't exist
      summary = await generateDailySummary(req.user._id, targetDate);
    }
    
    res.json(summary);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/analytics/range', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const activities = await Activity.find({
      user: req.user._id,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).populate('category');
    
    // Calculate statistics
    const stats = calculateStatistics(activities);
    
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Helper function to generate daily summary
async function generateDailySummary(userId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const activities = await Activity.find({
    user: userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('category');
  
  const summary = {
    user: userId,
    date: startOfDay,
    totalTime: 0,
    productiveTime: 0,
    neutralTime: 0,
    distractingTime: 0,
    topWebsites: [],
    topApplications: [],
    categories: [],
    hourlyBreakdown: Array(24).fill(0).map((_, i) => ({ hour: i, time: 0 }))
  };
  
  const websiteMap = {};
  const appMap = {};
  const categoryMap = {};
  
  activities.forEach(activity => {
    const duration = activity.duration || 0;
    summary.totalTime += duration;
    
    // Categorize by type
    if (activity.category) {
      if (activity.category.type === 'productive') {
        summary.productiveTime += duration;
      } else if (activity.category.type === 'distracting') {
        summary.distractingTime += duration;
      } else {
        summary.neutralTime += duration;
      }
      
      // Aggregate by category
      if (!categoryMap[activity.category._id]) {
        categoryMap[activity.category._id] = {
          category: activity.category._id,
          time: 0
        };
      }
      categoryMap[activity.category._id].time += duration;
    } else {
      summary.neutralTime += duration;
    }
    
    // Aggregate websites
    if (activity.domain) {
      if (!websiteMap[activity.domain]) {
        websiteMap[activity.domain] = { domain: activity.domain, time: 0, visits: 0 };
      }
      websiteMap[activity.domain].time += duration;
      websiteMap[activity.domain].visits += 1;
    }
    
    // Aggregate applications
    if (activity.application) {
      if (!appMap[activity.application]) {
        appMap[activity.application] = { name: activity.application, time: 0 };
      }
      appMap[activity.application].time += duration;
    }
    
    // Hourly breakdown
    const hour = new Date(activity.startTime).getHours();
    summary.hourlyBreakdown[hour].time += duration;
  });
  
  // Convert maps to arrays and sort
  summary.topWebsites = Object.values(websiteMap)
    .sort((a, b) => b.time - a.time)
    .slice(0, 10);
  
  summary.topApplications = Object.values(appMap)
    .sort((a, b) => b.time - a.time)
    .slice(0, 10);
  
  summary.categories = Object.values(categoryMap);
  
  // Save summary
  const savedSummary = await ProductivitySummary.create(summary);
  return savedSummary;
}

// Helper function to calculate statistics
function calculateStatistics(activities) {
  const stats = {
    totalActivities: activities.length,
    totalTime: 0,
    byType: {},
    byCategory: {},
    byHour: Array(24).fill(0).map((_, i) => ({ hour: i, count: 0, time: 0 })),
    topDomains: {},
    topApps: {}
  };
  
  activities.forEach(activity => {
    const duration = activity.duration || 0;
    stats.totalTime += duration;
    
    // By type
    if (!stats.byType[activity.type]) {
      stats.byType[activity.type] = { count: 0, time: 0 };
    }
    stats.byType[activity.type].count += 1;
    stats.byType[activity.type].time += duration;
    
    // By category
    if (activity.category) {
      const catName = activity.category.name;
      if (!stats.byCategory[catName]) {
        stats.byCategory[catName] = { count: 0, time: 0, type: activity.category.type };
      }
      stats.byCategory[catName].count += 1;
      stats.byCategory[catName].time += duration;
    }
    
    // By hour
    const hour = new Date(activity.startTime).getHours();
    stats.byHour[hour].count += 1;
    stats.byHour[hour].time += duration;
    
    // Top domains
    if (activity.domain) {
      if (!stats.topDomains[activity.domain]) {
        stats.topDomains[activity.domain] = 0;
      }
      stats.topDomains[activity.domain] += duration;
    }
    
    // Top apps
    if (activity.application) {
      if (!stats.topApps[activity.application]) {
        stats.topApps[activity.application] = 0;
      }
      stats.topApps[activity.application] += duration;
    }
  });
  
  return stats;
}

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('joinBoard', (boardId) => {
    socket.join(boardId);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });
  
  socket.on('leaveBoard', (boardId) => {
    socket.leave(boardId);
    console.log(`User ${socket.id} left board ${boardId}`);
  });
  
  socket.on('joinUserRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${socket.id} joined user room ${userId}`);
  });
  
  socket.on('boardUpdate', (data) => {
    socket.to(data.boardId).emit('boardUpdated', data.board);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
