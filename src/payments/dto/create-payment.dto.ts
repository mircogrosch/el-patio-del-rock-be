import { 
  IsEmail, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  IsUrl, 
  Min 
} from 'class-validator';

export class CreatePaymentDto {
  
  @IsNumber()
  @IsNotEmpty()
  reservationId: number;

  @IsString()
  @IsNotEmpty()
  bandName: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  unitPrice: number;

  @IsString()
  @IsNotEmpty()
  customerName: string;

  @IsEmail()
  @IsNotEmpty()
  customerEmail: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}