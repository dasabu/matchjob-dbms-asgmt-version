import { ObjectId } from 'mongodb';

export interface Permission {
  _id?: ObjectId;
  name: string;
  apiPath: string;
  method: string;
  module: string;
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
  createdAt?: Date;
  updatedAt?: Date;
  //   isDeleted?: boolean;
  //   deletedAt?: Date;
}
