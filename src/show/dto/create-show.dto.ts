// src/shows/dto/create-show.dto.ts
import { IsNotEmpty, IsISO8601, IsString, IsInt, Min } from 'class-validator';

export class CreateShowDto {
  @IsISO8601() // Valida formato YYYY-MM-DD
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string; // "21:00"

  @IsString()
  @IsNotEmpty()
  endTime: string;   // "23:00"
  @IsInt()
  @Min(1)
  price:number;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsInt()
  bandId: number; // El ID de la banda que ya debe existir
}