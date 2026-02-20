import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import bcrypt from 'bcrypt'

// auth/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService, // Debes tener un UsersService
    private jwtService: JwtService,
  ) {}

  async login(user: any) {
    const payload = { username: user.username, sub: user.id, rol: user.rol };
    console.log('LOGIN ---------------->', user)
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        username: user.username,
        rol: user.rol,
        name: user.username
      }
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}