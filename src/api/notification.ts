import { request } from '@/utils/request';

export function getNotificationConfig() {
  return request.get<any>({
    url: '/notification/config',
  });
}

export function updateNotificationConfig(id: number, data: any) {
  return request.put<any>({
    url: `/notification/config/${id}`,
    data,
  });
}

export function getNotificationChannelList(params?: any) {
  return request.get<any>({
    url: '/notification/channel',
    params,
  });
}

export function checkNotificationChannel(data: any) {
  return request.post<any>({
    url: `/notification/check`,
    data,
  });
}

export function addNotificationChannel(data: any) {
  return request.post<any>({
    url: `/notification/channel`,
    data,
  });
}

export function getNotificationChannel(id: number) {
  return request.get<any>({
    url: `/notification/channel/${id}`,
  });
}

export function updateNotificationChannelInfo(id: number, data: any) {
  return request.put({
    url: `/notification/channel/${id}`,
    data,
  });
}

export function updateNotificationChannelFieldInfo(id: number, field: string, data: any) {
  return request.put({
    url: `/notification/channel/${id}/${field}`,
    data,
  });
}

export function deleteNotificationChannel(id: number) {
  return request.delete({
    url: `/notification/channel/${id}`,
  });
}

export function getNotificationProviderList(params?: any) {
  return request.get<any>({
    url: '/notification/provider',
    params,
  });
}
