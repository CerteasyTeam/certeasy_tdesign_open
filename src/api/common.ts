import { request } from '@/utils/request';

const Api = {
  config: '/common/config',
  email: '/common/email',
  overview: '/common/overview',
};

export function commConfig() {
  return request.get({
    url: Api.config,
  });
}

export function commEmail(data: any) {
  return request.post({
    url: Api.email,
    data,
  });
}

export function commOverview() {
  return request.get({
    url: Api.overview,
  });
}

export function HttpCheck(type: string, data: any) {
  return request.post({
    url: `/common/http/${type}/check`,
    data,
  });
}

export function DnsCheck(type: string, data: any) {
  return request.post({
    url: `/common/dns/${type}/check`,
    data,
  });
}
