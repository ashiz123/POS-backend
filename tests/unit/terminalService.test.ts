import "reflect-metadata";
import { container } from "tsyringe";
import { beforeEach, describe, expect, it, MockInstance, vi } from "vitest";
import { TOKENS } from "../../src/config/tokens";
import {
  CreateTerminal,
  TerminalDocument,
  TerminalType,
} from "../../src/features/terminal/terminal.model";
import {
  TERMINAL_PAYMENT_STATUS,
  TERMINAL_STATUS,
} from "../../src/features/terminal/terminal.constant";
import { ICryptoService } from "../../src/utils/token";
import {
  ITerminalRepository,
  ITerminalService,
} from "../../src/features/terminal/terminal.type";
import { TerminalService } from "../../src/features/terminal/terminal.service";

const createTerminalData = (
  overrides: Partial<TerminalType> = {},
): TerminalType => ({
  ownerId: "owner-123",
  businessId: "biz-123",
  name: "Ashiz",
  status: TERMINAL_STATUS.REQUESTED,
  paymentStatus: TERMINAL_PAYMENT_STATUS.PENDING,
  activationCode: "default-code", // Fallback value
  ...overrides, // This lets you inject the mock result easily
});

const terminalRequest: CreateTerminal = {
  ownerId: "owner-123",
  businessId: "biz-123",
  name: "Ashiz",
  status: TERMINAL_STATUS.REQUESTED,
  paymentStatus: TERMINAL_PAYMENT_STATUS.PENDING,
  activationCode: "default-code", // Fallback value
};

const terminalResponse = {
  ownerId: "owner-123",
  businessId: "biz-123",
  name: "Ashiz",
  status: TERMINAL_STATUS.REQUESTED,
  paymentStatus: TERMINAL_PAYMENT_STATUS.PENDING,
  activationCode: "default-code", // Fallback value
} as unknown as TerminalDocument;

describe("Terminal Service", () => {
  container.clearInstances();

  let terminalService: ITerminalService;
  let mockSession: any;
  let mockConnection: any;
  let mockTerminalRepo: {
    createWithSession: MockInstance<ITerminalRepository["createWithSession"]>;
  };

  let mockCryptoService: {
    generateActivationCode: MockInstance<
      ICryptoService["generateActivationCode"]
    >;
  };

  let mockAdminQueue: {
    add: MockInstance<any>;
  };

  beforeEach(() => {
    mockCryptoService = {
      generateActivationCode: vi.fn(),
    };

    mockSession = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn(),
      abortTransaction: vi.fn(),
      endSession: vi.fn(),
    };

    mockConnection = {
      startSession: vi.fn().mockResolvedValue(mockSession),
    };

    mockTerminalRepo = {
      createWithSession: vi.fn(),
    };

    mockAdminQueue = {
      add: vi
        .fn()
        .mockResolvedValue({ id: "job-123", data: { terminalId: "term-1" } }),
    };

    container.registerInstance(TOKENS.DATABASE_CONNECTION, mockConnection);
    container.registerInstance(TOKENS.TERMINAL_REPOSITORY, mockTerminalRepo);
    container.registerInstance(TOKENS.NOTIFICATION_ADMIN_QUEUE, mockAdminQueue);
    container.registerInstance(TOKENS.NOTIFICATION_OWNER_QUEUE, {});
    container.registerInstance(TOKENS.CRYPTO_SERVICE, mockCryptoService);
    terminalService = container.resolve(TerminalService);
  });

  it("should create a terminal and commit the transaction", async () => {
    mockTerminalRepo.createWithSession.mockResolvedValue(terminalResponse);
    await terminalService.createTerminal(terminalRequest);
    expect(mockConnection.startSession).toHaveBeenCalled();
    expect(mockSession.startTransaction).toHaveBeenCalled();
    expect(mockSession.commitTransaction).toHaveBeenCalled();
    expect(mockSession.abortTransaction).not.toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalled();
  });
});
