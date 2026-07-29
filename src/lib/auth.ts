import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_jwt_secret_for_legalqa_2026_visionos_os';

export interface UserTokenPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  organizationId: string;
}

export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
  } catch (error) {
    return null;
  }
}

// Role hierarchy definition
export const ROLE_HIERARCHY: Record<Role, number> = {
  VIEWER: 0,
  PARALEGAL: 1,
  COMPLIANCE_OFFICER: 2,
  ASSOCIATE: 3,
  SENIOR_LAWYER: 4,
  PARTNER: 5,
  ADMIN: 6,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
