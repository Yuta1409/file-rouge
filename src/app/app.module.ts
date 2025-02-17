import { Module } from '@nestjs/common';
import { FirebaseModule } from 'nestjs-firebase';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingController } from './ping/ping.controller';
import { PingModule } from './ping/ping.module';

@Module({
  imports: [
    PingModule,
    FirebaseModule.forRoot({
      googleApplicationCredential: 'src/assets/chat-quizzy-firebase-key.template.json',
    }),
  ],
  controllers: [AppController, PingController],
  providers: [AppService],
})
export class AppModule {}