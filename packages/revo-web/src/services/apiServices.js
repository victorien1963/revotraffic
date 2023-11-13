import axios from 'axios'

const getCookie = (cname) => {
  const name = `${cname}=`
  const decodedCookie = decodeURIComponent(document.cookie)
  const ca = decodedCookie.split(';')
  for (let i = 0; i < ca.length; i += 1) {
    let c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      const cookie = c.substring(name.length, c.length)
      if (cookie === '') return false
      return cookie
    }
  }
  return false
}

const getConfig = (
  url,
  method,
  data,
  responseType,
  token,
  params = {},
  contentType = ''
) => {
  const config = {
    headers:
      token || getCookie('token')
        ? {
            Authorization: `Bearer ${token || getCookie('token')}`,
            contentType,
          }
        : { contentType },
    timeout: 600000,
    url: process.env.REACT_APP_AUTH_URL
      ? `${process.env.REACT_APP_AUTH_URL}/${url.replace('api/', '')}`
      : `${window.location.origin}/${url}`,
    method,
    data,
    params,
  }
  if (responseType) config.responseType = responseType
  return config
}
export default {
  login(value) {
    return axios(getConfig('api/auth/login', 'post', value))
      .then((res) => res.data)
      .catch((error) => ({ error }))
  },
  me() {
    return axios(getConfig('api/me', 'get', {}))
      .then((res) => res.data)
      .catch((error) => ({ error }))
  },
  data(value) {
    return axios(
      getConfig(
        `api/${value.path}`,
        value.method,
        value.data || {},
        value.responseType,
        value.token,
        value.params,
        value.contentType
      )
    )
      .then((res) => res.data)
      .catch((error) => ({ error }))
  },
}
