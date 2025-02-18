import axios from 'axios';
describe('POST /api/users', () => {
  it('should return 201 if user is authenticated', async () => {
    const auth = await axios.post(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email: 'test@gmail.com',
        password: '12345678',
        returnSecureToken: true,
      }
    );
    expect(auth.status).toBe(200);
    const token = auth.data.idToken;
    console.log(token);
    const userResponse = await axios.post(
      '/api/users',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    expect(userResponse.status).toBe(201);
  });
  it('should return 401 if user is not authenticated', async () => {
    try {
      await axios.post('/api/users', {});
    } catch (e) {
      expect(e.status).toBe(401);
    }
  });
});

describe('GET /api/users/me', () => {
  let authToken: string;

  beforeAll(async () => {
    // Authentification avant les tests
    const auth = await axios.post(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=${process.env.FIREBASE_API_KEY}`,
      {
        email: 'test@gmail.com',
        password: '12345678',
        returnSecureToken: true,
      }
    );
    authToken = auth.data.idToken;
  });

  it('devrait retourner les informations de l\'utilisateur connecté', async () => {
    const response = await axios.get('/api/users/me', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('uid');
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('username');
  });

  it('devrait retourner 401 si l\'utilisateur n\'est pas authentifié', async () => {
    try {
      await axios.get('/api/users/me');
      fail('La requête aurait dû échouer');
    } catch (error) {
      expect(error.response.status).toBe(401);
    }
  });

  it('devrait retourner 404 si l\'utilisateur n\'existe pas dans la base', async () => {
    // Simuler un token valide mais pour un utilisateur non existant
    const nonExistentUserToken = 'token_valide_mais_utilisateur_inexistant';
    
    try {
      await axios.get('/api/users/me', {
        headers: {
          Authorization: `Bearer ${nonExistentUserToken}`,
        },
      });
      fail('La requête aurait dû échouer');
    } catch (error) {
      expect(error.response.status).toBe(404);
      expect(error.response.data.message).toBe('Utilisateur non trouvé');
    }
  });
});
