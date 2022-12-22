/**
 * TODO:
 * default: http://127.0.0.1:8787/chunks/nhuyk56-SyncStorage1-2e267fac53a5eedae923235dfdd7408a-8a90f70d52dc5231ca9dd3a418fc5070
 * dấu: userName, repo
 */
import {
  parseRequest,
  getSpeechAuth,
  generateChunk,
  moveToTransfer,
  generateSpeech
} from './helpers'

const controllerAuth = async (r:Request) => getSpeechAuth().then(({ authorization }) => authorization.replace('MS-SessionToken', '').trim())
const controllerChunks = async (r:Request) => {
  const { url } = await parseRequest(r)
  const { pathname } = new URL(url)
  const [userName, repo, brand, fileName]  = pathname.split('/').pop()?.split('-') || []
  const textURL = `https://raw.githubusercontent.com/${userName}/${repo}/${brand}/${fileName}`
  const chunks = await generateChunk(textURL).then(chunks => Promise.all(chunks.map((c:string) => moveToTransfer(c))))
  const auth = await controllerAuth(r)
  return { chunks, auth }
}
const controllerAudio = async (r:Request) => {
  const input = await parseRequest(r)
  return input
}

export {
  controllerAuth,
  controllerChunks,
  controllerAudio
}