const assert = require('assert');
const _ = require('lodash');
const defaultStatus = require('./status.json');

module.exports = function genFinalResponse({
  customStatuses = [],
  encoding = 'utf-8',
  logger = console,
  JSONformat = 'JSON',
  isDebug = false,
  onlyLogError = false,
  errorView = undefined
} = {}) {
  const allStatus = _.concat(defaultStatus, customStatuses);

  // gen status map
  const STATUS = {};
  _.forEach(allStatus, (item) => {
    STATUS[item.status] = item;
  });

  /**
   * Log Functions
   */

  function logRequestError(err, req, finalResp) {
    if (logger) {
      logger.error('\nRequest Error:\n',
                    'URL:', req.method, req.url, '\n\n',
                    'Error:', err, '\n\n',
                    'Response:', finalResp, '\nError End.\n');
    }
  }

  function logRenderingError(err, view, finalResp) {
    if (logger) {
      logger.error('\nRendering Template Error:\n',
                    'Error:', err, '\n\n',
                    'View:', view, '\n\n',
                    'Response:', finalResp, '\nError End.\n');
    }
  }

  function logNormalRequest(req, finalResp) {
    if (!onlyLogError && logger) {
      logger.info('\nRequest:\n',
                  'URL:', req.method, req.url, '\n',
                  'Response:', finalResp, '\nRequest End.\n');
    }
  }

  /**
   * Response Functions
   */

  function returnJSON(finalResp, res) {
    if (JSONformat === 'JSON') {
      res.set('Content-Type', `application/json; charset=${encoding}`);
      res.json(finalResp);
    } else {
      res.set('Content-Type', `text/plain; charset=${encoding}`);
      res.send(JSON.stringify(finalResp));
    }
  }

  function returnHTML(view, finalResp, res) {
    res.render(view, finalResp, (err, html) => {
      if (err) {
        logRenderingError(err, view, finalResp);
        returnJSON(finalResp, res);
      } else {
        res.set('Content-Type', `text/html; charset=${encoding}`);
        res.send(html);
      }
    });
  }

  /**
   * handle result according to its type
   */

  function handleErrorRequest(result, req, res) {
    const err = _.isError(result.msg) ? result.msg : result;
    const finalResp = STATUS[result.status] || STATUS[err.message] || STATUS['error'];
    finalResp.msg = err.message;
    if (isDebug) finalResp.ext = err;

    logRequestError(err, req, finalResp);

    res.status(finalResp.statusCode);
    const view = result.view || errorView;
    if (view) {
      returnHTML(view, finalResp, res);
    } else {
      returnJSON(finalResp, res);
    }
  }

  function handleNormalRequest(result, req, res) {
    assert(_.isPlainObject(result));
    const finalResp = STATUS[result.status] || STATUS['success'];
    if (result.msg) finalResp.msg = result.msg;
    if (result.ext) finalResp.ext = result.ext;

    logNormalRequest(req, finalResp);

    res.status(finalResp.statusCode);
    if (result.view) {
      returnHTML(result.view, finalResp, res);
    } else {
      returnJSON(finalResp, res);
    }
  }

  /**
   * the real final response middleware
   */
  return (result, req, res, next) => {
    if (_.isError(result.msg) || _.isError(result)) {
      handleErrorRequest(result, req, res);
    } else {
      handleNormalRequest(result, req, res);
    }
  };
};
