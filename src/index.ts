/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `wrangler dev src/index.ts` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `wrangler publish src/index.ts --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
}
import { getSpeechAuth, generateChunk, moveToTransfer, generateSpeech } from './helpers'

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	) {
		const speechAuth = await getSpeechAuth()		

		const chunks = await generateChunk('https://raw.githubusercontent.com/nhuyk56/SyncStorage1/2e267fac53a5eedae923235dfdd7408a/8a90f70d52dc5231ca9dd3a418fc5070')
		const filesTransfer =  await Promise.all(chunks.map((c:string) => moveToTransfer(c)))
		// return new Response(JSON.stringify(filesTransfer))

		const dataSpeech =  await generateSpeech({
			fileText: filesTransfer[0],
			// contentText: chunks[0],
			headers: speechAuth
		})

		return new Response(JSON.stringify(dataSpeech))
	},
};
