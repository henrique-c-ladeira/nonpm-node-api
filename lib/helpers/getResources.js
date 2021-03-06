const fs = require('fs').promises;
const _data = require('../data');
const path = require('path');

const baseDir = path.join(__dirname,'/../../');

getResources = {};

getResources.getTemplate = async (template, data) => {
  try {
    const dir = 'templates';
    const _header = await fs.readFile(`${baseDir}${dir}/_header.html`, 'utf8'); 
    const _body = await fs.readFile(`${baseDir}${dir}/${template}.html`, 'utf8'); 
    const _footer = await fs.readFile(`${baseDir}${dir}/_footer.html`, 'utf8');
    const joinedTemplate = _interpolate(_header + _body + _footer, data);
    return joinedTemplate;
  } catch(err) {
    console.log(err);
    return false;
  }
};

getResources.getStaticAsset = async (asset) => {
  const dir = 'public';
  data = await fs.readFile(`${baseDir}${dir}/${asset}`); 
  return data;
}


const _interpolate = function(str,data){
  str = typeof(str) == 'string' && str.length > 0 ? str : '';
  data = typeof(data) == 'object' && data !== null ? data : {};

  // Add the templateGlobals to the data object, prepending their key name with "global."
  // for(var keyName in config.templateGlobals){
  //   if(config.templateGlobals.hasOwnProperty(keyName)){
  //     data['global.'+keyName] = config.templateGlobals[keyName]
  //   }
  // }

  // For each key in the data object, insert its value into the string at the corresponding placeholder
  for(var key in data){
    if(data.hasOwnProperty(key) && typeof(data[key] === 'string')){
      var replace = data[key];
      var find = '{'+key+'}';
      str = str.replace(find,replace);
    }
  }

  return str;
};

getResources.makeListTemplate = async (dir, name) =>  {
  const listData = await _data.read(dir, name);
  return listData.map(elem => `
    <div class="card mb-5 p-4">
      <h3 class="title"> ${elem.name} </h3>
      <h3 class="subtitle"> $${(elem.price/100).toFixed(2)} </h3>
      <button id="${elem.name}" onclick="app.addItem(this)" class="button is-dark">Buy</button>
    </div>
    `).join('')
  
}

module.exports = getResources;