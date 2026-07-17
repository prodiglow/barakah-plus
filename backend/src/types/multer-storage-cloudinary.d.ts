declare module "multer-storage-cloudinary" {
  import { StorageEngine } from "multer";
  import { ConfigOptions, UploadApiOptions } from "cloudinary";

  export interface Params extends UploadApiOptions {
    folder?: string;
  }

  export class CloudinaryStorage implements StorageEngine {
    constructor(options: {
      cloudinary: any;
      params?: Params;
    });
  }
}

// declare module "multer-storage-cloudinary" {
//   import { StorageEngine } from "multer";
//   import { v2 as cloudinary, UploadApiOptions } from "cloudinary";

//   export interface Params extends UploadApiOptions {
//     folder?: string;
//   }

//   export default class CloudinaryStorage implements StorageEngine {
//     constructor(options: {
//       cloudinary: typeof cloudinary;
//       params?: Params;
//     });
//   }
// }
