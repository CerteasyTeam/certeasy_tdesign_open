import { UserInfo } from '@/types/interface';
import { request } from '@/utils/request';

export function me() {
  return request.get<UserInfo>({
    url: '/user/me',
  });
}
export function meCoins() {
  return request.get({
    url: '/user/me/coins',
  });
}
export function getUserTransactionList(params?: any) {
  return request.get({
    url: '/user/transaction',
    params,
  });
}

export function getUserInvitationList(params?: any) {
  return request.get({
    url: '/user/invitation',
    params,
  });
}

export function updateUserEmail(data: any) {
  return request.put({
    url: '/user/email',
    data,
  });
}

export function updateUserPasswd(data: any) {
  return request.put({
    url: '/user/passwd',
    data,
  });
}
