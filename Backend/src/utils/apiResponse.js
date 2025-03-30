class ApiResponse {
    constructor(statusCode, message, data = null) {
      this.statusCode = statusCode;
      this.message = message;
      this.data = data;
      this.success = statusCode < 400
    }
  }
  
  export {ApiResponse};  