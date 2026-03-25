import multer from "multer";

export const notFound = (_request, response) => {
  response.status(404).json({ message: "Route not found." });
};

export const errorHandler = (error, _request, response, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      response.status(400).json({
        message: "Uploaded file exceeds the configured file size limit."
      });
      return;
    }

    response.status(400).json({ message: error.message });
    return;
  }

  if (error.message === "Origin is not allowed by CORS.") {
    response.status(403).json({ message: error.message });
    return;
  }

  if (error.code === "ENOENT") {
    response.status(404).json({
      message: "The file is no longer available on the server."
    });
    return;
  }

  console.error(error);

  response.status(500).json({
    message: error.message || "Something went wrong."
  });
};
