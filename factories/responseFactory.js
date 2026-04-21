class ResponseFactory {
  createResponse(data, isList = false) {
    return {
      status: 'success',
      results: isList ? data.length : undefined,
      data,
    };
  }
}

module.exports = new ResponseFactory();
