import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const appController = app.get<AppController>(AppController);
      expect(appController.getData()).toEqual({message: 'Hello API'});
    });
  });

  describe('ping', () => {
    it('should return status 200 and {status: "OK"}', async () => {
      const appController = app.get<AppController>(AppController);
      const response = appController.ping();
      expect(response).toEqual({ status: 'OK' });
    });
  });
});
