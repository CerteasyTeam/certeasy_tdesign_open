import type { SignInData, SignInResult, SignUpData } from '@/api/model/authModel';
import { request } from '@/utils/request';

const Api = {
  signIn: '/auth/signin',
  signUp: '/auth/signup',
};

export function signIn(data: SignInData) {
  return request.post<SignInResult>({
    url: Api.signIn,
    data,
  });
}

export function signUp(data: SignUpData) {
  return request.post({
    url: Api.signUp,
    data,
  });
}

export function urls() {
  return request.get({
    url: `/auth/urls`,
  });
}

export function oauth(app: string, data: any) {
  return request.post<SignInResult>({
    url: `/auth/oauth/${app}`,
    data,
  });
}

export function sendResetPasswd(data: any) {
  return request.post({
    url: `/auth/reset/valid`,
    data,
  });
}

export function resetPasswd(data: any) {
  return request.post({
    url: `/auth/reset/password`,
    data,
  });
}

export function getWechatQrcode(scene: string, params: any) {
  return request.get({
    url: `/auth/wechat/${scene}`,
    params,
  });
}
