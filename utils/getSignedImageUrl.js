const { GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const r2 = require('./r2Client');

async function getSignedImageUrl(key, expiresIn = 300, bucket) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const url = await getSignedUrl(r2, command, { expiresIn });
  return url;
}

module.exports = getSignedImageUrl;
