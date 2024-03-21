/*
  Warnings:

  - You are about to drop the column `userID` on the `Booking` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL DEFAULT 'default-user-id',
    "propertyId" TEXT NOT NULL,
    "checkinDate" DATETIME NOT NULL,
    "checkoutDate" DATETIME NOT NULL,
    "numberOfGuests" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "bookingStatus" TEXT NOT NULL
);
INSERT INTO "new_Booking" ("bookingStatus", "checkinDate", "checkoutDate", "id", "numberOfGuests", "propertyId", "totalPrice") SELECT "bookingStatus", "checkinDate", "checkoutDate", "id", "numberOfGuests", "propertyId", "totalPrice" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_propertyId_idx" ON "Booking"("propertyId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
