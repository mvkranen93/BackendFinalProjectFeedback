import express from "express";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authenticateToken from "./login.js"

const prisma = new PrismaClient();
const router = express.Router();



// Step 1 - Fetch all amenities
router.get("/", async (req, res) => {
  try {
    const amenities = await prisma.amenity.findMany();
    res.status(200).json(amenities);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new amenity
router.post("/",  async (req, res) => {
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
router.get("/:id",  async (req, res) => {
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
router.put("/:id",  async (req, res) => {
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
router.delete("/:id",  async (req, res) => {
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