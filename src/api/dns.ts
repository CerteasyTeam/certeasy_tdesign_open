import { request } from '@/utils/request';

export function getDnsProviderList(params: any) {
  return request.get<any>({
    url: '/dns/provider',
    params,
  });
}
export function getDnsList(params: any) {
  return request.get<any>({
    url: '/dns',
    params,
  });
}
export function addDns(data: any) {
  return request.post({
    url: `/dns/`,
    data,
  });
}
export function getDnsInfo(id: number) {
  return request.get({
    url: `/dns/${id}`,
  });
}
export function updateDnsInfo(id: number, data: any) {
  return request.put({
    url: `/dns/${id}`,
    data,
  });
}

export function updateDnsFieldInfo(id: number, field: string, data: any) {
  return request.put({
    url: `/dns/${id}/${field}`,
    data,
  });
}

export function deleteDns(id: number) {
  return request.delete({
    url: `/dns/${id}`,
  });
}

export function checkDns(data: any) {
  return request.post({
    url: `/dns/check`,
    data,
  });
}
