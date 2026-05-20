import { Router } from "express";
import {
  createCheckinMemory,
  getMyCheckins,
  toggleCheckinFavorite,
  deleteCheckin
} from "../controllers/checkin.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verifyToken, createCheckinMemory);
router.get("/my", verifyToken, getMyCheckins);
router.patch("/:id/favorite", verifyToken, toggleCheckinFavorite);
router.delete("/:id", verifyToken, deleteCheckin);

module.exports = router;
