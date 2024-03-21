// seed.js

import { PrismaClient } from "@prisma/client";
import usersData from "../src/data/users.json" assert { type: "json" };
import reviewsData from "../src/data/reviews.json" assert { type: "json" };
import bookingsData from "../src/data/bookings.json" assert { type: "json" };
import propertiesData from "../src/data/properties.json" assert { type: "json" };
import amenitiesData from "../src/data/amenities.json" assert { type: "json" };
import hostsData from "../src/data/hosts.json" assert { type: "json" };

const prisma = new PrismaClient({ log: ["query", "info", "warn", "error"] });

async function main() {
  try {
    // Clear existing data
    await prisma.review.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.amenity.deleteMany({});
    await prisma.property.deleteMany({});
    await prisma.host.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed new data
    const { users } = usersData;
    const { hosts } = hostsData;
    const { properties } = propertiesData;
    const { amenities } = amenitiesData;
    const { bookings } = bookingsData;
    const { reviews } = reviewsData;


    for (const user of users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: user,
      });
    }

    for (const host of hosts) {
      await prisma.host.upsert({
        where: { id: host.id },
        update: {},
        create: host,
      });
    }

    for (const property of properties) {
      await prisma.property.upsert({
        where: { id: property.id },
        update: {},
        create: {
          id: property.id,
          title: property.title,
          description: property.description,
          location: property.location,
          pricePerNight: property.pricePerNight,
          bedroomCount: property.bedroomCount,
          bathRoomCount: property.bathRoomCount,
          maxGuestCount: property.maxGuestCount,
          rating: property.rating,

          // connect to other entities
          host: { connect: { id: property.hostId } },
          bookings: {
            connect: property.bookingIds
              ? property.bookingIds.map((id) => ({ id }))
              : [],
          },
          reviews: {
            connect: property.reviewIds
              ? property.reviewIds.map((id) => ({ id }))
              : [],
          },
        },
      });
    }

    for (const amenity of amenities) {
      await prisma.amenity.upsert({
        where: { id: amenity.id },
        update: {},
        create: amenity,
      });
    }
    
    for (const booking of bookings) {
      await prisma.booking.upsert({
        where: { id: booking.id },
        update: {},
        create: {
          id: booking.id,
          checkinDate: booking.checkinDate,
          checkoutDate: booking.checkoutDate,
          numberOfGuests: booking.numberOfGuests,
          totalPrice: booking.totalPrice,
          bookingStatus: booking.bookingStatus,

          // connect to other entities
          user: { connect: { id: booking.userId } },
          property: { connect: { id: booking.propertyId } },
        },
      });
    }

    for (const review of reviews) {
      await prisma.review.upsert({
        where: { id: review.id },
        update: {},
        create: {
          id: review.id,
          rating: review.rating,
          comment: review.comment,

          // connect to other entities
          user: { connect: { id: review.userId } },
          property: { connect: { id: review.propertyId } },
        },
      });
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
