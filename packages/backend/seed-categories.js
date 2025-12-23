// Default Categories Seed Script
// Run with: node seed-categories.js

const mongoose = require('mongoose');
require('dotenv').config();

const categorySchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['productive', 'neutral', 'distracting'] },
  domains: [String],
  applications: [String],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Category = mongoose.model('Category', categorySchema);

const defaultCategories = [
  // PRODUCTIVE CATEGORIES
  {
    name: 'Development',
    type: 'productive',
    domains: [
      'github.com',
      'gitlab.com',
      'bitbucket.org',
      'stackoverflow.com',
      'stackexchange.com'
    ],
    applications: [
      'Visual Studio Code',
      'Code',
      'WebStorm',
      'PyCharm',
      'IntelliJ IDEA',
      'Sublime Text',
      'Atom',
      'Vim',
      'Emacs'
    ]
  },
  {
    name: 'Documentation',
    type: 'productive',
    domains: [
      'docs.microsoft.com',
      'developer.mozilla.org',
      'docs.python.org',
      'nodejs.org',
      'reactjs.org',
      'vuejs.org',
      'angular.io',
      'django-project.com'
    ],
    applications: []
  },
  {
    name: 'Design & Creative',
    type: 'productive',
    domains: [
      'figma.com',
      'dribbble.com',
      'behance.net',
      'canva.com'
    ],
    applications: [
      'Figma',
      'Adobe Photoshop',
      'Adobe Illustrator',
      'Sketch',
      'GIMP'
    ]
  },
  {
    name: 'Project Management',
    type: 'productive',
    domains: [
      'trello.com',
      'asana.com',
      'monday.com',
      'jira.atlassian.com',
      'notion.so',
      'linear.app'
    ],
    applications: []
  },
  {
    name: 'Cloud & DevOps',
    type: 'productive',
    domains: [
      'console.aws.amazon.com',
      'console.cloud.google.com',
      'portal.azure.com',
      'heroku.com',
      'vercel.com',
      'netlify.com'
    ],
    applications: [
      'Docker Desktop',
      'Terminal',
      'iTerm',
      'Windows Terminal',
      'Postman'
    ]
  },
  {
    name: 'Learning',
    type: 'productive',
    domains: [
      'udemy.com',
      'coursera.org',
      'edx.org',
      'khanacademy.org',
      'codecademy.com',
      'freecodecamp.org',
      'pluralsight.com'
    ],
    applications: []
  },

  // NEUTRAL CATEGORIES
  {
    name: 'Communication',
    type: 'neutral',
    domains: [
      'gmail.com',
      'outlook.com',
      'mail.google.com',
      'calendar.google.com'
    ],
    applications: [
      'Slack',
      'Microsoft Teams',
      'Discord',
      'Zoom',
      'Skype',
      'Thunderbird',
      'Mail'
    ]
  },
  {
    name: 'File Management',
    type: 'neutral',
    domains: [
      'drive.google.com',
      'dropbox.com',
      'onedrive.live.com'
    ],
    applications: [
      'Finder',
      'File Explorer',
      'Nautilus',
      'Dolphin'
    ]
  },
  {
    name: 'System Tools',
    type: 'neutral',
    domains: [],
    applications: [
      'System Preferences',
      'Settings',
      'Control Panel',
      'Activity Monitor',
      'Task Manager'
    ]
  },

  // DISTRACTING CATEGORIES
  {
    name: 'Social Media',
    type: 'distracting',
    domains: [
      'facebook.com',
      'twitter.com',
      'instagram.com',
      'tiktok.com',
      'linkedin.com',
      'snapchat.com',
      'reddit.com',
      'pinterest.com'
    ],
    applications: []
  },
  {
    name: 'Entertainment',
    type: 'distracting',
    domains: [
      'youtube.com',
      'netflix.com',
      'hulu.com',
      'twitch.tv',
      'spotify.com',
      'soundcloud.com',
      'vimeo.com'
    ],
    applications: [
      'Spotify',
      'iTunes',
      'Music',
      'VLC'
    ]
  },
  {
    name: 'News & Media',
    type: 'distracting',
    domains: [
      'cnn.com',
      'bbc.com',
      'nytimes.com',
      'theguardian.com',
      'techcrunch.com',
      'theverge.com',
      'medium.com'
    ],
    applications: []
  },
  {
    name: 'Shopping',
    type: 'distracting',
    domains: [
      'amazon.com',
      'ebay.com',
      'aliexpress.com',
      'walmart.com',
      'target.com',
      'etsy.com'
    ],
    applications: []
  },
  {
    name: 'Gaming',
    type: 'distracting',
    domains: [
      'steampowered.com',
      'epicgames.com',
      'ea.com',
      'twitch.tv'
    ],
    applications: [
      'Steam',
      'Epic Games',
      'Minecraft',
      'League of Legends'
    ]
  }
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskflow';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing categories`);
      console.log('   Delete them first? (This will remove all categories)');
      console.log('   To delete: db.categories.deleteMany({})');
      console.log('   Then run this script again.');
      process.exit(0);
    }

    // Insert default categories
    console.log(`📦 Inserting ${defaultCategories.length} default categories...`);
    
    const inserted = await Category.insertMany(defaultCategories);
    
    console.log('');
    console.log('✅ Successfully created default categories!');
    console.log('');
    console.log('📊 Summary:');
    
    const productive = inserted.filter(c => c.type === 'productive').length;
    const neutral = inserted.filter(c => c.type === 'neutral').length;
    const distracting = inserted.filter(c => c.type === 'distracting').length;
    
    console.log(`   🟢 Productive: ${productive} categories`);
    console.log(`   🟡 Neutral: ${neutral} categories`);
    console.log(`   🔴 Distracting: ${distracting} categories`);
    console.log('');
    console.log('📋 Categories created:');
    
    inserted.forEach(cat => {
      const emoji = cat.type === 'productive' ? '🟢' : cat.type === 'neutral' ? '🟡' : '🔴';
      const domainCount = cat.domains.length;
      const appCount = cat.applications.length;
      console.log(`   ${emoji} ${cat.name} (${domainCount} domains, ${appCount} apps)`);
    });
    
    console.log('');
    console.log('🎉 Setup complete! Your productivity tracking will now categorize activities automatically.');
    console.log('');
    console.log('💡 To customize:');
    console.log('   - Add your own categories via API: POST /api/categories');
    console.log('   - Edit categories in MongoDB: db.categories.find()');
    console.log('   - Or modify this seed file and run again');

  } catch (error) {
    console.error('❌ Error seeding categories:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('');
    console.log('👋 Disconnected from MongoDB');
  }
}

// Run the seed
seedCategories();
