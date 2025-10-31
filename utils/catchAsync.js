module.exports = catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //this is to catch the error and pass it to the next middleware
  };
};
