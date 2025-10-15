import {
  Injectable,
  BadRequestException,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { UserService } from 'src/user/user.service';
import { UtilService } from 'src/util/util.service';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { SignUpDto } from './dto/signup.dto';
import { DbService } from "../db/db.service";
import * as bcrypt from 'bcrypt';
import { SESv2Client, CreateEmailIdentityCommand, GetEmailIdentityCommand } from "@aws-sdk/client-sesv2";
@Injectable()
export class AuthService {
  private ses: SESv2Client;
  private readonly secretKey: string;
  private readonly apiKey: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly utilService: UtilService,
    public dbService: DbService,
  ) {

  }
  async signUp(request: { email: string; password: string; name: string, phone_number: string, role: string }): Promise<any> {
    try {
      const { email, password, name, phone_number, role } = request;
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds
      const usercreatePayload = {
        name: name,
        email,
        created_dt: new Date(),
        email_verified: 0,
        phone_verified: 0,
        password: hashedPassword,
        role: role,
      };
      // Optional DB sync
      return await this.createUser(usercreatePayload);
    } catch (error) {

      throw new BadRequestException(error.message || 'Signup failed');
    }
  }

  getToken(userId, userEmail) {
    const tokenCreationTime = Math.floor(Date.now() / 1000);
    const jti = uuidv4();
    const payload = {
      iss: this.apiKey,
      iat: tokenCreationTime,
      jti: jti,
      sub: userId,
      email: userEmail
    };
    const token = jwt.sign(payload, this.secretKey);
    return token;
  }

  async createUser(usercreatePayload) {
    try {
      //const hashedPassword = await bcrypt.hash(usercreatePayload.password, 10); // 10 is the salt rounds
      const setData = [
        { set: 'name', value: String(usercreatePayload.name) },
        { set: 'email', value: String(usercreatePayload.email) },
        { set: 'password', value: String(usercreatePayload.password ?? '') },
        { set: 'phone', value: String(usercreatePayload.phone_number ?? '') },
        // { set: 'role', value: String(usercreatePayload.role ?? '') },
      ]
      const insertion = await this.dbService.insertData('users', setData);
      return this.utilService.successResponse(insertion, 'User created successfully.');
    } catch (error) {
      console.error('Create User Error:', error);
      throw error;
    }
  }

  async signIn(request: { email: string; password: string }): Promise<any> {
    try {
      const { email, password } = request;
      const user = await this.dbService.execute(`select id,name,password,status,role from users where email='${email}'`); // implement this method
      console.log(user,'user')
      if (!user || user.length === 0) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // 2. Check if user is active
      if (user[0]?.status !== 1) {
        throw new UnauthorizedException('User is not active');
      }
      const isMatch = await bcrypt.compare(password, user[0].password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid email or password');
      }
      const payload = {
        email: email,
        role: [user[0]?.role]
      };
      const accessToken = await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      });
      return {
        accessToken,
        id: user[0].id,
        name: user[0].name,

      };
    } catch (err) {
      console.error('sign-in error:', err);
      throw new UnauthorizedException('Invalid email or password', err);
    }
  }

  async forgotPassword(email: string): Promise<any> {
    try {
      return {
        success: true,
        message: 'Password reset code sent to your email',
      };
    } catch (err) {
      throw new BadRequestException(err.message || 'Failed to initiate password reset');
    }
  }

  async resetPassword(email: string, verificationCode: string, newPassword: string): Promise<any> {
    const secretHash = this.utilService.generateSecretHash(email, this.clientId, this.clientSecret);
    // const command = new ConfirmForgotPasswordCommand({
    //   ClientId: this.clientId,
    //   Username: email,
    //   ConfirmationCode: verificationCode,
    //   Password: newPassword,
    //   SecretHash: secretHash,
    // });

    try {
      // await this.cognitoClient.send(command);
      return {
        success: true,
        message: 'Password has been reset successfully'
      };
    } catch (err) {
      console.error('Cognito reset password error:', err);
      throw new BadRequestException(err.message || 'Failed to reset password');
    }
  }
}
