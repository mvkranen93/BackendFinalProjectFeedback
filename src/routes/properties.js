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


// Step 1 - Fetch all properties
router.get("/", authenticateToken, async (req, res) => {
  try {
    const properties = await prisma.property.findMany();
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new property
router.post("/", authenticateToken, async (req, res) => {
  const { hostId, title, description, location, pricePerNight, bedroomCount, bathRoomCount, maxGuestCount, rating } = req.body;

  try {
    const newProperty = await prisma.property.create({
      data: {
        hostId,
        title,
        description,
        location,
        pricePerNight,
        bedroomCount,
        bathRoomCount,
        maxGuestCount,
        rating,
      },
    });

    res.status(201).json(newProperty);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 3 - Fetch a single property
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(200).json({ error: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a property
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { hostId, title, description, location, pricePerNight, bedroomCount, bathRoomCount, maxGuestCount, rating } = req.body;

  try {
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        hostId,
        title,
        description,
        location,
        pricePerNight,
        bedroomCount,
        bathRoomCount,
        maxGuestCount,
        rating,
      },
    });

    res.status(200).json(updatedProperty);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 5 - Remove a property
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.property.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});





export default router;