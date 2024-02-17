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


// Step 1 - Fetch all hosts
router.get("/", authenticateToken, async (req, res) => {
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
router.post("/", authenticateToken, async (req, res) => {
  const { username, password, name, email, phoneNumber, profilePicture, aboutMe } = req.body;

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
router.get("/:id", authenticateToken, async (req, res) => {
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
      return res.status(200).json({ error: 'Host not found' });
    }

    res.status(200).json(host);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a host
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { username, password, name, email, phoneNumber, profilePicture, aboutMe } = req.body;

  try {
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
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.host.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Host deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});



export default router;