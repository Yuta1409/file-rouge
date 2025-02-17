import { Body, Controller, Get, Post } from '@nestjs/common';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { AppService } from './app.service';
import * as bcrypt from 'bcrypt';

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
  async addUser(
    @Body() user: { name: string; email: string; password: string }
  ) {
    try {
      // Validation et nettoyage des données
      if (!user.name || !user.email || !user.password) {
        return {
          status: 'KO',
          details: { error: 'Tous les champs sont obligatoires' }
        };
      }

      // Nettoyage des chaînes de caractères
      const sanitizedUser = {
        name: user.name.trim(),
        email: user.email.trim().toLowerCase(),
        password: user.password
      };

      // Vérification du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedUser.email)) {
        return {
          status: 'KO',
          details: { error: 'Format email invalide' }
        };
      }

      await this.fa.firestore.collection('Users').add({
        name: sanitizedUser.name,
        email: sanitizedUser.email,
        password: bcrypt.hashSync(sanitizedUser.password, 10),
      });

      return {
        status: 'OK',
      };
    } catch (error) {
      console.error(error);
      return {
        status: 'KO',
        details: { error: "Erreur lors de l'ajout de l'utilisateur" },
      };
    }
  }
}
