import {ApiResponse} from "../utils/apiResponse.js"
const healthCheck = async (req, res) => {
  res.status(200)
  .jsion(new ApiResponse(200,"All good running well .......",null))
}
export default healthCheck;