import { request } from '@/utils/request';

export function getProviderList(params?: any) {
  return request.get<any>({
    url: '/cloud/provider',
    params,
  });
}
export function getCloudList(params: any) {
  return request.get<any>({
    url: '/cloud',
    params,
  });
}
export function addCloud(data: any) {
  return request.post({
    url: `/cloud/`,
    data,
  });
}
export function getCloudInfo(id: number) {
  return request.get({
    url: `/cloud/${id}`,
  });
}
export function updateCloudInfo(id: number, data: any) {
  return request.put({
    url: `/cloud/${id}`,
    data,
  });
}
export function deleteCloudInfo(id: number) {
  return request.delete({
    url: `/cloud/${id}`,
  });
}

export function deployCloud(id: number) {
  return request.post({
    url: `/cloud/${id}/deploy`,
  });
}

export function deployCloudList(id: number, params: any) {
  return request.get({
    url: `/cloud/${id}/deploy`,
    params,
  });
}

export function updateCloudFieldInfo(id: number, field: string, data: any) {
  return request.put({
    url: `/cloud/${id}/${field}`,
    data,
  });
}

export function deleteCloud(id: number) {
  return request.delete({
    url: `/cloud/${id}`,
  });
}

export function checkCloud(data: any) {
  return request.post({
    url: `/cloud/check`,
    data,
  });
}

export function getCloudRecordList(id: number, params: any) {
  return request.get({
    url: `/cloud/${id}/record`,
    params,
  });
}

export function getCloudRecordInfo(id: number, rid: number) {
  return request.get({
    url: `/cloud/${id}/record/${rid}`,
  });
}
