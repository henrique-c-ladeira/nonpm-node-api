const fs = require('fs').promises;

const path = require('path');

const baseDir = path.join(__dirname,'/../../');

getResources = {};

getResources.getTemplate = async (template) => {
  try {
    const dir = 'templates';
    data = await fs.readFile(`${baseDir}${dir}/${template}.html`, 'utf8'); 
    console.log(data);
    return data;
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

module.exports = getResources;