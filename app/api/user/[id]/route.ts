import { PrismaClient } from '@prisma/client';
import {useRouter} from 'next/navigation';
import { NextRequest,NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(req:NextRequest) {
    if (req.method !== 'GET') {
        return NextResponse.json({status:405}); // Method Not Allowed
    }

    // Extract the email from the route parameter
    const email = router.useSearchParams.id;

    // Validate email format if needed

    // Fetch the user based on the email
    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' },{status:404});
    }

    // If there are sensitive fields, they should be omitted before sending the response
    // delete user.password;  // for example, if there's a password field

    return NextResponse.json(user);
}
