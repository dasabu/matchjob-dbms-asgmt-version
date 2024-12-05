import {
  Controller,
  Post,
  UseGuards,
  Req,
  Body,
  Res,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/core/customize.decorator';
import {
  RegisterUserDto,
  // UserLoginDto
} from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
// import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { IUser } from 'src/users/user.interface';
import { LocalAuthGuard } from './guards/local.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ResponseMessage('Login successfully')
  login(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage('Register successfully')
  @Post('/register')
  register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage('Fetched user account successfully')
  @Get('/account')
  async handleGetAccount(@User() user) {
    const temp = await this.rolesService.findOne(user.role);
    // Gán permission vào user
    user.permissions = temp.permissions;
    return { user };
  }

  @Public()
  @ResponseMessage('Fetched user by refresh_token successfully')
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage('Logout successfully')
  @Post('/logout')
  logout(@Res({ passthrough: true }) response: Response, @User() user) {
    return this.authService.logout(response, user);
  }
}
