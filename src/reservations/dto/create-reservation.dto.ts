import { IsEmail, IsNotEmpty, IsNumber, Min, IsInt } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  customerName: string;

  @IsEmail({}, { message: 'El formato del correo no es válido' })
  email: string;

  @IsInt()
  @Min(1, { message: 'Debes reservar al menos 1 lugar' })
  spots: number;

  @IsInt()
  showId: number;
}