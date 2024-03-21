import express from "express";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authenticateToken from "./login.js"

const prisma = new PrismaClient();
const router = express.Router();



// Step 1 - Fetch all users
router.get("/", async (req, res, next) => {
  try {
      const { username, email } = req.query;
      const users = await getUsers2(username, email);
      res.json(users);
  } catch (error) {
      next(error);
  }
});


// Step 2 - Create a new user
router.post("/", async (req, res) => {
  const { username, password, name, email, phoneNumber, profilePicture } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

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
router.get("/:id",  async (req, res) => {
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
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a user
router.put("/:id", async (req, res) => {
  const userId = req.params.id;
  const { username, password, name, email, phoneNumber, profilePicture } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

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
router.delete("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


export default router;