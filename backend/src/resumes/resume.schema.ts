import { ObjectId } from 'mongodb';

export class Resume {
  _id?: ObjectId;
  email: string;
  userId: ObjectId;
  url: string;
  status: string;
  companyId: ObjectId;
  jobId: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
  //   history: {
  //     status: string;
  //     updatedAt: Date;
  //     updatedBy: {
  //       _id: ObjectId;
  //       email: string;
  //     };
  //   }[];
  //   createdBy: {
  //     _id: ObjectId;
  //     email: string;
  //   };
  //   updatedBy: {
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
