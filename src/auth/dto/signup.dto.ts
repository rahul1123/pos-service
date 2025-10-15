import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
export class SignUpDto {
  email: string;
  password: string;
  role:string;
}

export class SignInDto {
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}