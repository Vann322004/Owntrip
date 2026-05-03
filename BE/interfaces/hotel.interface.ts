import { Document } from 'mongoose';

export interface IRoomType {
  roomTypeId: string;
  name: string;        
  description: string;
  images: string[];
  capacity: number;
  basePrice: number;    
  totalRooms: number;  
  amenities: string[];   
}

export interface IHotel extends Document {
  hotelId: string;
  name: string;
  starRating: number;
  address: {
    fullAddress: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  images: string[];
  description: string;
  amenities?: string[];
  rooms: IRoomType[];
  reviewSummary: {
    score: number;     
    count: number;       
    cleanliness: number;
    service: number;
    facilities: number;
    valueForMoney: number;
  };
  tags: string[];       
  ownerId?: string;     
}