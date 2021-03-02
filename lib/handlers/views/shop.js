const { safeWrapper } = require('../../helpers');
const { getTemplate, makeMenuTemplate } = require('../../helpers/getResources')
const _data = require('../../data');

const shop = {}

shop.view = safeWrapper(async (data, callback) => {
  
  const menu = await makeMenuTemplate();

  if(data.method === 'get') {
    const view = await getTemplate('shop',menu);
    callback(200, view, 'html');
  }
  else {
    callback(405, undefined, 'html');
  }
});

module.exports = shop;