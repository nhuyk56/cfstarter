import {
  parseRequest,
  getSpeechAuth,
  generateChunk,
  moveToTransfer,
  generateSpeech
} from './helpers'

const controllerAuth = async (r:Request) => {
  const input = await parseRequest(r)
  return input
}
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