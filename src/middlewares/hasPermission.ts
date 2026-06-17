import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/httpErrors";
import { Roles, ROLE_PERMISSIONS } from "../utils/userPermission";
import { ACCOUNT_TYPE } from "../features/auth/user.constant";
import { log } from "winston";
import { logger } from "./logHandler";

/**
 * STEPS PERFORMED:
 * 1. Get the permission (via function parameter)
 * 2. Get the roles assigned to user (from req.user)
 * 3. Get all the permissions of that role mapped in ROLE_PERMISSIONS
 * 4. Check if the permission exists in the retrieved permission list
 * 5. If exists, go to next line of code; else, throw forbidden error
 */
export const hasPermission = (permissionName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const accountType = req.user?.accountType;
    const userRole = req.user?.role;

    if (accountType === ACCOUNT_TYPE.ADMIN) {
      return next();
    }

    console.log("user role", userRole);

    if (!userRole) {
      logger.error("Role required for business account type");
      return next(new ForbiddenError("Permission denied"));
    }

    //other user type need permission
    const allowPermissions = ROLE_PERMISSIONS[userRole as Roles];
    console.log("allow permissions", allowPermissions);

    if (allowPermissions && allowPermissions.includes(permissionName)) {
      return next();
    }

    next(new ForbiddenError("Permission denied"));
  };
};
