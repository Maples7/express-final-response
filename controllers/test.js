'use strict';

module.exports = {
  '/1': (req, res, next) => {
    next({status: 'success', msg: 'test 1 success'});
  },
  '/2': (req, res, next) => {
    try {
      throw new Error('error');
    } catch (e) {
      next(e);
    }
  },
  '/3': (req, res, next) => {
    next({status: 'DBError', msg: new Error('TrueError')});
  },
  '/4': (req, res, next) => {
    next({status: 'error', msg: new Error('I am an error'), view: '500'});
  },
  '/5': (req, res, next) => {
    next({status: 'error', msg: new Error('I am an error'), view: 'renderError'});
  },
  '/6': (req, res, next) => {
    next({status: 'success', msg: 'test 1 success', view: '200'});
  },
}
