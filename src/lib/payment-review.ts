export const expiryPresetDays=[7,30,60,90] as const;
export function expiryFromDays(days:number,now=new Date()):string{const d=new Date(now.getTime()+days*86400000);return d.toISOString();}
export const rejectPresets=['The receipt image is unclear. Please upload a clearer photo.','The transferred amount does not match the course price.','This receipt was already submitted for another order.'] as const;
export function codeMessage({name,course,code,expires}:{name:string;course:string;code:string;expires:string}):string{
  const date=new Date(expires).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
  return `Hello ${name||'there'},\n\nYour payment for "${course}" has been approved.\n\nYour course code: ${code}\n\nHow to redeem: sign in to Collin AI Marketing Academy, open "Redeem code", and enter this code. It can be used once and expires on ${date}.\n\nThank you!`;
}
export function pendingCount(orders:{status:string}[]):number{return orders.filter(o=>o.status==='pending').length;}
