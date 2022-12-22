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
  generateSpeech,
  handleError,
  CHUNK_SEPARATION
} from './helpers'

const controllerAuth = async (r: Request) => {
  const input = await parseRequest(r)
  try {
    return await getSpeechAuth().then(({ authorization }) => authorization.replace('MS-SessionToken', '').trim())
  } catch (error: any) {
    handleError({ error, input: JSON.stringify(input) }, 'CONTROLLER-AUTH')
  }
  return null  
}
const controllerChunks = async (r: Request) => {
  const input = await parseRequest(r)
  try {
    // nhuyk56-SyncStorage1-2e267fac53a5eedae923235dfdd7408a-8a90f70d52dc5231ca9dd3a418fc5070
    // https://raw.githubusercontent.com/nhuyk56/SyncStorage1/2e267fac53a5eedae923235dfdd7408a/8a90f70d52dc5231ca9dd3a418fc5070
    const { url } = input
    const { pathname } = new URL(url)
    const [userName, repo, brand, fileName] = pathname.split('/').pop()?.split('-') || []
    const textURL = `https://raw.githubusercontent.com/${userName}/${repo}/${brand}/${fileName}`
    // const chunks = await generateChunk(textURL).then(chunks => Promise.all(chunks.map((c: string) => moveToTransfer(c))))
    const chunks = await generateChunk(textURL)
    const chunkGeneral = chunks.join(CHUNK_SEPARATION)
    const fileChunkGeneral = await moveToTransfer(chunkGeneral)
    return fileChunkGeneral
  } catch (error: any) {
    handleError({ error, input: JSON.stringify(input) }, 'CONTROLLER-CHUNKS')
  }
  return null
}
const controllerAudio = async (r: Request) => {
  const input = await parseRequest(r)
  try {
    // transfer.sh-Ds32O7-hello.txt
    // "https://transfer.sh/Ds32O7/hello.txt"
    const { pathname } = new URL(input.url)
    const [,, chunkIndexString, chunkMetaString] = pathname.split('/')
    const chunkIndex = Number(chunkIndexString)
    const [hostFile, ID1, ID2] = chunkMetaString?.split('-') || []
    const fileChunkGeneral = `https://${hostFile}/${ID1}/${ID2}`
    const validate = typeof chunkIndex !== 'number' || [hostFile, ID1, ID2].some(v => ['', undefined, null].includes(v))
    if (validate) {
      handleError(JSON.stringify({ url: input.url, message: 'chunkIndex null' }), 'controllerAudio')
      return null
    }
    const headers = await getSpeechAuth()
    return await generateSpeech({ fileChunkGeneral, chunkIndex, headers })
  } catch (error: any) {
    handleError({ error, input: JSON.stringify(input) }, 'CONTROLLER-AUDIO')
  }
  return null
}

export {
  controllerAuth,
  controllerChunks,
  controllerAudio
}