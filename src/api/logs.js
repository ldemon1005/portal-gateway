import axios from '@/utils/axios'

export function listJobs(query) {
  return axios({
    url: '/gw/job/list',
    method: 'get',
    params: query
  })
}

export function listLogs(query) {
  return axios({
    url: '/gw/log/list',
    method: 'get',
    params: query
  })
}

export function listMemory(query) {
  return axios({
    url: '/gw/memory/list',
    method: 'get',
    params: query
  })
}

export function listTracking(query) {
  return axios({
    url: '/gw/tracking/list',
    method: 'get',
    params: query
  })
}

