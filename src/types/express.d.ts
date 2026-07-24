import "express";

declare module "express" {
  export interface Request {
    user?: {
      userId: string;
      email: string;
      [key: string]: any;
    };
    business?: {
      status: string;
      businessId: string;
      role: string;
    };
    terminal?: {
      businessId: string;
      terminalId: string;
    };
    terminalUser?: {
      userId: string;
      name: string;
      email: string;
      role: string;
      type: string;
      terminalSessionId: string;
    };
  }
}
