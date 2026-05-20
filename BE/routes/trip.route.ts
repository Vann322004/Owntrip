import { Router } from "express";
import {
	createTrip,
	deleteTripById,
	getProvinceImageCatalog,
	getTripDestinations,
	getMyTrips,
	getPublishedTrips,
	getTripDetail,
	updateTrip,
	updateTripPublishStatus,
	getMarketplaceTrips,
	getTripPreview,
	publishToMarketplace,
	createPaymentUrl,
  handlePaymentWebhook,
  renderSandboxPayment,
  getTripSalesStats
} from "../controllers/trip.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", verifyToken, createTrip);
router.get("/my", verifyToken, getMyTrips);
router.get("/provinces/images", getProvinceImageCatalog);
router.get("/published", getPublishedTrips);
router.get("/marketplace", getMarketplaceTrips);
router.get("/marketplace/:tripId/preview", getTripPreview);
router.post("/marketplace/:tripId/purchase", verifyToken, createPaymentUrl);
router.patch("/:tripId/marketplace", verifyToken, publishToMarketplace);
router.get("/:tripId/destinations", getTripDestinations);
router.get("/:tripId/sales-stats", verifyToken, getTripSalesStats);
router.patch("/:tripId", verifyToken, updateTrip);
router.patch("/:tripId/publish", verifyToken, updateTripPublishStatus);
router.delete("/:tripId", verifyToken, deleteTripById);
router.get("/:tripId", getTripDetail);

// Payment Sandbox Routes
router.get("/payment-sandbox/:orderCode", renderSandboxPayment);
router.post("/payment-webhook", handlePaymentWebhook);

module.exports = router;