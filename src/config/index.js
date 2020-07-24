const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
const crypto = require("crypto");

const storageTypes = {
  s3: multerS3({
    s3: new aws.S3(),
    acl: "public-read",
    bucket: "pessoal-node-app",
    contentType: multer.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      crypto.randomBytes(16, (err, hash) => {
        if (err) cb(err);
        const fileName = `${hash.toString("hex")}/${file.originalname}`;

        cb(null, fileName);
      });
    },
  }),
};

module.exports = {
  storage: storageTypes.s3,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
};
