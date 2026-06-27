import { Router } from "express";
import coreRoutes from "./core.route";
import boardingRoutes from "./boarding.route";
import businessActivationRoute from "./businessActivation.route";

const businessRoutes = Router();
businessRoutes.use("/detail", boardingRoutes);
businessRoutes.use("/activation", businessActivationRoute);
businessRoutes.use("/", coreRoutes);

export default businessRoutes;
