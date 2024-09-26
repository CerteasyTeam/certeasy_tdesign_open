import type { UserInfo } from '@/types/interface';

export interface IUser extends UserInfo {
  id: string;
  userCode: string;
  nickName: string;
  email: string;
}

export interface SignInResult {
  user: IUser;
  token: string;
}

export interface SignInData {
  email: string;
  passwd: string;
}

export interface SignUpData extends SignInData {
  code: string;
  invite?: string;
}
