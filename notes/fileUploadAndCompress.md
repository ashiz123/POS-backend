### FILE UPLOAD AND COMPRESS

# Resizing (Reducing Pixel Dimensions)
How it works: Photos taken from smartphones or digital cameras are massive (e.g., 4000×3000 pixels). However, a Point of Sale (POS) dashboard or product grid does not need that high resolution to display an item properly.
The Mechanism: Sharp scales the image down to fit within a constrained boundary (e.g., a maximum of 800×800 pixels while maintaining aspect ratio). By stripping away redundant pixels, the underlying data array shrinks significantly.


# WebP Format Conversion (Advanced Encoding)
How it works: Compared to older formats like JPEG or PNG, WebP is a modern image format developed by Google that achieves much smaller file sizes without noticeable loss in visual quality.
The Mechanism: Sharp uses lossy compression and advanced mathematical algorithms when encoding into WebP. It intelligently discards fine color variations and high-frequency details that the human eye cannot easily perceive, drastically dropping the file size from megabytes (MB) down to kilobytes (KB).


# Summary Flow:
The user uploads a large 5MB photo from a frontend form.
Multer catches it and holds the raw bytes temporarily in RAM as a Buffer.
Sharp takes that buffer, downsizes the pixel dimensions, converts it to WebP format, and compresses it.
The final lightweight result (around 50–100 KB) is sent up to AWS S3 via PutObjectCommand.

file - middlewares/uploadCompressFile.ts


# PutObjectCommand 
It stored file manually in S3 bucket with the below information. and the Body have optimized buffer.
Here is a detailed breakdown of what each property (Bucket, Key, Body, and ContentType) is doing inside the PutObjectCommand configuration:

1. Bucket
What it does: It tells AWS S3 which storage bucket to put the file into.
Why it uses process.env.AWS_S3_BUCKET_NAME!: Your bucket name (e.g., nodal-pos-uploads) is stored securely in your environment variables. The exclamation mark (!) in TypeScript is the non-null assertion operator, telling TypeScript: "Trust me, this environment variable is guaranteed to exist and won't be undefined."

2. Key
What it does: It defines the destination file path and file name inside that S3 bucket.
How it works: Because S3 is a flat storage system (it doesn't use actual computer folders), the slashes in your Key string (like products/product-1740000000-123.webp) act as virtual folders. It tells S3 to organize the file under the products folder directory with that specific unique filename.

3. Body
What it does: It provides the actual data payload (the file contents) that you want to upload.
How it works: Instead of streaming a raw file from a network request, your code passes the optimizedBuffer—which is the final binary data that Sharp finished compressing, resizing, and converting into WebP format.

4. ContentType
What it does: It sets the MIME type metadata of the file in AWS S3.
Why it matters: Setting "image/webp" explicitly tells S3 (and any web browser that later requests the image URL) that this file is a WebP image. When a cashier or dashboard user loads the product picture in your React frontend, the browser reads this ContentType header and immediately knows how to render it as a picture instead of trying to download it as an unknown binary file.

example:
new PutObjectCommand({
              Bucket: process.env.AWS_S3_BUCKET_NAME!,
              Key: s3Key,
              Body: optimizedBuffer,
              ContentType: "image/webp",
            }),
