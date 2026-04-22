import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../../src/config/app";
import { UserBusinessRepository } from "../../src/features/userBusiness/userBusiness.repository";
import { container } from "tsyringe";
import { BusinessRepository } from "../../src/features/business/business.repository";
import { AuthRepository } from "../../src/features/auth/auth.repository";
import { IUserProps } from "../../src/features/auth/interfaces/authInterface";

const authRepository = container.resolve(AuthRepository);
const businessRepository = container.resolve(BusinessRepository);
const userBusinessRepository = container.resolve(UserBusinessRepository);

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

const newBusinessData = {
  name: "ashiz business ",
  address: "456 Commerce St, New York, NY 10001",
};

const credentials = {
  email: "ashiz@gmail.com",
  password: "ashiz123",
};

const productData = {
  name: "sukmita product 9",
  categoryId: "696373bcba24fb62c8619667",
  description: "this is shampoo",
  price: 40,
  costPrice: 20,
  isActive: true,
};

const nonExistentId = "6961460e3d9efef86d62de77";

describe("Product test", () => {
  let userToken: string;
  let userWithBusinessToken: string;
  let newBusiness: any;
  let registeredUser: any;
  let newProductId: string;
  let expectedBusinessId: string;

  beforeAll(async () => {
    //1. Admin must present to create the user
    await authRepository.createUser(adminUser);
    //2. User must create to login user
    registeredUser = await authRepository.createUser(newUser);
    //3. User must login to create the business
    const loginUser = await request(app)
      .post("/api/auth/login")
      .send(credentials);

    userToken = loginUser.body.data.token;
    //4. Business must be created to login with business
    newBusiness = await businessRepository.create(newBusinessData);
    //5. Business and user must be present to assign user to business
    await userBusinessRepository.assignUserWithSession({
      userId: registeredUser._id,
      businessId: newBusiness._id,
      role: "owner",
      userStatus: "active",
    });
    //6. Than can user can login with business . It also required userToken generated above
    const loginWithBusiness = await request(app)
      .post("/api/auth/loginWithBusiness")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ businessId: newBusiness._id });

    userWithBusinessToken = loginWithBusiness.body.data.token;
  });

  it("should throw Unauthorized error", async () => {
    const createProductRoute = "/api/product/create";
    const response = await request(app)
      .post(createProductRoute)
      .set("Authorization", "Bearer random-token")
      .send({ title: "testing" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorized" });
  });

  describe("Create Product", () => {
    const createProductRoute = "/api/product/create";
    it("should throw the validation error", async () => {
      const response = await request(app)
        .post(createProductRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`)
        .send({ name: "shampoo" });
      console.log("response body", response.body);
      console.log("business token", userWithBusinessToken);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Validation Error",
        }),
      );
      expect(response.status).toBe(400);
    });

    it("should add product successfully", async () => {
      const response = await request(app)
        .post(createProductRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`)
        .send(productData);

      expectedBusinessId = newBusiness._id.toString();
      newProductId = response.body.data._id;

      expect(response.status).toBe(201);
      console.log("product response", response.body);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          name: "sukmita product 9",
          description: "this is shampoo",
          categoryId: "696373bcba24fb62c8619667",
          price: 40,
          costPrice: 20,
          isActive: true,
          businessId: expectedBusinessId,
        },
      });
    });
  });

  describe("Update the category", () => {
    it("should throw the validation error", async () => {
      const updateProductRoute = `/api/product/update/${newProductId}`;
      const response = await request(app)
        .put(updateProductRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`)
        .send({});

      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Validation Error",
        }),
      );
      expect(response.status).toBe(400);
    });

    it("should update the category successful", async () => {
      const updateProductRoute = `/api/product/update/${newProductId}`;
      const response = await request(app)
        .put(updateProductRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`)
        .send({ name: "Ashiz testing" });
      console.log(response.body);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          name: "Ashiz testing",
          categoryId: "696373bcba24fb62c8619667",
        },
      });
    });
  });

  describe("View Product", () => {
    it("should show the category by id", async () => {
      const showProductRoute = `/api/product/${newProductId}`;
      const response = await request(app)
        .get(showProductRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`);
      expectedBusinessId = newBusiness._id.toString();
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          name: "Ashiz testing",
          description: "this is shampoo",
          categoryId: "696373bcba24fb62c8619667",
          price: 40,
          costPrice: 20,
          isActive: true,
          businessId: expectedBusinessId,
        },
      });
    });
  });

  describe("Remove Product", () => {
    it("should throw product not found", async () => {
      const deleteProductRoute = `/api/product/delete/${nonExistentId}`;
      const response = await request(app)
        .delete(deleteProductRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`);

      console.log("delete response", response.body);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Product is not exist" });
    });

    it("should delete product successfully", async () => {
      const deleteProductRoute = `/api/product/delete/${newProductId}`;
      const response = await request(app)
        .delete(deleteProductRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: "Product deleted successfully",
      });
    });
  });

  //list of products of business is not tested
});
