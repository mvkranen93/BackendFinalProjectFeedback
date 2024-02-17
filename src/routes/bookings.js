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

// Step 1 - Fetch all bookings
router.get("/", authenticateToken, async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany();
    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Step 2 - Create a new booking
router.post("/", authenticateToken, async (req, res) => {
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
router.get("/:id", authenticateToken, async (req, res) => {
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
router.put("/:id", authenticateToken, async (req, res) => {
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
router.delete("/:id", authenticateToken, async (req, res) => {
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