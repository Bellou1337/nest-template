import { FileValidator } from '@nestjs/common';

type ImageTypeValidatorOptions = { allowedTypes: RegExp };

export class ImageTypeValidator extends FileValidator<ImageTypeValidatorOptions> {
  constructor(options: ImageTypeValidatorOptions) {
    super(options);
  }

  isValid(file: Express.Multer.File): boolean {
    if (!file) {
      return false;
    }

    return this.validationOptions.allowedTypes.test(file.mimetype);
  }

  buildErrorMessage(file: any): string {
    return `Invalid image type ${file.mimetype}. Allowed types are: ${this.validationOptions.allowedTypes}`;
  }
}
