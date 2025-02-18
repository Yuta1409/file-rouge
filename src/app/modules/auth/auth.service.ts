import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { DecodedToken } from '@interfaces/DecodedToken';

@Injectable()
export class AuthService {
  constructor(@InjectFirebaseAdmin() private readonly fa: FirebaseAdmin) {}

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async verifyToken(request: Request) {
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("Token d'authentification manquant");
    }

    try {
      const decodedToken = (await this.fa.auth.verifyIdToken(
        token
      )) as DecodedToken;
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Token invalide');
    }
  }
}
