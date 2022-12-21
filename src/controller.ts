import {
  getSpeechAuth,
  generateChunk,
  moveToTransfer,
  generateSpeech
} from './helpers'

const controllerAuth = () => 'controllerAuth'
const controllerChunks = () => 'controllerChunks'
const controllerAudio = () => 'controllerAudio'

export {
  controllerAuth,
  controllerChunks,
  controllerAudio
}