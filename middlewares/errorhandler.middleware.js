const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.message);
  
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode; // Ensure it's an error status
    res.status(statusCode).json({
      code: statusCode,
      message: err.message || "Internal Server Error",
    //   stack: process.env.NODE_ENV === "production" ? null : err.stack, // Hide stack in production
    });
  };
  
  export default errorHandler;