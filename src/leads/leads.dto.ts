import { IsString, IsOptional } from 'class-validator';

export class CreateResellerDto {
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
export class UpdateResellerDto extends CreateResellerDto {
  @IsString()
  id: string; // Required for identifying which record to update
}
