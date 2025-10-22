import { Request } from 'express';

export const generateFileUrl = (req: Request, filePath: string) => {
  const isSecure = process.env.NODE_ENV == 'development';
  const requestProtocol = isSecure ? 'https' : 'http';
  const serverUrl = requestProtocol + '://' + req.get('host');
  const fileUrl = serverUrl + '/' + filePath;
  return fileUrl;
};

export const generatePDFFileUrl = (req: Request, filePath: string) => {
  const isSecure = req.protocol === 'https' || process.env.NODE_ENV === 'production';
  const protocol = isSecure ? 'https' : 'http';
  const host = req.get('host'); 

  const cleanedPath = '/' + filePath.replace(/^\/+/, '');

  return `${protocol}://${host}${cleanedPath}`;
};
