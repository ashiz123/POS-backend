import request from "supertest";
import { describe, it, expect } from "vitest";
import app from "../../src/config/app";
import { SessionService } from "../../src/features/session/session.service";
import { container } from "tsyringe";
import { Payload } from "../../src/features/auth/interfaces/authInterface";
import { UserBusinessRepository } from "../../src/features/userBusiness/userBusiness.repository";
import { AssignUserDTO } from "../../src/features/userBusiness/interfaces/userBusiness.interface";

const sessionService = container.resolve(SessionService);
const userBusinessRepository = container.resolve(UserBusinessRepository);

const user = {
  email: "testing@gmail.com",
  name: "testing only",
  phone: "23333322222",
  password: "testing123",
};

const credentials = {
  email: "testing@gmail.com",
  password: "testing123",
};

describe.sequential("Authentication test", () => {
  let token: string;
  let newUserId: string;
  let businessLoginToken: string;

  it("should throw the validation error", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send({ email: "testing@gmail.com" });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation Error");
  });

  it("should register the user successfully", async () => {
    const response = await request(app).post("/api/auth/register").send(user);
    newUserId = response.body._id;
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        name: "testing only",
        phone: "23333322222",
        email: "testing@gmail.com",
      }),
    );
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

  it("should throw error validation error if businessId not request", async () => {
    const response = await request(app)
      .post("/api/auth/loginWithBusiness")
      .send({})
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Validation Error");
  });

  it("should login user with business", async () => {
    const userResponse: AssignUserDTO = {
      userId: newUserId,
      businessId: "6991fbd3a11189d5ceb8ca1b",
      role: "owner",
      userStatus: "active",
    };

    const userBusiness =
      await userBusinessRepository.assignUserWithSession(userResponse);
    console.log(userBusiness);
    const response = await request(app)
      .post("/api/auth/loginWithBusiness")
      .send({ businessId: "6991fbd3a11189d5ceb8ca1b" })
      .set("Authorization", `Bearer ${token}`)
      .set("Accept", "application/json");

    expect(response.body).toEqual(
      expect.objectContaining({
        success: true,
        message: "User logged in successfully with business",
      }),
    );
    businessLoginToken = response.body.data.token;
    expect(response.status).toBe(200);
  });

  it("should verify the redis session exist", async () => {
    const value: Payload = await sessionService.getSession(businessLoginToken);
    expect(value).not.toBeNull();
    if (value) {
      expect(value.email).toEqual("testing@gmail.com");
    }
  });

  it("should not logout user if token does not match", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${"fake-token"}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid or expired token" });
  });

  it("should loogut user success", async () => {
    const response = await request(app)
      .post("/api/auth/logout")
      .set("Authorization", `Bearer ${businessLoginToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: "User logged out successfully" });
  });
});
