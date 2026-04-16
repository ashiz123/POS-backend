import { container } from "tsyringe";
import mongoose from "mongoose";
import { describe, it, expect } from "vitest";
import { TOKENS } from "../../src/config/tokens";

describe("Environment Sanity Check", () => {
  it("should run test environment", async () => {
    expect(process.env.NODE_ENV).toEqual("test");
  });

  it("should have a working MongoDB connection", async () => {
    if (mongoose.connection.readyState === 2) {
      await new Promise((resolve) => mongoose.connection.once("open", resolve));
    }

    expect(mongoose.connection.readyState).toBe(1);
  });

  it("should have the BusinessController registered in the container", () => {
    const isRegistered = container.isRegistered(TOKENS.BUSINESS_CONTROLLER);
    expect(isRegistered).toBe(true);
  });

  it("should be able to resolve the BusinessController", () => {
    const controller = container.resolve(TOKENS.BUSINESS_CONTROLLER);
    expect(controller).toBeDefined();
    expect(controller).toHaveProperty("activateForm"); // Verify a real method exists
  });
});
