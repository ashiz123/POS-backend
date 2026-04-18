import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../../src/config/app";
import { getRedisClient } from "../../../src/config/redisConnection";

describe.sequential("User login Integration test", () => {
  const user = {
    email: "ramesh@gmail.com",
    name: "ramesh thapa",
    phone: "23333322222",
    password: "ramesh123",
    role: "cashier",
  };

  const credentials = {
    email: "ramesh@gmail.com",
    password: "ramesh123",
  };

  let token: string;

  const redisClient = getRedisClient();

  it("should throw the validation error", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "testing@gmail.com" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation Error");
  });

  it("should login user successfully with token", async () => {
    await request(app).post("/api/auth/register").send(user);

    const response = await request(app)
      .post("/api/auth/login")
      .send(credentials);

    if (response.status !== 200) {
      console.log("Error Details:", response.body);
    }

    token = response.body.data.token;
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty("token");
    expect(response.body.data.token).toBeDefined();
  });

  it("should give the authenticated user", async () => {
    const response = await request(app)
      .get("/api/auth/auth_user")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    if (response.status !== 200) {
      console.log("Auth User Failed:", response.body);
    }

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      loggedInUser: {
        email: user.email,
      },
    });
  });

  it("should verify the redis session exist", async () => {
    const key = `session:${token}`;
    const value: string | null = await redisClient.get(key);
    expect(value).not.toBeNull();
    if (value) {
      const payload = JSON.parse(value);
      expect(payload.email).toEqual("ramesh@gmail.com");
    }
  });

  it("logout should throw invalid or expired token", async () => {
    const wrongToken = "this_is_wrong_token";
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${wrongToken}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid or expired token");
  });

  it("should logout user successfully", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User logged out successfully");
  });
});
