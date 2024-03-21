import express from "express";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authenticateToken from "./login.js"

const prisma = new PrismaClient();
const router = express.Router();



// Step 1 - Fetch all hosts
router.get("/",  async (req, res) => {
  try {
    const hosts = await prisma.host.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
        aboutMe: true,
        listings: false, 
      },
    });
    res.status(200).json(hosts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new host
router.post("/", async (req, res) => {
  const { username, password, name, email, phoneNumber, profilePicture, aboutMe } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const newHost = await prisma.host.create({
      data: {
        username,
        password,
        name,
        email,
        phoneNumber,
        profilePicture,
        aboutMe,
      },
    });

    res.status(201).json(newHost);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// Step 3 - Fetch a single host
router.get("/:id",  async (req, res) => {
  const { id } = req.params;

  try {
    const host = await prisma.host.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        phoneNumber: true,
        profilePicture: true,
        aboutMe: true,
        listings: true,
      },
    });

    if (!host) {
      return res.status(404).json({ error: 'Host not found' });
    }

    res.status(200).json(host);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a host
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { username, password, name, email, phoneNumber, profilePicture, aboutMe } = req.body;

  try {
    const existingHost = await prisma.host.findUnique({
      where: { id },
    });

    if (!existingHost) {
      return res.status(404).json({ error: 'Host not found' });
    }

    const updatedHost = await prisma.host.update({
      where: { id },
      data: {
        username,
        password,
        name,
        email,
        phoneNumber,
        profilePicture,
        aboutMe,
      },
    });

    res.status(200).json(updatedHost);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// Step 5 - Remove a host
router.delete("/:id", async (req, res) => {
  const hostId = req.params.id;

  try {
    const existingHost = await prisma.host.findUnique({
      where: { id: hostId },
    });

    if (!existingHost) {
      return res.status(404).json({ error: 'Host not found' });
    }

    await prisma.host.delete({
      where: { id: hostId },
    });

    res.status(200).json({ message: 'Host deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});




export default router;