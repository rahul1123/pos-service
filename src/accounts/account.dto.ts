import { IsNotEmpty, IsOptional, IsString,IsDateString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import {
  ApiPropertyOptional,
  ApiProperty

} from '@nestjs/swagger';
export class CreateAccountDto {
  // @ApiProperty({

  //   description: 'Unique identifier for the account',
  // })
  // @IsString()
  // @IsNotEmpty()
  // id: string;

  @ApiProperty({
    example: 'u1',
    description: 'Owner ID associated with the account',
  })
  @IsString()
  @IsNotEmpty()
  owner_id: string;

  @ApiProperty({
    example: 'Acme Corporation',
    description: 'Name of the account',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Technology',
    description: 'Industry or business category of the account',
  })
  @IsString()
  @IsOptional()
  industry?: string;
}
export class UpdateAccountDto extends PartialType(CreateAccountDto) {}



//declared the  activities DTO here 
export class CreateActivityDto {
  @ApiProperty({ example: 'u1', description: 'User who performed the activity' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: 'call', description: 'Type of activity (e.g., call, email)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional({ example: 'Discussed product features' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2025-10-20T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  next_follow_up?: string;
}

export class UpdateActivityDto {
  @ApiPropertyOptional({ example: 'email' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ example: 'Sent proposal' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ example: '2025-10-25T10:30:00Z' })
  @IsOptional()
  @IsDateString()
  next_follow_up?: string;
}