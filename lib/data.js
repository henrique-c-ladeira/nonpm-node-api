// Dependencies
const fs = require('fs').promises;
const path = require('path');

const lib = {};

lib.baseDir = path.join(__dirname,'/../data/');

// Write data to a file
lib.create = async (dir,file,data) => {
  const fileDescriptor = await fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx');
  const stringData = JSON.stringify(data);
  await fileDescriptor.writeFile(stringData);
  await fileDescriptor.close();
};

// Overwrite data to a file
lib.overwrite = async (dir,file,data) => {
  const fileDescriptor = await fs.open(`${lib.baseDir}${dir}/${file}.json`, 'w');
  const stringData = JSON.stringify({});
  await fileDescriptor.writeFile(stringData);
  await fileDescriptor.close();
};

// Read data from a file
lib.read = async (dir, file) => {
  try {
    data = await fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8'); 
    parsedData = JSON.parse(data);
    return parsedData;
  } catch(err) {
    console.log(err);
    return false;
  }
};

// Update data in a file
lib.update = async(dir, file, data) => {
  const fileDescriptor = await fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+');
  const stringData = JSON.stringify(data);
  await fileDescriptor.truncate();
  await fileDescriptor.writeFile(stringData);
  await fileDescriptor.close();
};

// Delete a file
lib.delete = async (dir, file) => {
  await fs.unlink(`${lib.baseDir}${dir}/${file}.json`, 'r+');
}

//Check if file exists
lib.exists = async (dir, file) => {
  try {
    await fs.readFile(`${lib.baseDir}${dir}/${file}.json`, 'utf8');
    return true;
  } catch {
    return false;
  }
};

module.exports = lib;