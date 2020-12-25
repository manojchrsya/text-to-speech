const multer = require('fastify-multer')
const fs = require('fs-extra');

class Upload {
  constructor () {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const path = `public/uploads`;
        fs.mkdirsSync(path);
        cb(null, path);
      },
      filename: (req, file, cb) => {
        const extension = file.originalname.split('.').pop();
        // eslint-disable-next-line no-underscore-dangle
        cb(null, `${Date.now()}.${extension}`);
      },
    });
    this.upload = multer({ storage, fileFilter: this.fileFilter });
  }

  fileFilter (req, file, callback) {
    // accept image only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, file);
  }
}

module.exports = Upload;
