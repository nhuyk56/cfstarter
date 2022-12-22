import {
  controllerAuth,
  controllerChunks,
  controllerAudio
} from './controller'

const routers = [
  { route: '/auth', method: 'GET' , handle: controllerAuth },
  { route: '/chunks/[^/]+', method: 'GET' , handle: controllerChunks },
  { route: '/audio', method: 'POST' , handle: controllerAudio }
]

export {
  routers
}