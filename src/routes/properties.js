import express from "express";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authenticateToken from "./login.js"

const prisma = new PrismaClient();
const router = express.Router();



// Step 1 - Fetch all properties
router.get("/",  async (req, res) => {
  try {
    const properties = await prisma.property.findMany();
    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new property
router.post("/", async (req, res) => {
  const { hostId, title, description, location, pricePerNight, bedroomCount, bathRoomCount, maxGuestCount, rating } = req.body;

  if (!hostId || !title || !description || !location || !pricePerNight || !bedroomCount || !bathRoomCount || !maxGuestCount || !rating) {
    return res.status(400).json({ error: 'All fields are required' });
  }

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
router.get("/:id",  async (req, res) => {
  const { id } = req.params;

  try {
    const property = await prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a property
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { hostId, title, description, location, pricePerNight, bedroomCount, bathRoomCount, maxGuestCount, rating } = req.body;

  try {
    const existingProperty = await prisma.property.findUnique({
      where: { id },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

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
router.delete("/:id", async (req, res) => {
  const propertyId = req.params.id;

  try {
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existingProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    await prisma.property.delete({
      where: { id: propertyId },
    });

    res.status(200).json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});






export default router;