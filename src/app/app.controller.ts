import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';

import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { AppService } from './app.service';
import { Request } from 'express';
import { AuthService } from './modules/auth/auth.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectFirebaseAdmin() private readonly fa: FirebaseAdmin,
    private readonly authService: AuthService
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
      const { uid, email } = await this.authService.verifyToken(request);

      const existingUserSnapshot = await this.fa.firestore
        .collection('Users')
        .where('email', '==', email)
        .get();

      if (!existingUserSnapshot.empty) {
        throw new ConflictException(
          'Un utilisateur avec cet email existe déjà'
        );
      }

      if (!user.username) {
        throw new BadRequestException('Le champ username est obligatoire');
      }

      await this.fa.firestore.collection('Users').add({
        username: user.username,
        uid: uid,
        email: email,
        createdAt: new Date(),
      });

      return {
        status: 'OK',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Erreur lors de l'ajout de l'utilisateur"
      );
    }
  }

  @Get('users/me')
  async getCurrentUser(@Req() request: Request) {
    try {
      const { uid, email } = await this.authService.verifyToken(request);

      const userDoc = (
        await this.fa.firestore
          .collection('Users')
          .where('uid', '==', uid)
          .limit(1)
          .get()
      ).docs[0];

      if (!userDoc) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const userData = userDoc.data();

      return {
        uid,
        email,
        username: userData.username,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Erreur serveur');
    }
  }
}
