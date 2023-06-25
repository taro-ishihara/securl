import app from './index'

jest.mock('nanoid', () => {
	return { customAlphabet: () => () => 'ABCD5678' }
})

describe('POST /create', () => {
	test('Invalid URL', async () => {
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'ftp://example.com/', exp: 60 }),
		})
		const res = await app.request(req)
		expect(res.status).toBe(422)
	})
	test('Invalid EXP', async () => {
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 'three second' }),
		})
		const res = await app.request(req)
		expect(res.status).toBe(422)
	})
	test('Zero EXP', async () => {
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 0 }),
		})
		const res = await app.request(req)
		expect(res.status).toBe(422)
	})
	test('Too Long EXP', async () => {
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 2592001 }),
		})
		const res = await app.request(req)
		expect(res.status).toBe(422)
	})
})

describe('GET /:key', () => {
	test('Too Long Key', async () => {
		const res = await app.request('/key123456')
		expect(res.status).toBe(422)
	})
	test('Too Short Key', async () => {
		const res = await app.request('/key1234')
		expect(res.status).toBe(422)
	})
})
