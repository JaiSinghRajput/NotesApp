import { ApiError } from "../utils/index.js";
import mongoose from "mongoose";

const handleError = (err, req, res, next) => {
//   console.error(err);
let error = err;
  if (!(err instanceof ApiError)) {
    const statusCode = err.statusCode || err instanceof mongoose.Error ? 400 : 500;
    const message = error.message;
    error = new ApiError(statusCode,message,error?.errors || [],err?.stack);
  }

  const response = {
    ...error,
    message:error.message,
    ...(process.env.NODE_ENV === "development"?{ stack: error.stack }:{}),
  }
  return res.status(error.statusCode).json(response);

}

  export {handleError};