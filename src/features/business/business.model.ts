//status : active | inactive | pending
export interface BusinessProps {
  name: string;
  address: string;
  status: "pending" | "active" | "disabled";
  currency?: string;
  activationToken?: string;
  website?: string;
  email?: string;
  phone?: string;
  businessType?: string;
}

export interface CreateBusinessDTO {
  name: string;
  address: string;
  activationToken?: string;
  website?: string;
  email?: string;
  phone?: string;
  businessType?: string;
}

export interface BusinessPropsLean {
  _id: string;
  name: string;
  address: string;
  status: "pending" | "active" | "disabled";
  currency?: string;
  activationToken?: string;
  website?: string;
  email?: string;
  phone?: string;
  businessType?: string;
  deletedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type UpdateBusinessDTO = Partial<Omit<CreateBusinessDTO, "userId">>;
