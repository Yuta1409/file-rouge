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
    expect(res.data).toEqual({ status: 'OK' });
  });
})