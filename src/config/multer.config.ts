import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { HttpException, HttpStatus } from '@nestjs/common';

// Multer upload options
export const multerPdfOptions = {
  // Enable file size limits
  limits: {
    fileSize: 1000000, //1mb
  },
  // Check the mimetypes to allow for upload
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    if (file.mimetype.match(/\/(pdf)$/)) {
      // Allow storage of file
      cb(null, true);
    } else {
      // Reject file
      cb(
        new HttpException(
          `Unsupported file type ${extname(file.originalname)}`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
  // Storage properties
  storage: diskStorage({
    // Destination storage path details
    destination: (req: any, file: Express.Multer.File, cb: Function) => {
      const uploadPath = './uploads/pdf';
      // Create folder if doesn't exist
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },

    // File modification details
    filename: (req: any, file: Express.Multer.File, cb: Function) => {
      const sanitizedOriginalName = file.originalname.replace(
        /[^a-zA-Z0-9.]/g,
        '_',
      );
      cb(null, `${sanitizedOriginalName}`);
    },
  }),
};
