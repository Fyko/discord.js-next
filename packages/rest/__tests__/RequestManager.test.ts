import nock from 'nock';
import { REST, DefaultRestOptions } from '../src';

const api = new REST();

nock(`${DefaultRestOptions.api}/v${DefaultRestOptions.version}`).get('/simpleGet').reply(200, { test: true });

test('no token', async () => {
	const promise = api.get('/simpleGet');
	await expect(promise).rejects.toThrowError('Expected token to be set for this request, but none was present');
	await expect(promise).rejects.toBeInstanceOf(Error);
});

test('negative offset', () => {
	const badREST = new REST({ offset: -5000 });

	expect(badREST.options.offset).toEqual(0);
});
