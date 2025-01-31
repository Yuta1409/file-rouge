import { Injectable } from '@nestjs/common';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AppService {
  private db: any;

  constructor() {
    const app = initializeApp({
      apiKey: process.env.apiKey,
      authDomain: process.env.authDomain,
      projectId: process.env.projectId,
      storageBucket: process.env.storageBucket,
      messagingSenderId: process.env.messagingSenderId,
      appId: process.env.appId,
    });
    this.db = getFirestore(app);
  }

  getFirestore() {
    return this.db;
  }

  getData(): { message: string } {
    return ({ message: 'Hello API' });
  }
}
