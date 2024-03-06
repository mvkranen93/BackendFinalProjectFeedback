import express from "express";
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import authenticateToken from "./login.js"

const prisma = new PrismaClient();
const router = express.Router();



// Step 1 - Fetch all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new booking
router.post("/", async (req, res) => {
  const { userID, propertyId, checkinDate, checkoutDate, numberOfGuests, totalPrice, bookingStatus } = req.body;

  try {
    const newBooking = await prisma.booking.create({
      data: {
        userID,
        propertyId,
        checkinDate,
        checkoutDate,
        numberOfGuests,
        totalPrice,
        bookingStatus,
      },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 3 - Fetch a single booking
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(200).json({ error: 'Booking not found' });
    }

    res.status(200).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 4 - Update a booking
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { userID, propertyId, checkinDate, checkoutDate, numberOfGuests, totalPrice, bookingStatus } = req.body;

  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        userID,
        propertyId,
        checkinDate,
        checkoutDate,
        numberOfGuests,
        totalPrice,
        bookingStatus,
      },
    });

    res.status(200).json(updatedBooking);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 5 - Remove a booking
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.booking.delete({
      where: { id },
    });

    res.status(200).json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;