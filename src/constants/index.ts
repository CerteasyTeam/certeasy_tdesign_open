import type { PageInfo } from 'tdesign-vue-next';

// 合同状态枚举
export const CONTRACT_STATUS = {
  FAIL: 0,
  AUDIT_PENDING: 1,
  EXEC_PENDING: 2,
  EXECUTING: 3,
  FINISH: 4,
};

// 合同类型枚举
export const CONTRACT_TYPES = {
  MAIN: 0,
  SUB: 1,
  SUPPLEMENT: 2,
};

// 合同收付类型枚举
export const CONTRACT_PAYMENT_TYPES = {
  PAYMENT: 0,
  RECEIPT: 1,
};

// 标签类型
type TagTheme = 'default' | 'success' | 'primary' | 'warning' | 'danger';
// 通知的优先级对应的标签类型
export const NOTIFICATION_TYPES: Map<string, TagTheme> = new Map([
  ['low', 'primary'],
  ['middle', 'warning'],
  ['high', 'danger'],
]);

// 通用请求头
export enum ContentTypeEnum {
  Json = 'application/json;charset=UTF-8',
  FormURLEncoded = 'application/x-www-form-urlencoded;charset=UTF-8',
  FormData = 'multipart/form-data;charset=UTF-8',
}

// 默认分页
export const defaultPageInfo: PageInfo = { current: 1, pageSize: 10, previous: 1 };

// 证书类型
export const CERTIFICATE_TYPE = {
  SINGLE: 1,
  MULTI: 2,
  WILDCARD: 3,
};

export type TagVariant = 'outline' | 'dark' | 'light' | 'light-outline';

export type TypesMap = { label: string; theme?: TagTheme; variant?: TagVariant };

export const CertificateTypesMapList: Record<number, TypesMap> = {
  [CERTIFICATE_TYPE.SINGLE]: {
    label: '单域名',
    theme: 'primary',
    variant: 'light',
  },
  [CERTIFICATE_TYPE.MULTI]: {
    label: '多域名',
    theme: 'warning',
    variant: 'light',
  },
  [CERTIFICATE_TYPE.WILDCARD]: {
    label: '泛域名',
    theme: 'success',
    variant: 'light',
  },
};

export const CERTIFICATE_AUTH_MODE = {
  HTTP_AUTH_MODE: 1,
  HTTP_ALIAS_AUTH_MODE: 2,
  DNS_AUTH_MODE: 3,
  DNS_ALIAS_AUTH_MODE: 4,
};

export const CertificateAuthModeMapList: Record<number, TypesMap> = {
  // [CERTIFICATE_AUTH_MODE.HTTP_AUTH_MODE]: {
  //   label: 'HTTP验证',
  // },
  [CERTIFICATE_AUTH_MODE.HTTP_ALIAS_AUTH_MODE]: {
    label: 'HTTP代理验证',
  },
  [CERTIFICATE_AUTH_MODE.DNS_AUTH_MODE]: {
    label: 'DNS授权验证',
  },
  [CERTIFICATE_AUTH_MODE.DNS_ALIAS_AUTH_MODE]: {
    label: 'DNS代理验证',
  },
};

// 状态 0 失败 1 申请中  2 已颁发 3 已过期 4 吊销
export const CERTIFICATE_STATUS = {
  FAILED: 0,
  CREATED: 1,
  ISSUER: 2,
  EXPIRED: 3,
  REVOKED: 4,
  QUEUING: 5,
};

export const CertificateStatusMapList: Record<number, TypesMap> = {
  [CERTIFICATE_STATUS.FAILED]: {
    label: '已失败',
    theme: 'danger',
  },
  [CERTIFICATE_STATUS.CREATED]: {
    label: '更新中',
    theme: 'primary',
  },
  [CERTIFICATE_STATUS.ISSUER]: {
    label: '已签发',
    theme: 'success',
  },
  [CERTIFICATE_STATUS.EXPIRED]: {
    label: '已过期',
    theme: 'danger',
  },
  [CERTIFICATE_STATUS.REVOKED]: {
    label: '已吊销',
    theme: 'danger',
  },
  [CERTIFICATE_STATUS.QUEUING]: {
    label: '排队中',
    theme: 'warning',
  },
};

// 状态 0 失败 1 申请中  2 已颁发 3 已过期 4 吊销
export const CERTIFICATE_CLOUD_STATUS = {
  FAILED: 0,
  CREATED: 1,
  ISSUER: 2,
};

export const CertificateCloudStatusMapList: Record<number, TypesMap> = {
  [CERTIFICATE_CLOUD_STATUS.FAILED]: {
    label: '已失败',
    theme: 'danger',
  },
  [CERTIFICATE_CLOUD_STATUS.CREATED]: {
    label: '部署中',
    theme: 'success',
  },
  [CERTIFICATE_CLOUD_STATUS.ISSUER]: {
    label: '已成功',
    theme: 'success',
  },
};

// 状态 0 失败 1 申请中  2 已颁发 3 已过期 4 吊销
export const CERTIFICATE_OCSP_STATUS = {
  GOOD: 'GOOD',
  REVOKED: 'REVOKED',
  UNKNOWN: 'UNKNOWN',
};

export const CertificateOcspStatusMapList: Record<string, TypesMap> = {
  [CERTIFICATE_OCSP_STATUS.GOOD]: {
    label: '可信',
    theme: 'success',
  },
  [CERTIFICATE_OCSP_STATUS.REVOKED]: {
    label: '吊销',
    theme: 'danger',
  },
  [CERTIFICATE_OCSP_STATUS.UNKNOWN]: {
    label: '未知',
    theme: 'warning',
  },
};
