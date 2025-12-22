class ResponseFactory {
  createResponse(data, isList = false) {
    return {
      status: 'success',
      results: isList ? data.length : undefined,
      data,
    };
  }

  createAuthResponse(token) {
    return {
      status: 'success',
      token,
    };
  }
}

module.exports = new ResponseFactory();
