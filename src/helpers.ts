async function parseRequest(request:Request) {
  const { method, url, headers, redirect, fetcher, signal, cf } = request
  const body:any = await readRequestBody(request)
  return { method, url, body, headers, redirect, fetcher, signal, cf }
}
async function readRequestBody(request:Request) {
  const { headers } = request;
  const contentType = headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return JSON.stringify(await request.json());
  } else if (contentType.includes('application/text')) {
    return request.text();
  } else if (contentType.includes('text/html')) {
    return request.text();
  } else if (contentType.includes('form')) {
    const formData = await request.formData();
    const body:any = {};
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1];
    }
    return JSON.stringify(body);
  } else {
    // Perhaps some other type of data was submitted in the form
    // like an image, or some other binary data.
    return null
  }
}

async function generalFetch(url: string = '', option: any): Promise<any> {
  const myOption: RequestInit<RequestInitCfProperties> | undefined = {
    method: option.method,
    redirect: 'follow',
    headers: {}
  }
  if (typeof option?.headers === 'object') {
    myOption.headers = Object.assign({}, option?.headers)
  }
  if (!myOption?.body && typeof option?.body === 'object') {
    myOption.body = JSON.stringify(option?.body)
  } else if (typeof option?.body === 'string') {
    myOption.body = option?.body
  }
  if (!myOption?.body && typeof option?.data === 'object') {
    myOption.body = JSON.stringify(option?.data)
  } else if (typeof option?.data === 'string') {
    myOption.body = option?.data
  }
  const response: Response = await fetch(url, myOption)
  const { ok, status, statusText } = response
  let data
  const contentType = response.headers.get('Content-Type')?.replace('; charset=utf-8', '')
  console.log(`[${option.method}|${ok}|${status}|${statusText}|${contentType}]`, url)
  if (contentType?.includes('json')) data = await response.json()
  else if (contentType?.includes('text')) data = await response.text()
  else data = await response.text()
  return { ok, status, statusText, data }
}

const tryMethod = async (callback: Function) => {
  let times = 100
  while (times > 0) {
    try {
      return await callback()
    } catch (error: any) {
      console.log(error?.message, '[try times]', --times)
    }
  }
  throw new Error(callback.toString())
}
const get = (url = '', option: any = {}) => generalFetch(url, Object.assign({}, option, { method: 'GET' }))
const post = (url = '', option: any = {}) => generalFetch(url, Object.assign({}, option, { method: 'POST' }))
const put = (url = '', option: any = {}) => generalFetch(url, Object.assign({}, option, { method: 'PUT' }))
const del = (url = '', option: any = {}) => generalFetch(url, Object.assign({}, option, { method: 'DELETE' }))

const initAuth = async () => {
  const res = { 'x-key': '', 'x-usersessionid': '' }
  const { data } = await tryMethod(() => get('https://www.onenote.com/learningtools'))
  const rawParams = data.match(/var (SessionId|Canary) = "(.*?)";/gm)
  if (rawParams?.length) {
    rawParams.forEach((rawParam: string) => {
      const [p1, p2] = rawParam.split(' = ')
      if (p1?.includes('Canary')) res['x-key'] = p2.replace(/^"|";$/gm, '')
      if (p1?.includes('SessionId')) res['x-usersessionid'] = p2.replace(/^"|";$/gm, '')
    })
  }
  return res
}

const getSpeechAuth = async () => {
  const authObject = await initAuth() // keys: x-key, x-usersessionid
  const { data } = await tryMethod(() => post('https://learningtools.onenote.com/learningtoolsapi/v2.0/GetContentModelForReader-Canary', {
    headers: authObject,
    body: { "data": { "title": "hello word", "chunks": [{ "mimeType": "text/plain", "content": "hello word", "lang": "en-US" }] } }
  }))
  return { authorization: `MS-SessionToken ${data?.meta?.sessionToken}` }
}

const generateChunk = async (url: string) => {
  const { data, ok } = await tryMethod(() => get(url));
  if(!ok) throw new Error(data)
  const chunks = []
  let chunk = ''
  data.split(/\.|\n/).forEach((v: string) => {
    if (v && v.trim()) {
      if (`${chunk} ${v.trim()}`.length <= 1500) {
        chunk = `${chunk} ${v.trim()}`
      } else {
        chunks.push(chunk)
        chunk = v.trim()
      }
    }
  })
  if (chunk) {
    chunks.push(chunk)
    chunk = ''
  }
  return chunks
}

const moveToTransfer = async (contentText: string) => {
  let times = 10
  while (times > 0) {
    try {
      const {ok, data} = await tryMethod(() => put('https://transfer.sh/hello.txt', { body: contentText }))
      if (ok) {
        return data
      }
    } catch (error: any) {
      console.log(error?.message, '[try times]', --times)
    }
  }
  throw new Error('Transfer error')
}

const generateSpeech = async (params: any) => {
  const api = 'https://learningtools.onenote.com/learningtoolsapi/v2.0/GetSpeech'
  if (params?.fileText) {
    const dataRawFetch = await get(params?.fileText)
    if (!dataRawFetch.ok) {
      console.log(dataRawFetch)
      throw new Error(dataRawFetch.data)
    }
    params.contentText = dataRawFetch.data
  }
  const body = {
    "data": {
      sentenceModels: [{
        "t": params?.contentText,
        "lang": "vi-VN",
        "se": {
          "o": 0,
          "l": params?.contentText.length
        },
        "wo": []
      }]
    },
    "options": {
      "preferredVoice": params?.preferredVoice || "Female",
      "extractWordMarkers": true,
      "encoding": "Mp3",
      "clientLabel": "ReadAloud",
      "useBrowserSpecifiedDialect": true
    }
  }
  const { data } = await post(api, { headers: params?.headers, body })
  return data?.data?.sb.map((it:any) => it?.ad?.replace('data:audio/mpeg;base64,', '')).join('\n')
}

const handleError  = (error:any, name:any) => {
  console.log(`========================[${name}]========================`)
  console.warn(error)
  console.log(`========================[${name}]========================`)
}

export {
  getSpeechAuth,
  generateChunk,
  moveToTransfer,
  generateSpeech,
  readRequestBody,
  parseRequest,
  handleError
}