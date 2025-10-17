import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'new user password',
    example: 'newPassword123',
  })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  newPassword: string;
}
