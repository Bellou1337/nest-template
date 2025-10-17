import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramLoginDto {
  @ApiProperty({
    description: 'Telegram user ID',
    example: 123456789,
  })
  @Type(() => Number)
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'Telegram user first name',
    example: 'John',
  })
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'Telegram user username',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'Telegram user photo URL',
    example: 'https://example.com/photo.jpg',
  })
  @IsString()
  photo_url?: string;

  @ApiProperty({
    description: 'Telegram user authentication data',
    example: 123456789,
  })
  @IsNumber()
  @Type(() => Number)
  auth_date: number;

  @ApiProperty({
    description: 'Telegram user hash',
    example: 'hash_example',
  })
  @IsString()
  hash: string;
}
