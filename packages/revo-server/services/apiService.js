const axios = require('axios')

const getConfig = ({
  user, url, method, data = {}, params, token = '', responseType
}) => ({
  user,
  headers:
      token
        ? { Authorization: `Bearer ${token}`, accept: 'application/json', 'Content-Type': 'application/json' }
        : { 'Content-Type': 'application/json' },
  timeout: 120000,
  url,
  method,
  data,
  params: { user, ...params },
  responseType
})
const response = (res) => {
  const { data } = res
  return data || res
}

module.exports = {
  send(value) {
    return axios(getConfig({ ...value }))
      .then((res) => response(res.data))
      .catch((error) => ({ error }))
  },
}
