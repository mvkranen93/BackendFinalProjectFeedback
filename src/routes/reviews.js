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

// Step 1 - Fetch all reviews
router.get("/", authenticateToken, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany();
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new review
router.post("/", authenticateToken, async (req, res) => {
  const { userId, propertyId, rating, comment } = req.body;

  try {
    const newReview = await prisma.review.create({
      data: {
        userId,
        propertyId,
        rating,
        comment,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 3 - Fetch a single review
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(200).json({ error: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a review
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { userId, propertyId, rating, comment } = req.body;

  try {
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        userId,
        propertyId,
        rating,
        comment,
      },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 5 - Remove a review
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.review.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;