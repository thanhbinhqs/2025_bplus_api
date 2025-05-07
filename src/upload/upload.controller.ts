import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import {
  ApiConsumes,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { existsSync, readdirSync, statSync } from 'fs';
import * as moment from 'moment';
import { Response } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File to upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Thư mục lưu file
        filename: (req, file, callback) => {
          //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          //create unique suffix with date format yyyyMMddHHmmss and random number
          const uniqueSuffix =
            moment().format('YYYYMMDD-HHmmss') +
            '-' +
            Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          //get file name without extension
          const fileNameWithoutExt = file.originalname
            .split('.')
            .slice(0, -1)
            .join('.');
          callback(null, `${fileNameWithoutExt}-${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 * 1024 }, // Giới hạn 10GB
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
    };
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(__dirname, '../../uploads', filename);

    // Kiểm tra file có tồn tại không
    if (!existsSync(filePath)) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    // Trả về file như một static resource
    return res.sendFile(filePath);
  }

  @Get('file')
  async listFiles(@Res() res: Response) {
    const uploadDir = join(__dirname, '../../uploads');

    // Hàm đệ quy để lấy danh sách file trong thư mục và các thư mục con
    const getFilesRecursively = (dir: string): string[] => {
      const files = readdirSync(dir);
      let fileList: string[] = [];
      for (const file of files) {
        const filePath = join(dir, file);
        if (statSync(filePath).isDirectory()) {
          fileList = fileList.concat(getFilesRecursively(filePath));
        } else {
          fileList.push(filePath);
        }
      }
      return fileList;
    };

    // Lấy danh sách file
    const files = getFilesRecursively(uploadDir).map((filePath) =>
      filePath.replace(uploadDir, '').replace(/\\/g, '/'),
    );

    return res.json({
      message: 'List of files',
      files,
    });
  }

  @Get('form')
  async getUploadForm(@Res() res: Response) {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>File Upload</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
          }
          .progress-container {
            width: 100%;
            background-color: #f3f3f3;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-top: 10px;
          }
          .progress-bar {
            height: 20px;
            width: 0;
            background-color: #4caf50;
            border-radius: 5px;
            text-align: center;
            color: white;
            line-height: 20px;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <h1>Upload File</h1>
        <form id="uploadForm">
          <input type="file" id="fileInput" name="file" required />
          <button type="submit">Upload</button>
        </form>

        <div class="progress-container">
          <div class="progress-bar" id="progressBar">0%</div>
        </div>

        <div id="status"></div>

        <script>
          const uploadForm = document.getElementById('uploadForm');
          const progressBar = document.getElementById('progressBar');
          const statusDiv = document.getElementById('status');

          uploadForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const fileInput = document.getElementById('fileInput');
            if (!fileInput.files.length) {
              alert('Please select a file to upload.');
              return;
            }

            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('file', file);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload/file', true);

            // Update progress bar
            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                const percentComplete = Math.round((event.loaded / event.total) * 100);
                progressBar.style.width = percentComplete + '%';
                progressBar.textContent = percentComplete + '%';
              }
            };

            // Handle upload completion
            xhr.onload = () => {
              if (xhr.status === 201) {
                statusDiv.textContent = 'File uploaded successfully!';
              } else {
                statusDiv.textContent = \`Error: \${xhr.statusText}\`;
              }
            };

            // Handle errors
            xhr.onerror = () => {
              statusDiv.textContent = 'An error occurred during the upload.';
            };

            // Send the file
            xhr.send(formData);
          });
        </script>
      </body>
      </html>
    `;
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }
}
