import { Router } from "express";
import coreRoutes from "./routes/core.route";
import boardingRoutes from "./routes/detail";
import businessActivationRoute from "./routes/businessActivation.route";

const businessRoutes = Router();
businessRoutes.use("/detail", boardingRoutes);
businessRoutes.use("/activation", businessActivationRoute);
businessRoutes.use("/", coreRoutes);

export default businessRoutes;
