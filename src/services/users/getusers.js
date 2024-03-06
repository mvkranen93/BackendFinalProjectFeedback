import { PrismaClient } from "@prisma/client";

const getUsers2 = async (username, email) => {
    const prisma = new PrismaClient();
console.log ("hallo")
    const users = await prisma.user.findMany({
        where: {
            username: username,
            email: email,
        },
        select: {
            id: true,
            username: true,
            name: true,
            email: true,
            phoneNumber: true,
            profilePicture: true,
            password: false,
        }
    });

    return users;
};

export default getUsers2;