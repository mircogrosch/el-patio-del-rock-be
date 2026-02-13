// src/bands/dto/create-band.dto.ts
import { IsNotEmpty, IsString, IsUrl, MinLength } from 'class-validator';

export class CreateBandDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la banda es obligatorio' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El género es necesario para el filtro del front' })
  genre: string;

  @IsString()
  @MinLength(10, { message: 'La descripción debe ser un poco más larga' })
  description: string;

  @IsUrl({}, { message: 'La URL de la imagen debe ser válida' })
  imgMobile: string;

  @IsUrl({}, { message: 'La URL de la imagen debe ser válida' })
  imgDesktop:string;
}