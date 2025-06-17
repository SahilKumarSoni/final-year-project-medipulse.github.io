import jwt from 'jsonwebtoken';


export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const setToken = (id,role,res,message,statuscode=201) => {
  const token =jwt.sign({ id, role }, process.env.JWT_SECRET);
  res.status(statuscode).cookie("token",token,{
        httpOnly:true,
        maxAge: 15 * 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV==="Development"?"lax":"none",
        secure : process.env.NODE_ENV==="Development"?false:true,
    }).json({
        success:true,
        message,
    })
};


export const removeToken = (res) => {
  res.clearCookie('token');
};


export const isAuthenticated = (req, res, next) => {
  const token = req.cookies.token;
  console.log(token)

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: Please log in' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded) 
    req.user = decoded.id
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

//   export const isAuthenticated = async (req,res,next)=>{
//     const {token}= req.cookies;
//     if(!token) return res.status(404).json({
//      success:false,
//      message:"login first",
//      });

//  const decoded = jwt.verify(token,process.env.JWT_SECRET);
//  console.log(decoded)
//  let user
//  if(decoded.role=="doctor"){

//     user = await Doctor.findById(decoded.id);
//  }
//   res.status(200).json({
//     message:"done",
//     user
//   })
//  next();
    
// }


export const authorizeRole = (roles) => {
  return (req, res, next) => {
    const {token}= req.cookies;
    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    if (decoded.role!=roles) {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges' });
    }
    next();
  };
};
