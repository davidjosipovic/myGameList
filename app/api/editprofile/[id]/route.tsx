import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import { hash } from "bcrypt";

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  { params }: { params: { id: string }, }
) {
  const username = params.id;
  const body = await request.json();

  try {
    // Fetch the user based on the name
    const user = await prisma.user.findUnique({
      where: {
        name: username,
      },
    });

    if (!user) {
      return NextResponse.json({ status: 404, statusText: 'User not found' });
    }

    // Prepare the data object for updating
    const updateData = {
      info: body.info,
      name: body.name,
      password:user.password,
      picture:body.picture
    };

    // Conditionally update the password only if it's not empty
    if (typeof body.password === 'string' && body.password.trim() !== '') {
      updateData.password = await hash(body.password, 10);
    } else {
      // Use the original password from the database
      updateData.password = user.password;
    }

    // Update user's profile with the new data
    await prisma.user.update({
      where: {
        name: username,
      },
      data: updateData,
    });

    // Return a success response
    return NextResponse.json({ status: 200, statusText: 'Profile updated successfully' });
  } catch (error) {
    console.error("Error updating user profile:", error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}
