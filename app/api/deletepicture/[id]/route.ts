import { utapi } from "@/server/uploadthing";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { id: string }, }
) {
  const fileKey = params.id;

  try {
    await utapi.deleteFiles(fileKey);
    return NextResponse.json({ status: 200, statusText: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ status: 500, statusText: 'Internal Server Error' });
  }
}
