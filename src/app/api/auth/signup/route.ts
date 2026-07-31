import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, organizationName, role } = await req.json();

    if (!email || !password || !name || !organizationName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const trimmedOrgName = organizationName.trim();

    // Check if organization already exists (case-insensitive)
    let organization = await prisma.organization.findFirst({
      where: {
        name: {
          equals: trimmedOrgName,
          mode: 'insensitive',
        },
      },
    });

    let isNewOrg = false;
    if (!organization) {
      organization = await prisma.organization.create({
        data: { name: trimmedOrgName },
      });
      isNewOrg = true;
    }

    // Hash password
    const hashedPassword = hashPassword(password);

    // Determine role (ADMIN for creator of new org, ASSOCIATE for joining existing org)
    const userRole = isNewOrg ? (role || 'ADMIN') : (role && role !== 'ADMIN' ? role : 'ASSOCIATE');

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: userRole,
        organizationId: organization.id,
      },
    });

    // Log audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SIGNUP',
        details: isNewOrg
          ? `User registered and created new organization '${trimmedOrgName}'.`
          : `User registered and joined existing organization '${trimmedOrgName}'.`,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      organizationId: user.organizationId,
    });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationId: user.organizationId,
      },
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
