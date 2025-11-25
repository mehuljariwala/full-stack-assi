import { Router } from "express";
import type { Request, Response } from "express";
import type { User } from "../types/index.js";
import { LRUCache, userCache } from "../cache/LRUCache.js";
import { userRequestQueue } from "../queue/RequestQueue.js";

const router = Router();

// Mock user database
const mockUsers: Map<number, User> = new Map([
  [1, { id: 1, name: "John Doe", email: "john@example.com" }],
  [2, { id: 2, name: "Jane Smith", email: "jane@example.com" }],
  [3, { id: 3, name: "Alice Johnson", email: "alice@example.com" }],
]);

// Track next user ID for new users
let nextUserId = 4;

/**
 * Simulate database fetch with delay
 */
async function simulateDatabaseFetch(userId: number): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.get(userId);
      resolve(user ?? null);
    }, 200); // 200ms delay as specified
  });
}

/**
 * GET /users/:id
 * Retrieve user data by ID with caching
 */
router.get("/:id", async (req: Request, res: Response) => {
  const startTime = Date.now();
  const userId = parseInt(req.params.id ?? "", 10);

  // Validate user ID
  if (isNaN(userId) || userId <= 0) {
    res.status(400).json({
      error: "Bad Request",
      message: "Invalid user ID. Must be a positive integer.",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  const cacheKey = `user:${userId}`;

  // Check cache first
  const cachedUser = (userCache as LRUCache<User>).get(cacheKey);
  if (cachedUser) {
    const responseTime = Date.now() - startTime;
    (userCache as LRUCache<User>).recordResponseTime(responseTime);
    res.setHeader("X-Cache", "HIT");
    res.setHeader("X-Response-Time", `${responseTime}ms`);
    res.json({
      success: true,
      data: cachedUser,
      cached: true,
      responseTime,
    });
    return;
  }

  try {
    // Use request queue for deduplication of concurrent requests
    const user = await userRequestQueue.execute(cacheKey, async () => {
      // Double-check cache (another request might have just populated it)
      const cached = (userCache as LRUCache<User>).get(cacheKey);
      if (cached) return cached;

      // Fetch from "database"
      return simulateDatabaseFetch(userId);
    });

    if (!user) {
      res.status(404).json({
        error: "Not Found",
        message: `User with ID ${userId} does not exist.`,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Cache the result
    (userCache as LRUCache<User>).set(cacheKey, user as User);

    const responseTime = Date.now() - startTime;
    (userCache as LRUCache<User>).recordResponseTime(responseTime);

    res.setHeader("X-Cache", "MISS");
    res.setHeader("X-Response-Time", `${responseTime}ms`);
    res.json({
      success: true,
      data: user,
      cached: false,
      responseTime,
    });
  } catch {
    res.status(500).json({
      error: "Internal Server Error",
      message: "An error occurred while fetching user data.",
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /users
 * Create a new user
 */
router.post("/", (req: Request, res: Response) => {
  const { name, email } = req.body as { name?: string; email?: string };

  // Validate input
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      error: "Bad Request",
      message: "Name is required and must be a non-empty string.",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({
      error: "Bad Request",
      message: "Valid email address is required.",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Check for duplicate email
  for (const user of mockUsers.values()) {
    if (user.email.toLowerCase() === email.toLowerCase()) {
      res.status(409).json({
        error: "Conflict",
        message: "A user with this email already exists.",
        timestamp: new Date().toISOString(),
      });
      return;
    }
  }

  // Create new user
  const newUser: User = {
    id: nextUserId++,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    createdAt: new Date(),
  };

  // Add to mock database
  mockUsers.set(newUser.id, newUser);

  // Cache the new user
  const cacheKey = `user:${newUser.id}`;
  (userCache as LRUCache<User>).set(cacheKey, newUser);

  res.status(201).json({
    success: true,
    data: newUser,
    message: "User created successfully.",
  });
});

/**
 * GET /users
 * List all users (for debugging/testing)
 */
router.get("/", (_req: Request, res: Response) => {
  const users = Array.from(mockUsers.values());
  res.json({
    success: true,
    data: users,
    count: users.length,
  });
});

export { router as userRouter, mockUsers };
