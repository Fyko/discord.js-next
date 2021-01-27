import nock from 'nock';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { REST, DefaultRestOptions } from '../src';
import { Routes, Snowflake } from 'discord-api-types/v8';

const newSnowflake = DiscordSnowflake.generate().toString() as Snowflake;

const api = new REST().setToken('A-Very-Fake-Token');

nock(`${DefaultRestOptions.api}/v${DefaultRestOptions.version}`)
	.get('/simpleGet')
	.reply(200, { test: true })
	.delete('/simpleDelete')
	.reply(200, { test: true })
	.patch('/simplePatch')
	.reply(200, { test: true })
	.put('/simplePut')
	.reply(200, { test: true })
	.post('/simplePost')
	.reply(200, { test: true })
	.get('/getQuery')
	.query({ foo: 'bar', hello: 'world' })
	.reply(200, { test: true })
	.get('/getAuth')
	.times(3)
	.reply(200, function handler() {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return { auth: this.req.headers.authorization?.[0] ?? null };
	})
	.get('/getReason')
	.times(3)
	.reply(200, function handler() {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return { reason: this.req.headers['x-audit-log-reason']?.[0] ?? null };
	})
	.post('/postEcho')
	.reply(200, (_, body) => body)
	.post('/postAttachment')
	.times(3)
	.reply(200, (_, body) => ({
		body: body
			.replace(/\r\n/g, '\n')
			.replace(/-+\d+-*\n?/g, '')
			.trim(),
	}))
	.delete('/channels/339942739275677727/messages/392063687801700356')
	.reply(200, { test: true })
	.delete(`/channels/339942739275677727/messages/${newSnowflake}`)
	.reply(200, { test: true });

test('simple GET', async () => {
	expect(await api.get('/simpleGet')).toEqual({ test: true });
});

test('simple DELETE', async () => {
	expect(await api.delete('/simpleDelete')).toEqual({ test: true });
});

test('simple PATCH', async () => {
	expect(await api.patch('/simplePatch')).toEqual({ test: true });
});

test('simple PUT', async () => {
	expect(await api.put('/simplePut')).toEqual({ test: true });
});

test('simple POST', async () => {
	expect(await api.post('/simplePost')).toEqual({ test: true });
});

test('getQuery', async () => {
	expect(
		await api.get('/getQuery', {
			query: new URLSearchParams([
				['foo', 'bar'],
				['hello', 'world'],
			]),
		}),
	).toEqual({ test: true });
});

test('getAuth default', async () => {
	expect(await api.get('/getAuth')).toEqual({ auth: 'Bot A-Very-Fake-Token' });
});

test('getAuth unauthorized', async () => {
	expect(await api.get('/getAuth', { auth: false })).toEqual({ auth: null });
});

test('getAuth authorized', async () => {
	expect(await api.get('/getAuth', { auth: true })).toEqual({ auth: 'Bot A-Very-Fake-Token' });
});

test('getReason default', async () => {
	expect(await api.get('/getReason')).toEqual({ reason: null });
});

test('getReason plain text', async () => {
	expect(await api.get('/getReason', { reason: 'Hello' })).toEqual({ reason: 'Hello' });
});

test('getReason encoded', async () => {
	expect(await api.get('/getReason', { reason: '😄' })).toEqual({ reason: '%F0%9F%98%84' });
});

test('postAttachment empty', async () => {
	expect(await api.post('/postAttachment', { attachments: [] })).toEqual({
		body: '',
	});
});

test('postAttachment attachment', async () => {
	expect(
		await api.post('/postAttachment', {
			attachments: [{ fileName: 'out.txt', rawBuffer: Buffer.from('Hello') }],
		}),
	).toEqual({
		body: [
			'Content-Disposition: form-data; name="out.txt"; filename="out.txt"',
			'Content-Type: text/plain',
			'',
			'Hello',
		].join('\n'),
	});
});

test('postAttachment attachment and JSON', async () => {
	expect(
		await api.post('/postAttachment', {
			attachments: [{ fileName: 'out.txt', rawBuffer: Buffer.from('Hello') }],
			body: { foo: 'bar' },
		}),
	).toEqual({
		body: [
			'Content-Disposition: form-data; name="out.txt"; filename="out.txt"',
			'Content-Type: text/plain',
			'',
			'Hello',
			'Content-Disposition: form-data; name="payload_json"',
			'',
			'{"foo":"bar"}',
		].join('\n'),
	});
});

test('postEcho', async () => {
	expect(await api.post('/postEcho', { body: { foo: 'bar' } })).toEqual({ foo: 'bar' });
});

test('Old Message Delete Edge-Case:old message', async () => {
	expect(await api.delete(Routes.channelMessage('339942739275677727', '392063687801700356'))).toEqual({ test: true });
});

test('Old Message Delete Edge-Case:new message', async () => {
	expect(await api.delete(Routes.channelMessage('339942739275677727', newSnowflake))).toEqual({ test: true });
});
