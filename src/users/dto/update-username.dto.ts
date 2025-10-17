import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @ApiProperty({
    description: 'new username',
    example: 'newUsername',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  newUsername: string;
}
