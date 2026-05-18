import { Request, Response } from "express";
import PlanPlace from "../models/planPlace.model";

export const addPlaceToDay = async (req: Request, res: Response) => {

  try {

    const { dayId } = req.params;

    const {
      placeId,
      name,
      address,
      latitude,
      longitude,
      rating,
      photo,
      mapUrl,
      timeOfDay
    } = req.body;

    const count = await PlanPlace.countDocuments({ dayId: dayId as any });

    const place = await PlanPlace.create({

      dayId: dayId as any,

      placeId,
      name,
      address,

      latitude,
      longitude,

      rating,
      photo,
      mapUrl,
      timeOfDay,
      order: count + 1
    });

    res.json({
      success: true,
      place
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Add place failed"
    });

  }

};

export const reorderPlaces = async (req: Request, res: Response) => {
  try {
    const { dayId } = req.params;
    const { placeIds } = req.body; 

    if (!Array.isArray(placeIds)) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const updates = placeIds.map((id, index) => 
      PlanPlace.updateOne({ _id: id, dayId: dayId as any }, { order: index + 1 })
    );

    await Promise.all(updates);

    res.json({ success: true, message: "Reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Reorder failed" });
  }
};

export const deletePlaceFromDay = async (req: Request, res: Response) => {

  try {

    const { dayId, planPlaceId } = req.params;

    const place = await PlanPlace.findOne({ _id: planPlaceId as any, dayId: dayId as any });

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found in this day"
      });
    }

    const deletedOrder = typeof place.order === "number" ? place.order : 0;

    await PlanPlace.deleteOne({ _id: planPlaceId as any, dayId: dayId as any });

    if (deletedOrder > 0) {
      await PlanPlace.updateMany(
        { dayId: dayId as any, order: { $gt: deletedOrder } },
        { $inc: { order: -1 } }
      );
    }

    return res.json({
      success: true,
      message: "Delete place successfully",
      deletedPlaceId: planPlaceId
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Delete place failed"
    });

  }

};