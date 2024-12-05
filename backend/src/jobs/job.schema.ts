import { ObjectId } from 'mongodb';

export interface Job {
  _id?: ObjectId;
  name: string;
  skills: string[];
  company: {
    _id: ObjectId;
    name: string;
    logo: string;
  };
  location: string;
  salary: number;
  quantity: number;
  level: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  //   createdBy?: {
  //     _id: ObjectId;
  //     email: string;
  //   };
  //   updatedBy?: {
  //     _id: ObjectId;
  //     email: string;
  //   };
  //   deletedBy?: {
  //     _id: ObjectId;
  //     email: string;
  //   };
  //   isDeleted?: boolean;
  //   deletedAt?: Date;
}
