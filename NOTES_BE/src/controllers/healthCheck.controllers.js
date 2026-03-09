import {ApiResponse} from "../utils/index.js"
const healthCheck = async (req, res) => {
  res.status(200)
  .jsion(new ApiResponse(200,null,"All good running well ......."))
}
export {healthCheck};