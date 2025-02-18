import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  HttpCode,
  Header,
  Param,
} from '@nestjs/common';
import {
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
} from '@nestjs/common';

import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { AppService } from './app.service';
import { Request, Response } from 'express';
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

  @Get('quiz')
  async getUserQuizzes(@Req() request: Request) {
    try {
      // Vérification de l'authentification
      const { uid } = await this.authService.verifyToken(request);
      // Récupération des quiz de l'utilisateur
      const quizzesSnapshot = await this.fa.firestore
        .collection('Quizz')
        .where('userId', '==', uid)
        .get();

      const quizzes = quizzesSnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
      }));

      return {
        status: 200,
        data: quizzes,
        _links: {
          create: `${request.protocol}://${request.get('host')}/api/quiz`,
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la récupération des quiz'
      );
    }
  }

  @Post('quiz')
  @HttpCode(201)
  @Header('Access-Control-Expose-Headers', 'Location')
  async createQuiz(
    @Body() quizData: { title: string; description: string },
    @Req() request: Request,
    @Res() response: Response
  ) {
    try {
      const { uid } = await this.authService.verifyToken(request);

      if (!quizData.title) {
        throw new BadRequestException('Le titre est obligatoire');
      }

      const quizRef = await this.fa.firestore.collection('Quizz').add({
        title: quizData.title,
        description: quizData.description,
        userId: uid,
        createdAt: new Date(),
      });

      const locationUrl = `${request.protocol}://${request.get('host')}/api/quiz/${quizRef.id}`;
      
      response.setHeader('Location', locationUrl);
      response.setHeader('Access-Control-Expose-Headers', 'Location');
      
      return response.status(201).json({
        status: 201,
        data: {
          id: quizRef.id,
          title: quizData.title,
          description: quizData.description,
        },
      });
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la création du quiz'
      );
    }
  }

  @Get('quiz/:id')
  async getQuizById(@Req() request: Request, @Param('id') quizId: string) {
    try {
      const { uid } = await this.authService.verifyToken(request);
      const quizDoc = await this.fa.firestore
        .collection('Quizz')
        .doc(quizId)
        .get();

      if (!quizDoc.exists || quizDoc.data().userId !== uid) {
        throw new NotFoundException('Quiz non trouvé');
      }

      const quizData = quizDoc.data();
      return {
        title: quizData.title,
        description: quizData.description,
        questions: quizData.questions || [],
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erreur lors de la récupération du quiz'
      );
    }
  }
}
