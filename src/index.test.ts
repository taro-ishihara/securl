import app from './index'
const fakeKey = 'ABCD5678'
jest.mock('nanoid', () => {
	return { customAlphabet: () => () => fakeKey }
})
const env = getMiniflareBindings()

describe('POST /create', () => {
	test('No Body', async () => {
		expect.assertions(2)
		const req = new Request('http://localhost/create', {
			method: 'POST',
		})
		const res = await app.fetch(req)
		expect(res.status).toBe(422)
		expect(await res.json()).toHaveProperty('message', 'Unprocessable Entity: Body is necessary.')
	})
	test('Invalid Url', async () => {
		expect.assertions(2)
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'ftp://example.com/', exp: 60 }),
		})
		const res = await app.fetch(req)
		expect(res.status).toBe(422)
		expect(await res.json()).toHaveProperty('message', 'Unprocessable Entity: The url should be a valid url format.')
	})
	test('Invalid Exp', async () => {
		expect.assertions(2)
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 'three second' }),
		})
		const res = await app.request(req)
		expect(res.status).toBe(422)
		expect(await res.json()).toHaveProperty('message', 'Unprocessable Entity: The exp should be an integer.')
	})
	test('Zero Exp', async () => {
		expect.assertions(2)
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 0 }),
		})
		const res = await app.request(req)
		expect(res.status).toBe(422)
		expect(await res.json()).toHaveProperty('message', 'Unprocessable Entity: Keep the exp within the range of 1 to 2592000.')
	})
	test('Too Long Exp', async () => {
		expect.assertions(2)
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 2592001 }),
		})
		const res = await app.request(req)
		expect(res.status).toBe(422)
		expect(await res.json()).toHaveProperty('message', 'Unprocessable Entity: Keep the exp within the range of 1 to 2592000.')
	})
	test('Created', async () => {
		expect.assertions(2)
		const req = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 60 }),
		})
		const res = await app.fetch(req, env)
		expect(res.status).toBe(201)
		expect(await res.text()).toBe('http://localhost/' + fakeKey)
	})
})

describe('GET /:key', () => {
	test('Too Short Key', async () => {
		expect.assertions(2)
		const res = await app.request('/key1234')
		expect(res.status).toBe(422)
		expect(await res.json()).toHaveProperty('message', 'Unprocessable Entity: The key should be 8 alphanumeric characters.')
	})
	test('Too Long Key', async () => {
		expect.assertions(2)
		const res = await app.request('/key123456')
		expect(res.status).toBe(422)
		expect(await res.json()).toHaveProperty('message', 'Unprocessable Entity: The key should be 8 alphanumeric characters.')
	})
	test('Key Not Exist', async () => {
		expect.assertions(1)
		const req = new Request('http://localhost/key12345')
		const res = await app.fetch(req, env)
		expect(res.status).toBe(404)
	})
})

describe('Complex', () => {
	test('Key Expired', async () => {
		expect.assertions(1)
		const reqCreate = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 1 }),
		})
		await app.fetch(reqCreate, env)
		await new Promise((resolve) => setTimeout(resolve, 1500))
		const reqGet = new Request('http://localhost/' + fakeKey)
		const resGet = await app.fetch(reqGet, env)
		expect(resGet.status).toBe(404)
	})
	test('Create and Redirect', async () => {
		expect.assertions(1)
		const reqCreate = new Request('http://localhost/create', {
			method: 'POST',
			body: JSON.stringify({ url: 'https://example.com/', exp: 60 }),
		})
		await app.fetch(reqCreate, env)
		const reqGet = new Request('http://localhost/' + fakeKey)
		const resGet = await app.fetch(reqGet, env)
		expect(resGet.status).toBe(302)
	})
})

describe('Other Routes', () => {
	test('Root', async () => {
		expect.assertions(1)
		const reqGet = new Request('http://localhost/')
		const resGet = await app.fetch(reqGet, env)
		expect(resGet.status).toBe(200)
	})
	test('Unknown Route', async () => {
		expect.assertions(1)
		const req = new Request('http://localhost/' + fakeKey, {
			method: 'PUT',
		})
		const res = await app.fetch(req)
		expect(res.status).toBe(404)
	})
})
