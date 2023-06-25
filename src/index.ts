import { Hono } from 'hono'
import { customAlphabet } from 'nanoid'

type Bindings = {
	URL_MAPPINGS: KVNamespace
}
const app = new Hono<{ Bindings: Bindings }>()

const regUrl = new RegExp(/(https?:\/\/[\w\-\.\/\?\,\#\:\u3000-\u30FE\u4E00-\u9FA0\uFF01-\uFFE3]+)/)
const regKey = new RegExp(/^[a-zA-Z0-9]{8}$/)
const id = customAlphabet('23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnpqrstuvwxyz', 8)

app.get('/', async (c) => {
	return c.text(`[usages] curl -H 'Content-Type: application/json' -X POST ${c.req.url}create' -d '{"url":"https://example.com","exp":60}'`)
})

app.post('/create', async (c) => {
	console.info(c.env)
	const { url, exp } = await c.req.json<{ url: string; exp: string }>()
	const intExp = parseInt(exp)
	if (!regUrl.test(url)) {
		return c.json({ message: 'Unprocessable Entity: The url should be a valid url format.' }, 422)
	}
	if (isNaN(intExp)) {
		return c.json({ message: 'Unprocessable Entity: The exp should be an integer.' }, 422)
	}
	if (!(1 < intExp && intExp <= 2592000)) {
		return c.json({ message: 'Unprocessable Entity: Keep the exp within the range of 1 to 2592000.' }, 422)
	}
	const key = id()
	await c.env.URL_MAPPINGS.put(key, url, { expirationTtl: intExp })
	return c.text(c.req.url.replace('/create', '/') + key, 201)
})

app.get('/:key', async (c) => {
	const key = await c.req.param('key')
	if (!regKey.test(key)) {
		return c.json({ message: 'Unprocessable Entity: The key should be 8 alphanumeric characters.' }, 422)
	}
	const url = await c.env.URL_MAPPINGS.get(key)
	if (url === null) {
		return c.notFound()
	}
	return c.redirect(url)
})

export default app
