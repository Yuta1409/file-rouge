import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { AppService } from './app.service';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectFirebaseAdmin() private readonly fa: FirebaseAdmin
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('ping')
  async ping() {
    try {
      const usersCollection = this.fa.firestore.collection('Users');
      await usersCollection.get();

      return {
        status: 'OK',
        details: { database: 'OK' },
      };
    } catch (error) {
      console.error(error);
      return {
        status: 'Partial',
        details: { database: 'KO' },
      };
    }
  }

  @Post('users')
  async addUser(@Body() user: { username: string }, @Req() request: Request) {
    try {
      // Validation et nettoyage des données
      const token = this.extractTokenFromHeader(request);

      if (!token) {
        return {
          status: 'KO',
          details: { error: 'Token d\'authentification manquant' },
        };
      }

      // Décodage du token JWT
      try {
        const decodedToken = await this.fa.auth.verifyIdToken(token);
        const uid = decodedToken.uid;
        
        // Validation du username
        if (!user.username) {
          return {
            status: 'KO',
            details: { error: 'Le champ username est obligatoire' },
          };
        }

        // Ajout de l'utilisateur avec son UID Firebase
        await this.fa.firestore.collection('Users').add({
          username: user.username,
          uid: uid,
          createdAt: new Date(),
        });

        return {
          status: 'OK',
        };
      } catch (tokenError) {
        console.error(tokenError);
        return {
          status: 'KO',
          details: { error: 'Token invalide' },
        };
      }
    } catch (error) {
      console.error(error);
      return {
        status: 'KO',
        details: { error: "Erreur lors de l'ajout de l'utilisateur" },
      };
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined { const [type, token] = request.headers.authorization?.split(' ') ?? []; return type === 'Bearer' ? token : undefined; }
}
