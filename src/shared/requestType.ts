import { Request } from "express";

export interface AuthUser extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export interface AuthRequestWithBusiness extends Request {
  user?: {
    userId: string;
    email: string;
    role?: string;
    businessId?: string;
    status?: string;
  };
}
