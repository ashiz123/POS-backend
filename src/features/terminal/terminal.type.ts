import { IBusinessDocument } from "../business/database/business_db_model";
import { TerminalDocument } from "./terminal.model";

export type PopulatedTerminal = TerminalDocument & {
  businessId: IBusinessDocument; // This replaces the ID with the actual object
};

export interface ITerminalAuthContext {
  activationCode: string;
  businessId: string;
  user: {
    _id: string;
    email: string;
  };
  membership: {
    role: string;
  };
}

export interface ITerminalAuthData {
  userId: string;
  name: string;
  email: string;
  role: string;
}

export interface TerminalUserSessionResponse {
  userData: {
    userId: string;
    name: string;
    email: string;
    role: string;
  };
  terminalSessionId: string;
  businessId: string;
}
