export function isValidJSONString (str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }


  export function randomId () {
    var seq = (Math.floor(Math.random() * 10000) + 10000).toString().substring(1);
    return seq;
  }