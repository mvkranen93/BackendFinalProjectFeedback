import express from "express";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const router = express.Router();

// Middleware to handle JWT authentication
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Extract the token without the "Bearer " prefix
  const tokenWithoutBearer = token.replace(/^Bearer\s/, '');

  jwt.verify(tokenWithoutBearer, '39393jfjdKER74hjrejw934', (err, user) => {
    if (err) {
      console.error('Authentication Error:', err);  // Log the error for debugging
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Check if the token has expired
    const decodedToken = jwt.decode(tokenWithoutBearer, { complete: true });

    if (decodedToken && decodedToken.payload.exp) {
      const expirationTime = new Date(decodedToken.payload.exp * 1000);
      const currentTime = new Date();

      if (expirationTime <= currentTime) {
        return res.status(401).json({ error: 'Token has expired' });
      }
    }

    console.log('Decoded User:', user);  // Log the decoded user for debugging

    req.user = user;
    next();
  });
}

// Step 1 - Fetch all users
router.get("/", authenticateToken, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new user
router.post("/", authenticateToken, async (req, res) => {
  const { username, password, name, email, phoneNumber, profilePicture } = req.body;

  try {
    const newUser = await prisma.user.create({
      data: { username, password, name, email, phoneNumber, profilePicture },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 3 - Fetch a single user
router.get("/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
        reviews: true,
        bookings: true,
      },
    });

    if (!user) {
      return res.status(200).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a user
router.put("/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;
  const { username, password, name, email, phoneNumber, profilePicture } = req.body;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username, password, name, email, phoneNumber, profilePicture },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 5 - Delete a user
router.delete("/:id", authenticateToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await prisma.user.delete({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
      },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;