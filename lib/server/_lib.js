
//TYPES
const TYPE_JSON = 'application/json';
const TYPE_HTML = 'text/html';
const TYPE_FAVICON = 'image/x-icon';
const TYPE_PNG = 'image/png';
const TYPE_JPG = 'image/jpeg';
const TYPE_CSS = 'text/css';
const TYPE_JS = 'application/javascript';

const lib = {}

lib.setContentString = (payload, contentType) => {
  let payloadString = '';

  switch (contentType) {
    case 'json':
      payload = typeof (payload) == 'object' ? payload : {};
      payloadString = JSON.stringify(payload);

      return { payloadString, contentTypeString: TYPE_JSON };

    case 'html':
      payload = typeof (payload) == 'string' ? payload : '';
      payloadString = payload;

      return { payloadString, contentTypeString: TYPE_HTML };

    case 'favicon':
      payload = payload || '';
      payloadString = payload;

      return { payloadString, contentTypeString: TYPE_FAVICON };

    case 'png':
      payload = payload || '';
      payloadString = payload;

      return { payloadString, contentTypeString: TYPE_PNG };

    case 'jpg':
      payload = payload || '';
      payloadString = payload;

      return { payloadString, contentTypeString: TYPE_JPG };

    case 'css':
      payload = payload || '';
      payloadString = payload;

      return { payloadString, contentTypeString: TYPE_CSS };  

    case 'js':
      payload = payload || '';
      payloadString = payload;

      return { payloadString, contentTypeString: TYPE_JS };  

    default: return { payloadString: '', contentTypeString: 'text/plain' }
  }
};

module.exports = lib;