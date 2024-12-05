import { ObjectId } from 'mongodb';

export interface Role {
  _id?: ObjectId;
  name: string;
  description: string;
  isActive: boolean;
  permissions: ObjectId[]; // Danh sách ObjectId của permissions
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
