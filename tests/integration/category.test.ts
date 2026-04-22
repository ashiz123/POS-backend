import request from "supertest";
import { describe, it, expect, beforeAll } from "vitest";
import app from "../../src/config/app";
import { AuthRepository } from "../../src/features/auth/auth.repository";
import { container } from "tsyringe";
import { IUserProps } from "../../src/features/auth/interfaces/authInterface";
import { BusinessRepository } from "../../src/features/business/business.repository";
import { UserBusinessRepository } from "../../src/features/userBusiness/userBusiness.repository";

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

const nonExistentId = "6961460e3d9efef86d62de77";

describe("Category test", () => {
  let userToken: string;
  let userWithBusinessToken: string;
  let newBusiness: any;
  let registeredUser: any;
  let newCategoryId: string;

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
    const createCategoryRoute = "/api/categories/create";
    const response = await request(app)
      .post(createCategoryRoute)
      .set("Authorization", "Bearer random-token")
      .send({ title: "testing" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Unauthorized" });
  });

  describe("Create Category", () => {
    it("should throw the validation error", async () => {
      const createCategoryRoute = "/api/categories/create";
      const response = await request(app)
        .post(createCategoryRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`)
        .send({ title: "testing" });
      console.log("response body", response.body);
      console.log("business token", userWithBusinessToken);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "Validation Error",
        }),
      );
      expect(response.status).toBe(400);
    });

    it("should create category successfully", async () => {
      const createCategoryRoute = "/api/categories/create";
      const response = await request(app)
        .post(createCategoryRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`)
        .send({
          title: "testing",
          description: "this is testing",
          isActive: true,
        });

      const expectedBusinessId = newBusiness._id.toString();
      newCategoryId = response.body.data._id;

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          title: "testing",
          description: "this is testing",
          businessId: expectedBusinessId,
        },
      });
    });
  });

  describe("Update the category", () => {
    it("should throw the validation error", async () => {
      const updateCategoryRoute = `/api/categories/update/${newCategoryId}`;
      const response = await request(app)
        .put(updateCategoryRoute)
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
      const updateCategoryRoute = `/api/categories/update/${newCategoryId}`;
      const response = await request(app)
        .put(updateCategoryRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`)
        .send({ title: "Ashiz testing" });
      console.log(response.body);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: {
          title: "Ashiz testing",
        },
      });
    });
  });

  describe("Display all categories of that business", () => {
    //you can do seeding and do with more data
    it("should display all categories of business", async () => {
      const categoriesByBusiness = "/api/categories/of/business";
      const response = await request(app)
        .get(categoriesByBusiness)
        .set("Authorization", `Bearer ${userWithBusinessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: [
          {
            title: "Ashiz testing",
            description: "this is testing",
            isActive: true,
            parentCategoryId: null,
            deletedAt: null,
          },
        ],
      });
    });
  });

  describe("View Category", () => {
    it("should show the category by id", async () => {
      const showCategoryRoute = `/api/categories/${newCategoryId}`;
      const response = await request(app)
        .get(showCategoryRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        data: {
          title: "Ashiz testing",
          description: "this is testing",
        },
      });
    });
  });

  describe("Delete Category", () => {
    it("should throw category not found", async () => {
      const deleteCategoryRoute = `/api/categories/delete/${nonExistentId}`;
      const response = await request(app)
        .delete(deleteCategoryRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`);

      console.log("delete response", response.body);
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: "Category is not exist" });
    });

    it("should delete category successfully", async () => {
      const deleteCategoryRoute = `/api/categories/delete/${newCategoryId}`;
      const response = await request(app)
        .delete(deleteCategoryRoute)
        .set("Authorization", `Bearer ${userWithBusinessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        message: "Category successfully deleted",
      });
    });
  });
});
