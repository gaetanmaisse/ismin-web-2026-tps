import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';

/**
 * The tests of the login and of the protected route: card 8, then step 5 of
 * the README. The application is started for you; the four tests are yours.
 */
describe('/auth API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login returns a token for alice / secret', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'alice', password: 'secret' })
      .expect(200);
    expect(typeof response.body.access_token).toBe('string');
    expect(response.body.access_token.split('.')).toHaveLength(3);
  });

  it('POST /auth/login answers 401 for a wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'alice', password: 'nope' })
      .expect(401);
  });

  it('GET /auth/whoami answers 401 without a token', async () => {
    await request(app.getHttpServer()).get('/auth/whoami').expect(401);
  });

  it('GET /auth/whoami returns the payload with a token', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username: 'bob', password: 'secret' })
      .expect(200);
    const response = await request(app.getHttpServer())
      .get('/auth/whoami')
      .set('Authorization', `Bearer ${login.body.access_token}`)
      .expect(200);
    expect(response.body).toMatchObject({ username: 'bob', role: 'user' });
  });
});
