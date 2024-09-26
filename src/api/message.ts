import { request } from '@/utils/request';

export function getMessageList(params: any) {
  return request.get<any>({
    url: '/message',
    params,
  });
}

export function getMessageInfo(id: number) {
  return request.get<any>({
    url: `/message/${id}`,
  });
}

export function readMessageInfo(data: any) {
  return request.put<any>({
    url: '/message',
    data,
  });
}

export function deleteMessageInfo(data: any) {
  return request.delete<any>({
    url: `/message`,
    data,
  });
}
