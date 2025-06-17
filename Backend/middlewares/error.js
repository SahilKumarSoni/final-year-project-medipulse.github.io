class ErrorHandler extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      
    }
  }

  
  export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    //wrong mongodb id error
    if(err.name === "CastError"){
        const message=`Resource not found . Invalid : ${err.path}`
        err = new ErrorHandler(message,400)
    }

// mongoose duplicate key error
if(err.code === 11000){
  const message = `Duplicate ${Object.keys(err.keyValue)} exists`
  err = new ErrorHandler(message,400)
}


// wrong Jwt
if(err.name === "JsonWebTokenError"){
    const message = `invalid Json Web token, try again`
    err = new ErrorHandler(message,400)

}

//jwt expire error
if(err.name === "TokenExpiredError"){
  const message = `Json Web Token is expired , please try again`
  err = new ErrorHandler(message,400)

}

  
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  };
  
  export default ErrorHandler;
  