import { Router } from "express";
import { authenticate, authorized } from "../controllers/authController.js";
import { getAllServices, getService, createService, updateService, deleteService } from "./../controllers/serviceController.js";

const router = Router();

router.get("/", authenticate, getAllServices);

router.post("/", authenticate, authorized("admin"), createService);

router.route("/:id")
    .get(authenticate, getService)
    .patch(authenticate, authorized("admin"), updateService)
    .delete(authenticate, authorized("admin"), deleteService);


export default router;