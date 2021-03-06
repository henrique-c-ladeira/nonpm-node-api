const { safeWrapper } = require('../../helpers');
const { getTemplate, makeListTemplate } = require('../../helpers/getResources')
const _data = require('../../data');
const { verifyToken } = require('../_auth');

const shop = {}

shop.view = safeWrapper(async (data, callback) => {
  const menu = await makeListTemplate('','menu');

  if(data.method !== 'get')
    return callback(405, undefined, 'html');

  const view = await getTemplate('shop',{menu});
  return callback(200, view, 'html');
});

module.exports = shop;