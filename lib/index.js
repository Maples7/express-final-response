const _ = require('lodash');

module.exports = function () {

  return (result, req, res, next) => {
    let finalResp = {};
    if (_.isError(result)) {
      finalResp = {
        status: result.status || (STATUS)
      }
    }
  }
}