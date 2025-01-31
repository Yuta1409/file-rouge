import {
  Controller,
  Get,
  HttpStatus,
  HttpException,
  Body,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
dotenv.config();

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Get('ping')
  async ping() {
    try {
      const db = this.appService.getFirestore();

      // Tester la connexion en essayant de lire une collection
      try {
        await getDocs(collection(db, 'Users'));
        return {
          status: 'OK',
          details: { database: 'OK' },
        };
      } catch (dbError) {
        return {
          status: 'Partial',
          details: { database: 'KO' },
        };
      }
    } catch (error) {
      throw new HttpException(
        {
          status: 'KO',
          details: { database: 'KO' },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('users')
  async addUser(
    @Body() user: { name: string; email: string; password: string }
  ) {
    try {
      const db = this.appService.getFirestore();

      // Insertion d'un utilisateur dans la collection "Users"
      await addDoc(collection(db, 'Users'), {
        name: user.name,
        email: user.email,
        password: bcrypt.hashSync(user.password, 10),
      });

      return {
        status: 'OK',
      };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        {
          status: 'KO',
          details: { error: "Erreur lors de l'ajout de l'utilisateur" },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
