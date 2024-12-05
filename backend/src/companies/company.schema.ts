import { ObjectId } from 'mongodb';

export class Company {
  _id?: ObjectId;
  name: string;
  address: string;
  description: string;
  logo: string;
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
