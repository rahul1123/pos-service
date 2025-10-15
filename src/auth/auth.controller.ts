import { Controller, Get, HttpStatus, Post, Req, Res, UseGuards, Body,BadRequestException, Param,Query } from "@nestjs/common";
import { UserService } from '../user/user.service';
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { OAuth2Client } from 'google-auth-library';
import { UtilService } from 'src/util/util.service';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignUpDto,SignInDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@ApiTags('Auth')
@Controller("auth")
export class AuthController {
    constructor(
        public authService: AuthService, private utilService: UtilService
    ) {
    }

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user in Cognito and sync to DB' })
  @ApiBody({ type: SignUpDto })
  @ApiResponse({ status: 201, description: 'User signed up successfully' })
  @ApiResponse({ status: 400, description: 'Signup failed or input error' })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

    @Post('signin')
  @ApiOperation({ summary: 'Authenticate user and return JWT tokens from Cognito' })
  @ApiBody({ type: SignInDto })
  @ApiResponse({ status: 200, description: 'User signed in successfully' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Initiate password reset process' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset code sent to email' })
  @ApiResponse({ status: 400, description: 'Failed to initiate password reset' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using verification code' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Failed to reset password' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.email,
      resetPasswordDto.verificationCode,
      resetPasswordDto.newPassword
    );
  }
@Get('generate-token')
  generateToken() {
    const userId = 'default-user-id';
    const email = 'default@example.com';
    const token = this.authService.getToken(userId, email);
    return { access_token: token };
  }



 

 

  


}
