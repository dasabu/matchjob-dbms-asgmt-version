import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId; // `_id` sẽ được MongoDB tự động tạo
  name: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  address: string;
  company?: {
    _id: ObjectId;
    name: string;
  };
  role?: ObjectId;
  refreshToken?: string;
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
