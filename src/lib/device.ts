export function browserDevice() {
  let token=localStorage.getItem('academy-device');
  if(!token){token=crypto.randomUUID();localStorage.setItem('academy-device',token);}
  const ua=navigator.userAgent;
  const browser=ua.includes('Firefox')?'Firefox':ua.includes('Edg')?'Edge':ua.includes('Chrome')?'Chrome':'Safari';
  const system=/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'Mac':'Computer';
  return {token,name:`${browser} on ${system}`};
}