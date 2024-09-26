import { request } from '@/utils/request';

export function getCertificateList(params: any) {
  return request.get<any>({
    url: '/certificate',
    params,
  });
}
export function getVersionList(params: any) {
  return request.get<any>({
    url: '/certificate/version',
    params,
  });
}
export function getDeployList(params: any) {
  return request.get<any>({
    url: '/certificate/deploy',
    params,
  });
}

export function createCertificate(data: any) {
  return request.post({
    url: '/certificate',
    data,
  });
}

export function getCertificateInfo(id: number) {
  return request.get({
    url: `/certificate/${id}`,
  });
}

export function deleteCertificateInfo(id: number) {
  return request.delete({
    url: `/certificate/${id}`,
  });
}

export function updateCertificateInfo(id: number, data: any) {
  return request.put({
    url: `/certificate/${id}`,
    data,
  });
}
export function updateCertificateFieldInfo(id: number, field: string, data: any) {
  return request.put({
    url: `/certificate/${id}/${field}`,
    data,
  });
}

export function configCertificate(id: number, data: any) {
  return request.put({
    url: `/certificate/${id}/config`,
    data,
  });
}
export function getCertificateVersionList(id: number, params: any) {
  return request.get({
    url: `/certificate/${id}/version`,
    params,
  });
}
export function createCertificateVersion(id: number, data?: any) {
  return request.post({
    url: `/certificate/${id}/version`,
    data,
  });
}
export function getCertificateVersionInfo(id: number, vid: number) {
  return request.get({
    url: `/certificate/${id}/version/${vid}`,
  });
}

export function revokeCertificateVersionInfo(id: number, vid: number) {
  return request.post({
    url: `/certificate/${id}/version/${vid}/revoke`,
  });
}

export function downloadCertificateVersionCert(id: number, vid: number) {
  return request.get(
    {
      url: `/certificate/${id}/version/${vid}/download`,
      responseType: 'blob',
    },
    { isTransformResponse: false },
  );
}
export function getCertificateCloudList(id: number, params: any) {
  return request.get({
    url: `/certificate/${id}/cloud`,
    params,
  });
}

export function createCertificateDeploy(id: number, params: any) {
  return request.post({
    url: `/certificate/${id}/deploy`,
    params,
  });
}

export function getCertificateDeployList(id: number, params: any) {
  return request.get({
    url: `/certificate/${id}/deploy`,
    params,
  });
}
