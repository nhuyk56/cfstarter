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

const controllerAuth = async (r: Request) => getSpeechAuth().then(({ authorization }) => authorization.replace('MS-SessionToken', '').trim())
const controllerChunks = async (r: Request) => {
  try {
    // nhuyk56-SyncStorage1-2e267fac53a5eedae923235dfdd7408a-8a90f70d52dc5231ca9dd3a418fc5070
    // https://raw.githubusercontent.com/nhuyk56/SyncStorage1/2e267fac53a5eedae923235dfdd7408a/8a90f70d52dc5231ca9dd3a418fc5070
    const { url } = await parseRequest(r)
    const { pathname } = new URL(url)
    const [userName, repo, brand, fileName] = pathname.split('/').pop()?.split('-') || []
    const textURL = `https://raw.githubusercontent.com/${userName}/${repo}/${brand}/${fileName}`
    const chunks = await generateChunk(textURL).then(chunks => Promise.all(chunks.map((c: string) => moveToTransfer(c))))
    return { chunks }
  } catch (error: any) {
    console.log(error?.message || error, 'controllerChunks')
  }
  return null
}
const controllerAudio = async (r: Request) => {
  try {
    // transfer.sh-Ds32O7-hello.txt
    // "https://transfer.sh/Ds32O7/hello.txt"
    const input = await parseRequest(r)
    const { pathname } = new URL(input.url)
    const [hostFile, ID1, ID2] = pathname.split('/').pop()?.split('-') || []
    const fileText = `https://${hostFile}/${ID1}/${ID2}`
    const headers = await getSpeechAuth()
    return generateSpeech({ fileText, headers })
  } catch (error: any) {
    console.log(error?.message || error, 'controllerChunks')
  }
  return null
}

export {
  controllerAuth,
  controllerChunks,
  controllerAudio
}