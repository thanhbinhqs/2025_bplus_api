import { BadRequestException, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/regsiter-user.dto';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { Response } from 'express';
import { ArrayContains, DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { Utils } from 'src/common/helpers/utils';
import { Permission } from 'src/user/entities/permission.entity';

@Injectable()
export class AuthService {
  constructor(
    //add database manager here,
    private readonly dbSource: DataSource,
    //add configuration here,
    private readonly configService: ConfigService,
    //add jwt service here,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: RegisterUserDto) {
    //destructor body
    const { username, password, email, fullname, phone, address, avatar, gen } =
      body;
    //check if user exists
    let user = await this.dbSource.manager.findOne(User, {
      where: {
        username: username.trim().toLocaleLowerCase(),
      },
    });
    if (user) throw new BadRequestException('User already exists');
    user = await this.dbSource.manager.save(User, {
      username: username.trim().toLocaleLowerCase(),
      password: password.trim(),
      email: email?.trim(),
      fullname: fullname?.trim(),
      phone: phone?.trim(),
      address: address?.trim(),
      avatar: avatar?.trim(),
      gen: gen?.trim(),
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      gen: user.gen,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      active: user.active,
    };
  }

  async login(body: LoginDto, response: Response) {
    //destructor body
    const { username, password } = body;

    const user = await this.dbSource.manager.findOne(User, {
      where: {
        username: username.trim().toLocaleLowerCase(),
        deleted: false,
      },
    });
    if (!user) throw new BadRequestException('User not found');
    if (!Utils.comparePassword(password, user.password))
      throw new BadRequestException('Invalid password');
    if (!user.active) throw new BadRequestException('User not active');

    //create jwt token
    const token = this.jwtService.sign(
      {
        id: user.id,
        username: user.username,
      },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN'),
      },
    );
    //add token to user
    var tokens = user.tokens || [];
    //max tokens, get from config
    const maxTokens = parseInt(this.configService.get('JWT_MAX_TOKENS') || '5');
    if (tokens.length >= maxTokens) tokens.shift();
    tokens.push(token);
    user.tokens = tokens;

    await this.dbSource.manager.save(user);
    //set cookie
    response.cookie('access-token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
      maxAge:
        parseInt(this.configService.get('JWT_EXPIRES_IN') || '86400') * 1000,
    });

    //return user data
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      fullname: user.fullname,
      phone: user.phone,
      address: user.address,
      avatar: user.avatar,
      gen: user.gen,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      active: user.active,
      token: token,
    };
  }

  async logout(query: LogoutDto, response: Response) {
    //destructor query
    let { token } = query;

    if(!token)
      token = Utils.extractToken(response.req);

    if (token) {
      //find user by token
      const user = await this.dbSource.manager.findOne(User, {
        where: {
          tokens: ArrayContains([token]),
          deleted: false,
        },
      });
      if (user) {
        //remove token from user
        user.tokens = user.tokens.filter((t) => t !== token);
        await this.dbSource.manager.save(user);
      }
    }
    //remove token from cookie
    response.clearCookie('access-token', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    return {
      message: 'Logout successfully',
    };
  }

  //seeding 1000 users with random data and random active deleted status
  async seed() {
    //add admin user
    const password = Utils.hashPassword('1234567890');
    const admin = await this.dbSource.manager.findOne(User, {
      where: {
        username: 'admin',
      },
    });

    const adminPermission = await this.dbSource.manager.save(Permission, {
      subject: '*',
      action: '*',
    })

    if(!admin){

      await this.dbSource.manager.save(User, {
        username: 'admin',
        password: password,
        email: 'admin@example.com',
        fullname: 'Administrator',
        phone: '1234567890',
        address: 'Admin Address',
        avatar: '',
        gen: 'M',
        active: true,
        deleted: false,
        tokens: [],
        permissions: [adminPermission]
      });
    }
    
    const users : any = [];
    for (let i = 0; i < 1000; i++) {
      users.push({
      username: `user${i}`,
      password: password,
      email: `user${i}@example.com`,
      fullname: `User ${i}`,
      phone: `12345678${i}`,
      address: `Address ${i}`,
      avatar: '',
      gen: i % 2 === 0 ? 'M' : 'F',
      active: Math.random() > 0.5,
      deleted: Math.random() > 0.5,
      tokens: [],
      });
    }
    await this.dbSource.manager.save(User, users);

    return {
      message: 'Seeded 1000 users successfully',
    };
  }
}
