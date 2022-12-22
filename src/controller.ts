import {
  parseRequest,
  getSpeechAuth,
  generateChunk,
  moveToTransfer,
  generateSpeech
} from './helpers'

const controllerAuth = async (r:Request) => getSpeechAuth().then(({ authorization }) => authorization.replace('MS-SessionToken', '').trim())
const controllerChunks = async (r:Request) => {
  const input = await parseRequest(r)
  return input
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