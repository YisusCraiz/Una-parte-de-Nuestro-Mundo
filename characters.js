// Atlas original de Nuestro-Universos. La asignación de identidad vive en el servidor.
let art;
export function drawOwnerCharacter(ctx,x,y,size,skin){if(!['jesus','julissa'].includes(skin))return false;if(!art){art=new Image();art.src='assets/characters/jj-original.png'}if(!art.complete||!art.naturalWidth)return false;const w=art.naturalWidth/4,h=art.naturalHeight/4;ctx.drawImage(art,skin==='julissa'?w:0,0,w,h,x-size/2,y-size/2,size,size);return true}
