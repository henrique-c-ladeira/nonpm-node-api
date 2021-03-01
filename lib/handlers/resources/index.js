const { safeWrapper } = require('../../helpers');
const { getStaticAsset } = require('../../helpers/getResources');

const resources = {}

resources.favicon = safeWrapper(async (data, callback) => {  
  if(data.method === 'get') {
    const favicon = await getStaticAsset('favicon.ico')
    callback(200, favicon, 'favicon');
  }
  else {
    callback(405);
  }
});

resources.public = safeWrapper(async (data, callback) => {  
  if(data.method !== 'get')
    return callback(405);

  const trimmedAssetName = data.trimmedPath.replace('public/','').trim();
  
  if(!trimmedAssetName.length > 0) 
    return callback(404);

  const resource = await getStaticAsset(trimmedAssetName);

  if(!resource) 
    return callback(404);

  // Determine the content type (default to plain text)
  var contentType = 'plain';

  if(trimmedAssetName.indexOf('.css') > -1){
    contentType = 'css';
  }

  if(trimmedAssetName.indexOf('.png') > -1){
    contentType = 'png';
  }

  if(trimmedAssetName.indexOf('.jpg') > -1){
    contentType = 'jpg';
  }

  if(trimmedAssetName.indexOf('.ico') > -1){
    contentType = 'favicon';
  }

  return callback(200,resource,contentType);
});

module.exports = resources;