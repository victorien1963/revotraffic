// const Minio = require('minio')
const {
  CreateBucketCommand,
  PutObjectCommand,
  // CopyObjectCommand,
  DeleteObjectCommand,
  // DeleteBucketCommand,
  GetObjectCommand
} = require('@aws-sdk/client-s3')

const { S3Client } = require('@aws-sdk/client-s3')

const client = new S3Client(process.env.MINIO_ENDPOINT
  ? {
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      },
      region: 'us-east-1',
      endpoint: process.env.MINIO_ENDPOINT,
      forcePathStyle: true
    }
  : {
      region: process.env.AWS_REGION || 'ap-northeast-1'
    })

const bucket_name = process.env.BUCKET_NAME
const init = async () => {
  // create bucket
  try {
    const create_bucket_params = {
      Bucket: bucket_name
    }
    console.log('\nCreating the bucket, named ' + bucket_name + '...\n')
    const data = await client.send(
      new CreateBucketCommand(create_bucket_params)
    )
    console.log('Bucket created at ', data.Location)
  } catch (e) {
    console.log('encount error while create bucket')
    console.log(e)
  }
}
init()

const upload = async ({ Key, Body }) => {
  try {
    const fileName = `${Date.now()}_${Key}`
    const object_upload_params = {
      Bucket: bucket_name,
      // To create a directory for the object, use '/'. For example, 'myApp/package.json'.
      Key: fileName,
      // Content of the new object.
      Body
    }
    await client.send(new PutObjectCommand(object_upload_params))
    return { name: fileName }
  } catch (e) {
    console.log('encount error while upload file')
    console.log(e)
    return false
  }
}

const download = async ({ Key }) => {
  try {
    const download_bucket_params = {
      Bucket: bucket_name,
      Key
    }
    console.log(
      '\nDownloading ' +
          Key +
          ' from' +
          bucket_name +
          ' ...\n'
    )
    // Create a helper function to convert a ReadableStream into a string.
    // const streamToString = (stream) =>
    //   new Promise((resolve, reject) => {
    //     const chunks = [];
    //     stream.on('data', (chunk) => chunks.push(chunk));
    //     stream.on('error', reject);
    //     stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    //   });

    // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
    const data = await client.send(new GetObjectCommand(download_bucket_params))
    // Convert the ReadableStream to a string.
    // const bodyContents = await streamToString(data.Body)
    // console.log(bodyContents)
    return data.Body
  } catch (e) {
    console.log(`encount error while download file ${Key}`)
    return { error: `encount error while download file ${Key}` }
  }
}

const remove = async ({ Key }) => {
  console.log('\nDeleting ' + Key + ' from' + bucket_name);
  const delete_object_from_bucket_params = {
    Bucket: bucket_name,
    Key
  }

  await client.send(
    new DeleteObjectCommand(delete_object_from_bucket_params)
  )
  console.log('Success. Object deleted from bucket.')
}

// const minioClient = new Minio.Client({
//   endPoint: process.env.FILE_STORAGE_URL || 'localhost',
//   port: 9000,
//   useSSL: false,
//   accessKey: process.env.STORAGE_ACCESS_KEY || 'LucaRWACCESS',
//   secretKey: process.env.STORAGE_ACCESS_SECRET || 'LucaRWSECRET'
// })

// const checkBucket = async (name) => {
//   if (!process.env.MINIO_ENDPOINT) return
//   await client.makeBucket(name, 'us-east-1', (e) => {
//     if (e) {
//       return console.log(e)
//     }
//     return console.log('------------------Success')
//   })
// }

// checkBucket('luca')

module.exports = {
  minioClient: client,
  // async put (name, data) {
  //   const fileName = `${name}`
  //   const file = await client.putObject('luca', fileName, Buffer.from(data))
  //   return { fileName, file }
  // }
  upload,
  download,
  remove
}
