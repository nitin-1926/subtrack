import { compare, hash } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken';
import { prisma } from './prisma';

// Constants
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SESSION_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days

// User types
export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration extends UserCredentials {
  name?: string;
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return compare(password, hashedPassword);
}

// Create JWT token
export function createToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, {
    expiresIn: '30d',
  });
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    return verify(token, JWT_SECRET) as { userId: string };
  } catch (error) {
    return null;
  }
}

// Create session
export async function createSession(userId: string): Promise<string> {
  const token = createToken(userId);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

// Get user from token
export async function getUserFromToken(token: string) {
  const payload = verifyToken(token);
  if (!payload) return null;

  // Check if session exists and is valid
  const session = await prisma.session.findUnique({
    where: {
      token,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired
    if (session) {
      await prisma.session.delete({
        where: { id: session.id },
      });
    }
    return null;
  }

  return session.user;
}

// Register user
export async function registerUser({
  email,
  password,
  name,
}: UserRegistration) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
    },
  });

  // Create session
  const token = await createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}

// Login user
export async function loginUser({ email, password }: UserCredentials) {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password);

  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  // Create session
  const token = await createSession(user.id);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  };
}

// Logout user
export async function logoutUser(token: string) {
  await prisma.session.deleteMany({
    where: {
      token,
    },
  });
}
