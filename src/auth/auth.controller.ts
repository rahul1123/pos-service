import { Controller, Get, HttpStatus, Post, Req, Res, UseGuards, Body,BadRequestException, Param,Query } from "@nestjs/common";
import { Response } from "express";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
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
  @ApiOperation({ summary: 'Register a new user  to DB' })
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

  // @Post('forgot-password')
  // @ApiOperation({ summary: 'Initiate password reset process' })
  // @ApiBody({ type: ForgotPasswordDto })
  // @ApiResponse({ status: 200, description: 'Password reset code sent to email' })
  // @ApiResponse({ status: 400, description: 'Failed to initiate password reset' })
  // async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  //   return this.authService.forgotPassword(forgotPasswordDto.email);
  // }

 
 



 

 

  


}
