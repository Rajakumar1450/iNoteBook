module.exports = {
  error404: (req, res, next) => {
    const error = new Error("not Found");
    error.status = 404;
    next(error);
  },
  error500: (error, req, res) => {
    res.status(error.status || 500).send({
      error: {
        status: error.status || 500,
        message: error.message || "Internal server error",
      },
    });
  },
};
