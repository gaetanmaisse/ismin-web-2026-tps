import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { ModelsService } from '../src/models/models.service.js';
import { OrganisationsService } from '../src/organisations/organisations.service.js';

const mistral = {
  id: 'mistral-7b-instruct-v0-3',
  name: 'Mistral-7B-Instruct-v0.3',
  org: 'mistralai',
  task: 'text-generation',
  parameters: 7.25,
};

describe('ModelsService', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'alice', password: 'secret' })
      .expect(200);
    token = login.body.access_token as string;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.get(ModelsService).clear();
    await app.get(OrganisationsService).create({ slug: 'mistralai', name: 'Mistral AI', country: 'FR' });
  });

  it('replaces an existing model instead of duplicating it', async () => {
    await request(app.getHttpServer()).post('/models').set('Authorization', `Bearer ${token}`).send(mistral).expect(201);
    await request(app.getHttpServer())
      .post('/models')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...mistral, name: 'Mistral 7B v0.3' })
      .expect(201);

    const response = await request(app.getHttpServer()).get('/models').expect(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].name).toBe('Mistral 7B v0.3');
  });
});
