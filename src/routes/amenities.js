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


// Step 1 - Fetch all amenities
router.get("/", authenticateToken, async (req, res) => {
  try {
    const amenities = await prisma.amenity.findMany();
    res.status(200).json(amenities);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new amenity
router.post("/", authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    const newAmenity = await prisma.amenity.create({
      data: {
        name,
      },
    });

    res.status(201).json(newAmenity);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 3 - Fetch a single amenity
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const amenity = await prisma.amenity.findUnique({
      where: { id },
    });

    if (!amenity) {
      return res.status(200).json({ error: 'Amenity not found' });
    }

    res.status(200).json(amenity);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update an amenity
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedAmenity = await prisma.amenity.update({
      where: { id },
      data: {
        name,
      },
    });

    res.status(200).json(updatedAmenity); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 5 - Remove an amenity
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.amenity.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Amenity deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


export default router;