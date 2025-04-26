import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_jwt_secret_key_for_authentication';
const SALT_ROUNDS = 10;

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if session exists
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        // Delete expired session
        await prisma.session.delete({ where: { id: session.id } });
      }
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = session.user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Return user data (without password)
    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });

    // Create session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // Return user data (without password)
    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];

    // Delete session
    await prisma.session.deleteMany({
      where: { token },
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user data' });
  }
});

// Gmail account routes
app.get('/api/gmail-accounts', authenticate, async (req, res) => {
  try {
    const accounts = await prisma.gmailAccount.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json(accounts);
  } catch (error) {
    console.error('Get Gmail accounts error:', error);
    res.status(500).json({ message: 'Failed to get Gmail accounts' });
  }
});

// Subscription routes
app.get('/api/subscriptions', authenticate, async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        gmailAccount: {
          userId: req.user.id
        }
      },
      include: {
        gmailAccount: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    res.status(200).json(subscriptions);
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Failed to get subscriptions' });
  }
});

app.get('/api/subscriptions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const subscription = await prisma.subscription.findFirst({
      where: {
        id,
        gmailAccount: {
          userId: req.user.id
        }
      },
      include: {
        gmailAccount: {
          select: {
            email: true
          }
        }
      }
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    res.status(200).json(subscription);
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Failed to get subscription' });
  }
});

app.post('/api/subscriptions', authenticate, async (req, res) => {
  try {
    const { 
      gmailAccountId, 
      name, 
      amount, 
      currency = 'USD', 
      frequency = 'MONTHLY', 
      category, 
      lastBilledAt, 
      nextBillingAt, 
      status = 'ACTIVE' 
    } = req.body;
    
    // Verify the Gmail account belongs to the user
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: {
        id: gmailAccountId,
        userId: req.user.id
      }
    });
    
    if (!gmailAccount) {
      return res.status(403).json({ message: 'Gmail account not found or not authorized' });
    }
    
    const subscription = await prisma.subscription.create({
      data: {
        gmailAccountId,
        name,
        amount: parseFloat(amount),
        currency,
        frequency,
        category,
        lastBilledAt: lastBilledAt ? new Date(lastBilledAt) : null,
        nextBillingAt: nextBillingAt ? new Date(nextBillingAt) : null,
        status
      }
    });
    
    res.status(201).json(subscription);
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Failed to create subscription' });
  }
});

app.put('/api/subscriptions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      amount, 
      currency, 
      frequency, 
      category, 
      lastBilledAt, 
      nextBillingAt, 
      status 
    } = req.body;
    
    // Verify the subscription belongs to the user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id,
        gmailAccount: {
          userId: req.user.id
        }
      }
    });
    
    if (!existingSubscription) {
      return res.status(404).json({ message: 'Subscription not found or not authorized' });
    }
    
    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        currency: currency !== undefined ? currency : undefined,
        frequency: frequency !== undefined ? frequency : undefined,
        category: category !== undefined ? category : undefined,
        lastBilledAt: lastBilledAt !== undefined ? new Date(lastBilledAt) : undefined,
        nextBillingAt: nextBillingAt !== undefined ? new Date(nextBillingAt) : undefined,
        status: status !== undefined ? status : undefined
      }
    });
    
    res.status(200).json(updatedSubscription);
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Failed to update subscription' });
  }
});

app.delete('/api/subscriptions/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the subscription belongs to the user
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        id,
        gmailAccount: {
          userId: req.user.id
        }
      }
    });
    
    if (!existingSubscription) {
      return res.status(404).json({ message: 'Subscription not found or not authorized' });
    }
    
    await prisma.subscription.delete({
      where: { id }
    });
    
    res.status(200).json({ message: 'Subscription deleted successfully' });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({ message: 'Failed to delete subscription' });
  }
});

// Expense routes
app.get('/api/expenses', authenticate, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: {
        gmailAccount: {
          userId: req.user.id
        }
      },
      include: {
        gmailAccount: {
          select: {
            email: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    res.status(200).json(expenses);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: 'Failed to get expenses' });
  }
});

app.get('/api/expenses/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const expense = await prisma.expense.findFirst({
      where: {
        id,
        gmailAccount: {
          userId: req.user.id
        }
      },
      include: {
        gmailAccount: {
          select: {
            email: true
          }
        }
      }
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.status(200).json(expense);
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ message: 'Failed to get expense' });
  }
});

app.post('/api/expenses', authenticate, async (req, res) => {
  try {
    const { 
      gmailAccountId, 
      amount, 
      currency = 'USD', 
      merchant, 
      category, 
      date, 
      description, 
      receiptId 
    } = req.body;
    
    // Verify the Gmail account belongs to the user
    const gmailAccount = await prisma.gmailAccount.findFirst({
      where: {
        id: gmailAccountId,
        userId: req.user.id
      }
    });
    
    if (!gmailAccount) {
      return res.status(403).json({ message: 'Gmail account not found or not authorized' });
    }
    
    const expense = await prisma.expense.create({
      data: {
        gmailAccountId,
        amount: parseFloat(amount),
        currency,
        merchant,
        category,
        date: new Date(date),
        description,
        receiptId
      }
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

app.put('/api/expenses/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      amount, 
      currency, 
      merchant, 
      category, 
      date, 
      description, 
      receiptId 
    } = req.body;
    
    // Verify the expense belongs to the user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        gmailAccount: {
          userId: req.user.id
        }
      }
    });
    
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found or not authorized' });
    }
    
    const updatedExpense = await prisma.expense.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        currency: currency !== undefined ? currency : undefined,
        merchant: merchant !== undefined ? merchant : undefined,
        category: category !== undefined ? category : undefined,
        date: date !== undefined ? new Date(date) : undefined,
        description: description !== undefined ? description : undefined,
        receiptId: receiptId !== undefined ? receiptId : undefined
      }
    });
    
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify the expense belongs to the user
    const existingExpense = await prisma.expense.findFirst({
      where: {
        id,
        gmailAccount: {
          userId: req.user.id
        }
      }
    });
    
    if (!existingExpense) {
      return res.status(404).json({ message: 'Expense not found or not authorized' });
    }
    
    await prisma.expense.delete({
      where: { id }
    });
    
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
