import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { ModelsService } from '../src/models/models.service.js';
import { OrganisationsService } from '../src/organisations/organisations.service.js';

/**
 * The assignment. Reading stays public; writing requires a token; deleting
 * requires the admin role; every model remembers who created it.
 * Do not modify: make them pass.
 */

const mistralai = { slug: 'mistralai', name: 'Mistral AI', country: 'FR' };

const mistral = {
  id: 'mistral-7b-instruct-v0-3',
  name: 'Mistral-7B-Instruct-v0.3',
  org: 'mistralai',
  task: 'text-generation',
  parameters: 7.25,
};

describe('/models API (protected)', () => {
  let app: INestApplication;
  let models: ModelsService;
  let organisations: OrganisationsService;
  let adminToken: string;
  let userToken: string;

  async function login(username: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ username, password: 'secret' })
      .expect(200);
    return response.body.access_token as string;
  }

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();

    models = app.get(ModelsService);
    organisations = app.get(OrganisationsService);
    adminToken = await login('alice');
    userToken = await login('bob');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await models.clear();
    await organisations.create(mistralai);
  });

  // ─── Step 1 ────────────────────────────────────────────────────────────
  describe('reading stays public', () => {
    it('lists the models without a token', async () => {
      const response = await request(app.getHttpServer()).get('/models').expect(200);
      expect(response.body).toEqual([]);
    });

    it('answers 404 for an unknown model, without a token', async () => {
      await request(app.getHttpServer()).get('/models/nope').expect(404);
    });
  });

  // ─── Step 2 ────────────────────────────────────────────────────────────
  describe('writing requires a token', () => {
    it('rejects a creation without a token', async () => {
      await request(app.getHttpServer()).post('/models').send(mistral).expect(401);
    });

    it('rejects a creation with a forged token', async () => {
      await request(app.getHttpServer())
        .post('/models')
        .set('Authorization', 'Bearer not-a-real-token')
        .send(mistral)
        .expect(401);
    });

    it('accepts a creation from a logged-in user', async () => {
      const response = await request(app.getHttpServer())
        .post('/models')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mistral)
        .expect(201);
      expect(response.body).toMatchObject({ ...mistral, downloads: 0 });
    });

    it('rejects a modification without a token', async () => {
      await request(app.getHttpServer()).patch(`/models/${mistral.id}`).send({ name: 'x' }).expect(401);
    });

    it('accepts a modification from a logged-in user', async () => {
      await request(app.getHttpServer()).post('/models').set('Authorization', `Bearer ${userToken}`).send(mistral).expect(201);

      const response = await request(app.getHttpServer())
        .patch(`/models/${mistral.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ license: 'apache-2.0' })
        .expect(200);
      expect(response.body).toMatchObject({ ...mistral, license: 'apache-2.0' });
    });

    it('rejects a deletion without a token', async () => {
      await request(app.getHttpServer()).delete(`/models/${mistral.id}`).expect(401);
    });
  });

  // ─── The rules of the catalogue, already enforced by the given code ────
  describe('the rules of the catalogue', () => {
    it('refuses a model whose organisation does not exist', async () => {
      await request(app.getHttpServer())
        .post('/models')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...mistral, org: 'nobody' })
        .expect(422);
    });

    it('refuses a model whose id already exists', async () => {
      await request(app.getHttpServer()).post('/models').set('Authorization', `Bearer ${userToken}`).send(mistral).expect(201);
      await request(app.getHttpServer()).post('/models').set('Authorization', `Bearer ${userToken}`).send(mistral).expect(409);
    });

    it('refuses a download count sent by the client', async () => {
      await request(app.getHttpServer())
        .post('/models')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...mistral, downloads: 1_000_000 })
        .expect(400);
    });
  });

  // ─── Step 3 ────────────────────────────────────────────────────────────
  describe('the author is recorded', () => {
    it('stamps the creator on the model', async () => {
      const response = await request(app.getHttpServer())
        .post('/models')
        .set('Authorization', `Bearer ${userToken}`)
        .send(mistral)
        .expect(201);
      expect(response.body.createdBy).toBe('bob');

      const read = await request(app.getHttpServer()).get(`/models/${mistral.id}`).expect(200);
      expect(read.body.createdBy).toBe('bob');
    });

    it('ignores a createdBy sent by the client', async () => {
      await request(app.getHttpServer())
        .post('/models')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...mistral, createdBy: 'alice' })
        .expect(400);
    });
  });

  // ─── Step 4 ────────────────────────────────────────────────────────────
  describe('deleting is for admins', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/models')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(mistral)
        .expect(201);
    });

    it('refuses a plain user', async () => {
      await request(app.getHttpServer())
        .delete(`/models/${mistral.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('lets an admin delete', async () => {
      await request(app.getHttpServer())
        .delete(`/models/${mistral.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
      await request(app.getHttpServer()).get(`/models/${mistral.id}`).expect(404);
    });

    it('still answers 404 to an admin for an unknown model', async () => {
      await request(app.getHttpServer())
        .delete('/models/nope')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
