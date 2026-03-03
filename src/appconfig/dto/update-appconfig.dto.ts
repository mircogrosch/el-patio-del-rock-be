import { IsArray, IsEmail, IsString, IsOptional } from 'class-validator';

export class UpdateConfigDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  rules?: string[]; 

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  address?: string;
}