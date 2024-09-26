import { request } from '@/utils/request';

export function getWatchList(params: any) {
  return request.get({
    url: '/watch',
    params,
  });
}
export function addWatch(data: any) {
  return request.post({
    url: `/watch/`,
    data,
  });
}
export function getWatchInfo(id: number) {
  return request.get({
    url: `/watch/${id}`,
  });
}

export function updateWatchInfo(id: number, data: any) {
  return request.put({
    url: `/watch/${id}`,
    data,
  });
}
export function updateWatchFieldInfo(id: number, field: string, data: any) {
  return request.put({
    url: `/watch/${id}/${field}`,
    data,
  });
}

export function deleteWatch(id: number) {
  return request.delete({
    url: `/watch/${id}`,
  });
}

export function getWatchRecordList(id: number, params: any) {
  return request.get({
    url: `/watch/${id}/record`,
    params,
  });
}

export function getWatchRecordInfo(id: number, rid: number) {
  return request.get({
    url: `/watch/${id}/record/${rid}`,
  });
}

export function reloadWatchRecord(id: number, rid: number) {
  return request.get({
    url: `/watch/${id}/record/${rid}/reload`,
  });
}
