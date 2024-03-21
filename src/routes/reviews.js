import express from "express";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authenticateToken from "./login.js"

const prisma = new PrismaClient();
const router = express.Router();


// Step 1 - Fetch all reviews
router.get("/",  async (req, res) => {
  try {
    const reviews = await prisma.review.findMany();
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new review
router.post("/",  async (req, res) => {
  const { userId, propertyId, rating, comment } = req.body;

  if (!userId || !propertyId || !rating || !comment) {
    return res.status(400).json({ error: 'All fields are required' });
  }

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
router.get("/:id",  async (req, res) => {
  const { id } = req.params;

  try {
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.status(200).json(review);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a review
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { userId, propertyId, rating, comment } = req.body;

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

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
router.delete("/:id",  async (req, res) => {
  const reviewId = req.params.id;

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return res.status(404).json({ error: 'Review not found' });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


export default router;