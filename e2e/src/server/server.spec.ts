import axios from 'axios';

describe('GET /api', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ message: 'Hello API' });
  });
})

describe('GET /ping', () => {
  it('should return a message', async () => {
    const res = await axios.get(`/api/ping`);

    expect(res.status).toBe(200);
    expect(res.data).toEqual({ status: 'OK', details: { database: 'OK' } });
  });

  it('should return database status', async () => {
    const res = await axios.get(`/api/ping`);

    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('details');
    expect(res.data.details).toHaveProperty('database');
  });
})

describe('POST /users', () => {
  it('should add a user', async () => {
    const res = await axios.post(`/api/users`, { name: 'John Doe', email: 'john.doe@example.com', password: 'password' });

    expect(res.status).toBe(201);
    expect(res.data).toEqual({ status: 'OK' });
  });
})
