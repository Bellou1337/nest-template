import {
  Controller,
  Get,
  UseGuards,
  Req,
  Param,
  Body,
  Patch,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import type { Request } from 'express';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUsernameDto } from './dto/update-username.dto';
import { ApiCookieAuth } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageTypeValidator } from 'src/shared/validators/image-type.validator';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { RolesGuard } from 'src/shared/guards/roles.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Get current user',
  })
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  getMe(@Req() request: Request) {
    return this.usersService.getCurrentUser(request);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
  })
  @Roles('ADMIN')
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  getUserById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Get(':email')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Get user by email',
  })
  @UseGuards(AuthGuard, RolesGuard)
  @ApiCookieAuth()
  getUserByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch('password')
  @ApiOperation({
    summary: 'Update user password',
  })
  @ApiBody({ type: UpdatePasswordDto })
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  updatePassword(@Body() body: UpdatePasswordDto, @Req() request: Request) {
    return this.usersService.updatePassword(body, request);
  }

  @Patch('username')
  @ApiOperation({
    summary: 'Update user username',
  })
  @UseGuards(AuthGuard)
  @ApiCookieAuth()
  @ApiBody({ type: UpdateUsernameDto })
  updateUsername(@Body() body: UpdateUsernameDto, @Req() request: Request) {
    return this.usersService.updateUsername(body, request);
  }

  @Patch('avatar')
  @ApiCookieAuth()
  @ApiBody({
    description: 'Avatar image',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: 'Update user avatar',
  })
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(AuthGuard)
  @ApiConsumes('multipart/form-data')
  updateAvatar(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), //5mb
          new ImageTypeValidator({ allowedTypes: /^image\/(jpeg|png|jpg)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    return this.usersService.updateAvatar(file, request);
  }

  @Delete('avatar')
  @ApiCookieAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Delete user avatar',
  })
  deleteAvatar(@Req() request: Request) {
    return this.usersService.deleteAvatar(request);
  }
}
