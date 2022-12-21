import {
  controllerAuth,
  controllerChunks,
  controllerAudio
} from './controller.ts'

const routers = [
  { route: '/auth', handle: controllerAuth },
  { route: '/chunks', handle: controllerChunks },
  { route: '/audio', handle: controllerAudio }
]

export {
  routers
}