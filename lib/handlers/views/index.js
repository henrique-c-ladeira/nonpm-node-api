const { safeWrapper } = require('../../helpers');
const { getTemplate } = require('../../helpers/getResources')

const index = safeWrapper(async (data, callback) => {
  
  if(data.method === 'get') {
    const view = await getTemplate('index');
    callback(200, view, 'html');
  }
  else {
    callback(405, undefined, 'html');
  }
});

module.exports = index;