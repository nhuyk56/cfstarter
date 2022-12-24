<script setup>
import axios from 'axios'
import { ref } from 'vue'
defineProps({
  msg: String,
})
const parseGFile = (url) => {
  const { pathname } = new URL(url)
  const [, gUser, gRepo, gBrand, gFileName] = pathname.split('/')
  return [gUser, gRepo, gBrand, gFileName].join('-')
}
const parseChunkFile = (url) => {
  const { hostname, pathname } = new URL(url)
  const [, cId, cFileName] = pathname.split('/')
  return [hostname, cId, cFileName].join('-')
}
const audioSrc = ref('data:audio/mpeg;base64,')
const fileText = ref('https://raw.githubusercontent.com/nhuyk56/SyncStorage1/2e267fac53a5eedae923235dfdd7408a/8a90f70d52dc5231ca9dd3a418fc5070')
const submit = async () => {
  const gID = parseGFile(fileText.value)
  const chunksRQ = await axios.get(`http://127.0.0.1:8787/chunks/${gID}`)
  const chunksData = chunksRQ.data
  const chunksID = parseChunkFile(chunksData.id)
  const chunkCount = chunksData.count
  const chunks = Array.from(Array(chunkCount).keys()).map(index => `http://127.0.0.1:8787/audio/${index}/${chunksID}`)
  for (const chunkItemLink of chunks) {
    const chunkItemData = await axios.get(chunkItemLink).then(({ data }) => data)
    audioSrc.value += chunkItemData
  }
}
</script>

<template>
  <div>
    <p>fileText is: {{ fileText }}</p>
    <input v-model="fileText" placeholder="fileText" />
    <button type="button" @click="submit">go go</button>
  </div>
  <div class="loader"></div>
  <div>
    <audio controls id="audioElement" :src="audioSrc"></audio>
  </div>
</template>

<style scoped>
.loader {
  border: 16px solid #f3f3f3; /* Light grey */
  border-top: 16px solid #3498db; /* Blue */
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
