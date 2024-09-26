/**
 * 下载文件
 * @param data 二进制数据
 * @param name 文件名
 */
export const download = (data: any, name: string) => {
  const blob = new Blob([data], { type: 'application/octet-stream' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

/**
 * 检查数组重复
 * @param array
 */
export const checkDuplicate = (array: any[]) => {
  const seenElements = new Set(); // 使用 Set 来跟踪已看到的元素
  const duplicates = [];

  for (const element of array) {
    if (seenElements.has(element)) {
      duplicates.push(element); // 如果元素已经存在于 Set 中，说明是重复元素
    } else {
      seenElements.add(element); // 否则将元素添加到 Set 中
    }
  }

  if (duplicates.length > 0) {
    return {
      error: `Duplicate elements found: ${duplicates.join(', ')}`,
      duplicates,
    };
  }
  return { error: null, duplicates };
};

/**
 * 检查对象空
 * @param obj
 * @returns
 */
export const checkObjectEmptyAndKeys = (obj: any): { error: null | string; emptyKeys?: any[] } => {
  // 检查对象是否为空
  if (obj == null || typeof obj !== 'object') {
    return { error: '当前数据空' };
  }

  // 存储空值键的数组
  const emptyKeys = [];

  // 遍历对象，检查每个键的值是否为空
  for (const key in obj) {
    const value = obj[key];
    if (!value || value === '') {
      emptyKeys.push(key);
    }
  }

  // 如果有空值键，返回提示信息
  if (emptyKeys.length > 0) {
    return { error: `以下键的值为空: ${emptyKeys.join(',')}`, emptyKeys };
  }

  // 如果没有空值键
  return { error: null, emptyKeys };
};

/**
 * randomString
 * @param {number} len
 * @param {string} str
 */
export const randomString = (
  len: number = 16,
  str: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
): string => {
  // 定义返回值
  let result = '';
  // 遍历
  for (let i = 0; i < len; i++) {
    // 取随机下标
    const index = Math.floor(Math.random() * str.length);
    // 拼接在result后面
    result += str[index];
  }
  // 返回
  return result;
};

/**
 * extractDomainWithPrefix
 * @param {string} domain
 * @param {boolean} ignoreWildcard
 */
export const extractDomainWithPrefix = (domain: string, ignoreWildcard: boolean = false) => {
  if (!domain) return { domain: '', prefix: '' };
  // 分割
  const domainSpiltDot = domain.split('.');
  const domainRoot = domainSpiltDot.slice(-2).join('.');
  // 过滤
  const prefix = domainSpiltDot
    .filter((_, idx) => idx < domainSpiltDot.length - 2)
    .filter((pre) => {
      if (ignoreWildcard) {
        return pre !== '*';
      }
      return pre;
    });
  return { domain: domainRoot, prefix: prefix.join('.') };
};
