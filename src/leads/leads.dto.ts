import { IsString, IsOptional ,IsEnum,IsDateString} from 'class-validator';
import { ApiProperty, ApiPropertyOptional  } from '@nestjs/swagger';
import { LeadStatus } from './lead-status.enum';
export class CreateLeadDto {
  @IsString()
  owner_id: string;
  @IsString()
  name: string;
  @IsOptional()
  @IsString()
  company?: string;
  @IsOptional()
  @IsString()
  status?: string; // Defaults to 'new' in DB
}
export class UpdateLeadDto {
  @ApiPropertyOptional({ example: 'Alice Johnson', description: 'Lead full name' })
  @IsOptional()
  @IsString()
  name?: string;
  owner_id?:string;
  @ApiPropertyOptional({ example: 'Tech Solutions Ltd', description: 'Company name' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ example: 'working', enum: LeadStatus, description: 'Status of the lead' })
  @IsOptional()
  @IsEnum(LeadStatus)
  status?: LeadStatus;
}

export class LeadSwaggerDto {
  @ApiProperty({ example: 'Alice Johnson', description: 'Lead full name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Tech Solutions Ltd', description: 'Company name' })
  @IsString()
  company: string;

  @ApiProperty({ example: 'new', description: 'Lead status', enum: ['new', 'contacted', 'qualified'] })
  @IsString()
  status: string;
    @ApiProperty({ example: 'u1', description: 'Owner ID of the lead' })
  @IsString()
  owner_id: string;
}

export class ConvertLeadDto {
  @ApiPropertyOptional({ example: 'Alice Johnson', description: 'Account name after conversion' })
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Tech Solutions Ltd', description: 'Company name after conversion' })
  @IsOptional()
  company?: string;

  @ApiPropertyOptional({ example: 'new', enum: LeadStatus, description: 'Status of the lead/account' })
  @IsOptional()
  @IsEnum(LeadStatus, { message: 'status must be one of: new, working, qualified, disqualified' })
  status?: LeadStatus;
}

 
//add filter lead swagger format 
export class FilterLeadsDto {
  @ApiPropertyOptional({ enum: ['new', 'working', 'qualified', 'disqualified'] })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter leads created from this date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({ description: 'Filter leads created up to this date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;
}