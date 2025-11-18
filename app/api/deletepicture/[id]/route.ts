import { utapi } from "@/server/uploadthing";
import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string }, }
) {
  try {
    // Get authenticated user
    const session = await getServerSession();
    
    if (!session?.user?.name) {
      return NextResponse.json({ status: 401, statusText: 'Unauthorized' });
    }

    const fileKey = params.id;
    const username = session.user.name;

    // Delete file from UploadThing
    await utapi.deleteFiles(fileKey);
    console.log('File deleted from UploadThing:', fileKey);

    // Update user's picture in database to default
    await prisma.user.update({
      where: {
        name: username,
      },
      data: {
        picture: '/Default_pfp.png',
      },
    });
    console.log('Database updated with default picture for user:', username);

    return NextResponse.json({ 
      status: 200, 
      statusText: 'File deleted successfully',
      picture: '/Default_pfp.png'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ 
      status: 500, 
      statusText: 'Internal Server Error',
      error: error.message
    });
  } finally {
    await prisma.$disconnect();
  }
}
