export const asyncerror = (errorfunction) =>(req,res,next)=>{
  Promise.resolve(errorfunction(req,res,next)).catch(next);
 }