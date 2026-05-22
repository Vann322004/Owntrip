require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");
  
  const Trip = require('./models/trip.model').default || require('./models/trip.model');
  const PlanDay = require('./models/planDay.model').default || require('./models/planDay.model');
  const PlanPlace = require('./models/planPlace.model').default || require('./models/planPlace.model');
  const Review = require('./models/review.model').default || require('./models/review.model');

  try {
    const tripId = '6a0f18052308bebd2e63d7c1';
    const trip = await Trip.findById(tripId);
    console.log("Trip found:", !!trip);

    const days = await PlanDay.find({ tripId }).sort({ dayNumber: 1 });
    console.log("Days:", days.length);

    const result = [];
    for (const day of days) {
      const places = await PlanPlace.find({ dayId: day._id }).sort({ order: 1 });
      const maskedPlaces = places.map((place) => ({
        dayId: place.dayId,
        order: place.order,
        timeOfDay: place.timeOfDay,
        name: "Địa điểm đã được khoá 🔒",
      }));
      result.push({
        dayId: day._id,
        day: day.dayNumber,
        date: day.date,
        places: maskedPlaces,
      });
    }
    console.log("Result created");

    const resolveReviewTargetTripId = (trip) => {
      if (trip?.isPurchasedClone && trip?.originalTripId) {
        return String(trip.originalTripId);
      }
      return String(trip?._id);
    };

    const reviewTargetId = resolveReviewTargetTripId(trip);
    console.log("Review target id:", reviewTargetId);
    const reviews = await Review.find({ targetId: reviewTargetId, targetType: 'itinerary' })
      .populate('userId', 'displayName image')
      .sort({ createdAt: -1 });

    console.log("Success! Reviews:", reviews.length);
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    mongoose.disconnect();
  }
}

test();
