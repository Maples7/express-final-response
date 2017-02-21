const _ = require('lodash');

const default_status = require('./status.json');

module.exports = function ({custom_status = [], encoding = 'utf8', logger = console}) {
  const all_status = _.concat(default_status, custom_status);
  
  const STATUS = {};
  const CODES = {};
  _.forEach(all_status, (item) => {
    STATUS[item.status] = CODES[item.code] = item;
  });

  return (result, req, res, next) => {
    let finalResp = {};
    if (_.isError(result)) {
      finalResp = {
        status: result.status || (STATUS[result.message] ? result.message : 'error'),
        msg: result.message,
        err: result
      }
    } else if (_.isPlainObject(result)) {
      finalResp = {
        status: result.status || 'success',
        msg: result.msg || result,
        ext: result.ext,
        desc: result.desc
      }
    } else {
      finalResp = {
        status: 'success',
        msg: result
      }
    }

    
  }
}