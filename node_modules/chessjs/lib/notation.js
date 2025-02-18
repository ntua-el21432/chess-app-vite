exports.convert = function (str) {
  /* 
   * Internally x/y mapping is used for tiles, but
   * internationally a numeric (ICCF) standard is
   * used. This function converts incoming strings
   * based on that format to internal x/y coordinates.
   */
  console.log("We got: %s", str);
  var strNumeric = /^\d+$/.test(str);
  var result = {};
  result.from = {};
  result.to = {};

  if (strNumeric) {
    console.log('We only have digits, we converting from numeric to internal x/y');
    if (typeof str !== 'string') {
      str = ''+str;
    }
    var strArr = str.split('');
    result.from.x = parseInt(str.charAt(0), 10);
    result.from.y = parseInt(str.charAt(1), 10);
    result.to.x = parseInt(str.charAt(2), 10);
    result.to.y = parseInt(str.charAt(3), 10);
    if (str.length === 5) {
      var type = {1:'queen', 2:'rook', 3:'bishop', 4:'knight'};
      result.promotion = type[parseInt(str.charAt(4))];
    }
  }
  return result;
}

