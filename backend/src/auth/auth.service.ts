import { UsersService } from 'src/users/users.service';
import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import * as ms from 'ms';
import { MongoService } from 'src/mongo/mongo.service';
import { Db, ObjectId } from 'mongodb';
import { IUser } from 'src/users/user.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private db: Db;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mongoService: MongoService,
  ) {}

  onModuleInit() {
    this.db = this.mongoService.getDatabase();
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByEmail(email);
    if (user && this.usersService.isValidPassword(pass, user.password)) {
      const role = await this.db.collection('roles').findOne({
        _id: new ObjectId(user.role),
      });
      return {
        ...user,
        permissions: role?.permissions || [],
      };
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };

    const refreshToken = this.createRefreshToken(payload);

    // Update user with refresh token
    await this.db
      .collection('users')
      .updateOne({ _id: new ObjectId(_id) }, { $set: { refreshToken } });

    // Set refresh token as cookie
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRATION')),
    });

    return {
      access_token: this.jwtService.sign(payload),
      user: { _id, name, email, role, permissions },
    };
  }

  async register(user: RegisterUserDto) {
    const isExist = await this.db
      .collection('users')
      .findOne({ email: user.email });
    if (isExist) {
      throw new BadRequestException(
        `Email ${user.email} đã tồn tại trong hệ thống. Vui lòng sử dụng email khác để đăng ký tài khoản`,
      );
    }

    const userRole = await this.db
      .collection('roles')
      .findOne({ name: 'NORMAL_USER' });

    const newUser = await this.db.collection('users').insertOne({
      ...user,
      password: this.usersService.getHashPassword(user.password),
      createdAt: new Date(),
      updatedAt: new Date(),
      role: new ObjectId(userRole?._id),
    });

    return {
      _id: newUser.insertedId,
      createdAt: new Date(),
    };
  }

  createRefreshToken(payload: any): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn:
        ms(this.configService.get<string>('JWT_REFRESH_EXPIRATION')) / 1000,
    });
  }

  async processNewToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      });

      const user = await this.db.collection('users').findOne({ refreshToken });
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: 'token refresh',
          iss: 'from server',
          _id,
          name,
          email,
          role,
        };

        const newRefreshToken = this.createRefreshToken(payload);

        // Update user with new refresh token
        await this.db
          .collection('users')
          .updateOne(
            { _id: new ObjectId(_id) },
            { $set: { refreshToken: newRefreshToken } },
          );

        // Save refresh token into cookie
        response.clearCookie('refresh_token');
        response.cookie('refresh_token', newRefreshToken, {
          httpOnly: true,
          maxAge: ms(this.configService.get<string>('JWT_REFRESH_EXPIRATION')),
        });

        return {
          access_token: this.jwtService.sign(payload),
          user,
        };
      } else {
        throw new BadRequestException('Refresh token không hợp lệ');
      }
    } catch (error) {
      console.error('Error occured at AuthService::processNewToken: ', error);
      throw new BadRequestException('Refresh token không hợp lệ');
    }
  }

  async logout(response: Response, user: IUser) {
    await this.db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(user._id) },
        { $set: { refreshToken: '' } },
      );
    response.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }
}
