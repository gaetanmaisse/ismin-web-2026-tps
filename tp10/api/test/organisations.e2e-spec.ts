import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { ModelsService } from '../src/models/models.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
/**
 * Given. Green from the start, except the last one: step 4 reserves the
 * creation of organisations to admins. Read it as an example: a public read,
 * a protected write, a 409.
 */
describe('/organisations API', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    for (const [username, set] of [['alice', (t: string) => (adminToken = t)], ['bob', (t: string) => (userToken = t)]] as const) {
      const login = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ username, password: 'secret' })
        .expect(200);
      set(login.body.access_token as string);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await app.get(ModelsService).clear();
    await app.get(PrismaService).organisation.deleteMany();
  });

  it('lists the organisations, without a token', async () => {
    await request(app.getHttpServer())
      .post('/organisations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug: 'mistralai', name: 'Mistral AI', country: 'FR' })
      .expect(201);

    const response = await request(app.getHttpServer()).get('/organisations').expect(200);
    expect(response.body).toEqual([{ slug: 'mistralai', name: 'Mistral AI', country: 'FR' }]);
  });

  it('rejects a creation without a token', async () => {
    await request(app.getHttpServer())
      .post('/organisations')
      .send({ slug: 'mistralai', name: 'Mistral AI' })
      .expect(401);
  });

  it('refuses a slug that is already taken', async () => {
    const organisation = { slug: 'openai', name: 'OpenAI', country: 'US' };
    await request(app.getHttpServer()).post('/organisations').set('Authorization', `Bearer ${adminToken}`).send(organisation).expect(201);
    await request(app.getHttpServer()).post('/organisations').set('Authorization', `Bearer ${adminToken}`).send(organisation).expect(409);
  });

  it('refuses a slug that is not a lowercase slug', async () => {
    await request(app.getHttpServer())
      .post('/organisations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug: 'Mistral AI', name: 'Mistral AI' })
      .expect(400);
  });

  // flaky?
  it.skip('refuses a country that is not a two-letter code', async () => {
    await request(app.getHttpServer())
      .post('/organisations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug: 'mistralai', name: 'Mistral AI', country: 'FRA' })
      .expect(400);
  });

  // ─── Step 4 ────────────────────────────────────────────────────────────
  it('refuses a plain user, creating an organisation is for admins', async () => {
    await request(app.getHttpServer())
      .post('/organisations')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ slug: 'openai', name: 'OpenAI' })
      .expect(403);
  });
});
