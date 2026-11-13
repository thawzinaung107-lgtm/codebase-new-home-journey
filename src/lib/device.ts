export function browserDevice() {
  let token: string | null;
  try {
    token=localStorage.getItem('academy-device');
    if(!token){token=crypto.randomUUID();localStorage.setItem('academy-device',token);}
  } catch {
    throw new Error('Allow browser storage before registering this device. No device was registered.');
  }
  // Keep the token across re-login. The database binds it to each verified OAuth
  // session; rotating it cannot clear a revoked session or release an old slot.
  if (token.length < 32 || token.length > 100) {
    throw new Error('This browser registration token is invalid. Remove its old device slot before resetting browser storage.');
  }
  const ua=navigator.userAgent;
  const browser=ua.includes('Firefox')?'Firefox':ua.includes('Edg')?'Edge':ua.includes('Chrome')?'Chrome':'Safari';
  const system=/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)?'iOS':/Windows/.test(ua)?'Windows':/Mac/.test(ua)?'Mac':'Computer';
  return {token,name:`${browser} on ${system}`};
}