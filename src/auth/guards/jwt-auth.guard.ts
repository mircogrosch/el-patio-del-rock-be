// src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'; // Importamos la clave de nuestro decorador

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // 1. Verificamos si la ruta o el controlador tienen el decorador @Public()
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 2. Si es pública, dejamos pasar la petición (return true)
    if (isPublic) {
      return true;
    }

    // 3. Si no es pública, ejecutamos la lógica estándar de Passport-JWT
    // Esto llamará a tu JwtStrategy para validar el token
    return super.canActivate(context);
  }
}