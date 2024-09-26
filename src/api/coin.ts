import { request } from '@/utils/request';

export function getCoinPods(params?: any) {
  return request.get<any>({
    url: '/coin/pods',
    params,
  });
}

export function createCoinOrder(data: any) {
  return request.post<any>({
    url: '/coin/order',
    data,
  });
}

export function getCoinOrder(id: any) {
  return request.get<any>({
    url: `/coin/order/${id}`,
  });
}
