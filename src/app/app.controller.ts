import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import { AppService } from './app.service';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

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
      // Initialiser Firebase avec les variables d'environnement
      const app = initializeApp({
        apiKey: process.env.apiKey,
        authDomain: process.env.authDomain,
        projectId: process.env.projectId,
        storageBucket: process.env.storageBucket,
        messagingSenderId: process.env.messagingSenderId,
        appId: process.env.appId,
      });
      const db = getFirestore(app);
      
      // Tester la connexion en essayant de lire une collection
      try {
        await getDocs(collection(db, 'Users'));
        return {
          status: 'OK',
          details: { database: 'OK' }
        };
      } catch (dbError) {
        return {
          status: 'Partial',
          details: { database: 'KO' }
        };
      }
    } catch (error) {
      throw new HttpException({
        status: 'KO',
        details: { database: 'KO' }
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
