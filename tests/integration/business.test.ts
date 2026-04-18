import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../../src/config/app";
import { AuthRepository } from "../../src/features/auth/auth.repository";
import { container } from "tsyringe";
import { IUserProps } from "../../src/features/auth/interfaces/authInterface";

const authRepository = container.resolve(AuthRepository);

const newBusiness = {
  name: "ashiz business ",
  address: "456 Commerce St, New York, NY 10001",
};

const adminUser: IUserProps = {
  name: "Ashiz Hamal",
  email: "owner@gmail.com",
  password: "ashiz123",
  phone: "234234234",
  role: "admin",
  new: true,
};

const newUser: IUserProps = {
  name: "Ashiz Hamal",
  email: "ashiz@gmail.com",
  password: "ashiz123",
  phone: "234234234",
  role: "owner",
  new: true,
};

const credentials = {
  email: "ashiz@gmail.com",
  password: "ashiz123",
};

const nonExistentId = "6961460e3d9efef86d62de77";

describe("Business route test", () => {
  const createRoute: string = "/api/business/create";
  let token: string;
  let newBusinessId: string;

  beforeAll(async () => {
    await authRepository.createUser(adminUser);
    await authRepository.createUser(newUser);

    const loginUser = await request(app)
      .post("/api/auth/login")
      .send(credentials);

    token = loginUser.body.data.token;
  });
  describe("Create Business", () => {
    it("should throw logged in user not found", async () => {
      const response = await request(app)
        .post(`${createRoute}`)
        .send(newBusiness);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: "User not authorized, Token required",
      });
    });

    it("should throw the invalid token", async () => {
      const response = await request(app)
        .post(`${createRoute}`)
        .send({ name: "ashiz business" })
        .set("Authorization", `Bearer ${"random-token"}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid or expired token" });
    });

    it("should throw the validation error of address field is required ", async () => {
      const response = await request(app)
        .post(`${createRoute}`)
        .send({ name: "ashiz business" })
        .set("Authorization", `Bearer ${token}`);

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Validation Error",
          path: "address field is required",
        }),
      );
      expect(response.status).toBe(400);
    });

    it("should create the business successfully", async () => {
      const response = await request(app)
        .post(`${createRoute}`)
        .send({ name: "ashiz business", address: "137 shorncliffe road" })
        .set("Authorization", `Bearer ${token}`);

      newBusinessId = response.body.data._id;
      console.log("new business id", newBusinessId);
      expect(response.body).toEqual(
        expect.objectContaining({
          success: true,
          message: "Business created successfully",
        }),
      );
    });
  });

  describe("find business by id", () => {
    const getByIdRoute: string = "/api/business/";

    it(" should display business not found ", async () => {
      const response = await request(app)
        .get(`${getByIdRoute}${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.body.error).toEqual("Business not found");
    });

    it(" should create business successfully with business data", async () => {
      const response = await request(app)
        .get(`${getByIdRoute}${newBusinessId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          name: "ashiz business",
          email: "ashiz@gmail.com",
        },
      });
    });
  });

  describe("Update business", () => {
    const updateBusineeRoute: string = "/api/business/update/";
    const updateBusiness = {
      name: "new business",
      address: "12 begginswood road",
    };

    it("should throw the invalid token", async () => {
      const response = await request(app)
        .put(`${updateBusineeRoute}${newBusinessId}`)
        .send({ name: "ashiz business" })
        .set("Authorization", "Bearer random-token");

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Invalid or expired token" });
    });

    it("should throw business not exist", async () => {
      const response = await request(app)
        .put(`${updateBusineeRoute}${nonExistentId}`)
        .send(updateBusiness)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Business not found" });
    });

    it(" should create business successfully", async () => {
      const response = await request(app)
        .put(`${updateBusineeRoute}${newBusinessId}`)
        .set("Authorization", `Bearer ${token}`)
        .send(updateBusiness);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          _id: newBusinessId,
          name: updateBusiness.name,
          address: updateBusiness.address,
        },
        message: "Business updated successfully",
      });
    });
  });

  describe("Business Delete", () => {
    const deleteBusinessRoute: string = "/api/business/delete/";

    it("should throw user not found", async () => {
      const response = await request(app)
        .delete(`${deleteBusinessRoute}${nonExistentId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "User not found in database" });
    });

    it("should delete business successfully", async () => {
      const response = await request(app)
        .delete(`${deleteBusinessRoute}${newBusinessId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        message: "Business deleted successfully",
      });
    });
  });
});
