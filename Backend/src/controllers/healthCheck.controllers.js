const healthCheck = async (req, res) => {
  res.status(200).send('Server is running');
}
export default healthCheck;