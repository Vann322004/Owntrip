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
      mapUrl
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

export const reorderPlacesInDay = async (req: Request, res: Response) => {
  try {
    const { dayId, orderedPlaceIds, orderedPlanPlaceIds, placeIds } = req.body;

    const targetDayId = dayId ?? req.body.dayId;
    const orderedIds = orderedPlaceIds ?? orderedPlanPlaceIds ?? placeIds;

    if (!targetDayId) {
      return res.status(400).json({
        success: false,
        message: "dayId is required"
      });
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orderedPlaceIds must be a non-empty array"
      });
    }

    const normalizedIds = orderedIds.map((value) => String(value));
    const uniqueIds = new Set(normalizedIds);

    if (uniqueIds.size !== normalizedIds.length) {
      return res.status(400).json({
        success: false,
        message: "orderedPlaceIds contains duplicate values"
      });
    }

    const places = await PlanPlace.find({ dayId: targetDayId });

    const placeByDocId = new Map<string, (typeof places)[number]>();
    const placeByPlaceId = new Map<string, (typeof places)[number]>();

    for (const place of places) {
      placeByDocId.set(String(place._id), place);
      placeByPlaceId.set(String(place.placeId), place);
    }

    const orderedPlaces = normalizedIds.map((id) => {
      return placeByDocId.get(id) ?? placeByPlaceId.get(id) ?? null;
    });

    const missingIds = normalizedIds.filter((id, index) => !orderedPlaces[index]);

    if (missingIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some places in orderedPlaceIds do not belong to this day",
        missingIds
      });
    }

    if (orderedPlaces.length !== places.length) {
      return res.status(400).json({
        success: false,
        message: "orderedPlaceIds must contain all places of the day"
      });
    }

    await PlanPlace.bulkWrite(
      orderedPlaces.map((place, index) => ({
        updateOne: {
          filter: { _id: place!._id, dayId: targetDayId },
          update: { $set: { order: index + 1 } }
        }
      }))
    );

    return res.json({
      success: true,
      message: "Reorder places successfully",
      dayId: targetDayId,
      totalPlaces: orderedPlaces.length,
      orderedPlaceIds: normalizedIds
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Reorder places failed"
    });
  }
};