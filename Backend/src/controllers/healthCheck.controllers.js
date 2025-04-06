import {ApiResponse} from "../utils/index.js"
const healthCheck = async (req, res) => {
  res.status(200)
  .jsion(new ApiResponse(200,"All good running well .......",null))
}
export {healthCheck};