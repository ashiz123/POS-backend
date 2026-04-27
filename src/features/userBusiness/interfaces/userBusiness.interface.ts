import { ClientSession, Document, Model, Types } from "mongoose";
import { IUserDocument } from "../../auth/interfaces/authInterface";
import { UserRole } from "../../auth/auth.type";

// export type UserRole =
//     | 'owner'
//     | 'admin'
//     | 'manager'
//     | 'cashier'
//     | 'accountant'
//     | 'user'
//     | 'viewer'

export const UserStatus = {
  PENDING: "pending",
  ACTIVE: "active",
  DISABLED: "disabled",
} as const;

export type UserPermission =
  | "read"
  | "write"
  | "update"
  | "delete"
  | "manage_users"
  | "manage_products"
  | "manage_inventory"
  | "manage_sales"
  | "manage_customers"
  | "manage_reports"
  | "manage_settings";

export type Department =
  | "sales"
  | "inventory"
  | "accounting"
  | "management"
  | "operations"
  | "customer_service";

export interface IUserBusinessProps {
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  role: UserRole;
  userStatus: "pending" | "active" | "disabled";
  activationToken?: string;
  startDate?: Date;
  endDate?: Date | null;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  notes?: string;
}

export interface AssignUserDTO {
  userId: string | Types.ObjectId;
  businessId: string | Types.ObjectId;
  role: string;
  createdBy?: string | Types.ObjectId;
  userStatus: "pending" | "active" | "disabled";
}

export interface UpdateUserRoleDTO {
  role?: string;
  status?: "pending" | "active" | "disabled";
  updatedBy?: string | Types.ObjectId;
}

export interface IUserBusinessDocument extends IUserBusinessProps, Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  //     hasPermission(permission: UserPermission): boolean
  //     hasAnyPermission(permissions: UserPermission[]): boolean
  //     hasAllPermissions(permissions: UserPermission[]): boolean
}

export interface IUserBusinessModel extends Model<IUserBusinessDocument> {
  // Static methods
  findActiveByUserId(userId: Types.ObjectId): Promise<IUserBusinessDocument[]>;
  findByBusinessAndRole(
    businessId: Types.ObjectId,
    role: UserRole,
    activeOnly?: boolean,
  ): Promise<IUserBusinessDocument[]>;
  findBusinessesByUserId(
    userId: Types.ObjectId,
  ): Promise<IUserBusinessDocument[]>;
  findUsersByBusinessId(
    businessId: Types.ObjectId,
  ): Promise<IUserBusinessDocument[]>;
}

export interface FindUserArgs {
  userId: string;
  businessId: string;
  role?: string;
  session?: ClientSession;
}

// Repository interfaces
export interface IUserBusinessRepository {
  assignUserWithSession(
    data: AssignUserDTO,
    session: ClientSession,
  ): Promise<IUserBusinessDocument>;
  getUserBusiness(
    userId: string,
    businessId: string,
  ): Promise<IUserBusinessDocument | null>;

  checkUserExist(businessId: string, userId: string): Promise<boolean>;
  getUserRole(userId: string, businessId: string): Promise<string | null>;
  removeUser(userId: string, businessId: string): Promise<boolean>;
  getBusinessUsers(businessId: string): Promise<IUserDocument[]>;
  getUserBusinesses(userId: string): Promise<IUserBusinessDocument[]>;
  findAndUpdateByUserIdWithSession({
    userId,
    businessId,
    role,
    session,
  }: FindUserArgs): Promise<IUserBusinessDocument | null>;
  findAndUpdateByToken(token: string): Promise<IUserBusinessDocument | null>;
  canUserAccessBusiness(userId: string, businessId: string): Promise<boolean>;
}

// Types for creating and updating user-business relationships
export type CreateUserBusinessInput = {
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  role: UserRole;
  permissions?: UserPermission[];
  department?: Department;
  isActive?: boolean;
  startDate?: Date;
  notes?: string;
  customSettings?: Record<string, unknown>;
  createdBy?: Types.ObjectId;
};

export type UpdateUserBusinessInput = {
  role?: UserRole;
  permissions?: UserPermission[];
  department?: Department;
  isActive?: boolean;
  endDate?: Date | null;
  notes?: string;
  customSettings?: Record<string, unknown>;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
};

export type UserBusinessQuery = {
  userId?: Types.ObjectId;
  businessId?: Types.ObjectId;
  role?: UserRole;
  department?: Department;
  isActive?: boolean;
  startDate?: { $gte?: Date; $lte?: Date };
  endDate?: { $gte?: Date; $lte?: Date } | null;
};

// Response types
export type UserBusinessResponse = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  businessId: Types.ObjectId;
  role: UserRole;
  permissions: UserPermission[];
  department?: Department;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  business?: {
    _id: Types.ObjectId;
    name: string;
    type?: string;
    status?: string;
  };
};

export type UserWithBusinessesResponse = {
  user: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    phone: string;
    status: string;
  };
  businesses: Array<{
    _id: Types.ObjectId;
    businessId: Types.ObjectId;
    role: UserRole;
    permissions: UserPermission[];
    department?: Department;
    isActive: boolean;
    business?: {
      _id: Types.ObjectId;
      name: string;
      type?: string;
      status?: string;
    };
  }>;
};

export type BusinessWithUsersResponse = {
  business: {
    _id: Types.ObjectId;
    name: string;
    type?: string;
    status?: string;
  };
  users: Array<{
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    role: UserRole;
    permissions: UserPermission[];
    department?: Department;
    isActive: boolean;
    user?: {
      _id: Types.ObjectId;
      name: string;
      email: string;
      phone: string;
      status: string;
    };
  }>;
};
