import { Router } from "express";
import { authorizeRole, verifyToken } from "../middlewares/auth.middleware";
import {
  createWithdrawalRequest,
  getAllWithdrawalRequestsForAdmin,
  getMyWithdrawalRequests,
  reviewWithdrawalRequest
} from "../controllers/withdrawal.controller";

const router = Router();

router.post("/", verifyToken, authorizeRole("creator"), createWithdrawalRequest);
router.get("/my", verifyToken, authorizeRole("creator"), getMyWithdrawalRequests);
router.get("/admin", verifyToken, authorizeRole("admin"), getAllWithdrawalRequestsForAdmin);
router.put("/admin/:id", verifyToken, authorizeRole("admin"), reviewWithdrawalRequest);

module.exports = router;
