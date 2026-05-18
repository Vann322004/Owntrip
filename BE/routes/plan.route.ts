import { Router } from "express";
import { addPlaceToDay, deletePlaceFromDay, reorderPlacesInDay } from "../controllers/plan.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/day/:dayId/place", verifyToken, addPlaceToDay);
router.patch("/reorder", verifyToken, reorderPlacesInDay);
router.delete("/day/:dayId/place/:planPlaceId", verifyToken, deletePlaceFromDay);

module.exports = router;