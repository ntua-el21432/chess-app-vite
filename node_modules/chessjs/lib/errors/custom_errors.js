var util = require('util');

var CustomError = function (msg, constr) {
  Error.captureStackTrace(this, constr || this);
  this.message = msg || 'Error'; 
};

util.inherits(CustomError, Error);
CustomError.prototype.name = 'Custom Error';

var NotationConversionError = function (msg) {
  NotationConversionError.super_.call(this, msg, this.constructor);
};

util.inherits(NotationConversionError, CustomError);
NotationConversionError.prototype.name = 'Notation Conversion Error';

module.exports = {
  NotationConversion: NotationConversionError,
}
