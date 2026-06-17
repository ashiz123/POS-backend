import { Router } from "express";
import orderKioskRoute from "./order-kiosk.route";
import orderAdminRoute from "./order-admin.route";

const orderRoute = Router();

orderRoute.use("/kiosk", orderKioskRoute);
orderRoute.use("/admin", orderAdminRoute);

export default orderRoute;
