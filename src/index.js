import express from "express";
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";
import bodyParser from 'body-parser';
import jwt from 'jsonwebtoken';
import winston from 'winston';
import dotenv from 'dotenv'; // Importeer dotenv
dotenv.config(); // Laad de omgevingsvariabelen vanuit .env

// Import your Prisma client
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const app = express();


// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'your-service-name' }, // Change 'your-service-name' to an appropriate service name
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' }),
  ],
});

// Middleware to log request duration
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      message: 'Request processed',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });
  next();
});


// Sentry configuration

Sentry.init({
  dsn: process.env.SENTRY_DSN, // Replace with your Sentry DSN
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app }),
    new ProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});

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

// Middleware to handle JSON body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// The request handler must be the first middleware on the app
app.use(Sentry.Handlers.requestHandler());

// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// Root route
app.get("/", function rootHandler(req, res) {
  res.end("Hello world!");


});



// --------------------------------- BEGIN LOGIN ENDPOINTS ------------------------------

// Step 0 - login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Example: Fetch user from the database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, '39393jfjdKER74hjrejw934', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login Endpoint Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Protected route
app.get("/protected-route", authenticateToken, (req, res) => {
  // Access the authenticated user using req.user
  res.json({ message: "This is a protected route", user: req.user });
});

// --------------------------------- END LOGIN ENDPOINTS -------------------------------
//-----------------------------------IMPORTANT TO KNOW----------------------------------
// All endpoints defined below are using an authentication middleware using JWT


// -------------------------- ENDPOINTS WITH QUERY PARAMETERS -------------------------------

// First - /properties?location=Amsterdam&pricePerNight=88
app.get("/properties", authenticateToken, async (req, res) => {
  const { location, pricePerNight } = req.query;

  try {
    let filters = {};

    // Voeg de locatie toe aan de filters als deze is opgegeven
    if (location) {
      filters.location = location.toString();
    }

    // Voeg prijs per nacht toe aan de filters als deze is opgegeven
    if (pricePerNight) {
      filters.pricePerNight = parseFloat(pricePerNight);
    }

    // Haal eigenschappen op met toegepaste filters
    const properties = await prisma.property.findMany({
      where: filters,
    });

    res.status(200).json(properties);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Second - /bookings?userID=a1234567-89ab-cdef-0123-456789abcdef
app.get("/bookings", authenticateToken, async (req, res) => {
  const { userId } = req.query;

  try {
    // Define filters based on query parameters
    const filters = {
      ...(userId && { userId }),
    };

    // Fetch bookings with applied filters
    const bookings = await prisma.booking.findMany({
      where: filters,
    });

    res.status(200).json(bookings);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Third & Fourth - /users endpoint with both username and email query parameters
app.get("/users", authenticateToken, async (req, res) => {
  const { username, email } = req.query;

  try {
    // Define filters based on query parameters
    const filters = {
      ...(username && { username }),
      ...(email && { email }),
    };

    // Fetch users with applied filters
    const users = await prisma.user.findMany({
      where: filters,
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Fifth - /hosts?name=Linda+Smith
app.get("/hosts", authenticateToken, async (req, res) => {
  const { name } = req.query;

  try {
    // Define filters based on query parameters
    const filters = {
      ...(name && { name }),
    };

    // Fetch hosts with applied filters
    const hosts = await prisma.host.findMany({
      where: filters,
    });

    res.status(200).json(hosts);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


// -------------------------- ENDPOINTS WITH QUERY PARAMETERS -------------------------------
// --------------------------------- BEGIN USER ENDPOINTS ------------------------------

import usersRoutes from "./routes/users.js";
app.use("/users", usersRoutes);

// --------------------------------- END USER ENDPOINTS ------------------------------
// --------------------------------- BEGIN BOOKING ENDPOINTS ------------------------------

import bookingsRoutes from "./routes/bookings.js";
app.use("/bookings", bookingsRoutes);


// --------------------------------- END BOOKING ENDPOINTS ------------------------------
// --------------------------------- BEGIN PROPERTY ENDPOINTS ------------------------------


import propertiesRoutes from "./routes/properties.js";
app.use("/properties", propertiesRoutes);


// --------------------------------- END PROPERTY ENDPOINTS ------------------------------
// --------------------------------- BEGIN REVIEW ENDPOINTS ------------------------------

import reviewsRoutes from "./routes/reviews.js";
app.use("/reviews", reviewsRoutes);


// --------------------------------- END REVIEW ENDPOINTS ------------------------------
// --------------------------------- BEGIN HOST ENDPOINTS ------------------------------

import hostsRoutes from "./routes/hosts.js";
app.use("/hosts", hostsRoutes);


// --------------------------------- END HOST ENDPOINTS ------------------------------
// --------------------------------- BEGIN AMENITY ENDPOINTS ------------------------------

import amenitiesRoutes from "./routes/amenities.js";
app.use("/amenities", amenitiesRoutes);


// --------------------------------- END AMENITY ENDPOINTS ------------------------------

// Test route for Sentry
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});


// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err);
  logger.error(err.message);

  res.status(500).json({ error: "An error occurred on the server, please double-check your request!" });
});

// The error handler must be registered before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// Optional fallthrough error handler
app.use(function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(res.sentry + "\n");
});

app.listen(3000, () => {
  console.log("Server is listening on port 3000");
});