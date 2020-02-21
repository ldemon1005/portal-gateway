import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'
const AccessToken = 'access_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getAccessToken() {
  return Cookies.get(AccessToken)
}

export function setAccessToken(token) {
  return Cookies.set(AccessToken, token)
}

export function removeAccessToken() {
  return Cookies.remove(AccessToken)
}
