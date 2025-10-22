export interface IJsonResponse {
  statusCode: 200 | 400 | 500 | 401 | 404 | 201 | 204 | 429 | 403 | 503;
  status: 'success' | 'error';
  title: string;
  message: string;
  data?: any;
  extraData?: any;
  pageData?: any;
}
