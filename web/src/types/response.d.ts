type TServerResponse = {
  statusCode: 200 | 400 | 500 | 401 | 201 | 204 | 429;
  status: "success" | "error";
  title: string;
  message: string;
  data?: { [key: string]: string | number | object | Array };
  pageData?: unknown;
  extraData?: { [key: string]: string | number | object | Array };
};

type TOnSuccessHandle = (res: TServerResponse) => void;
type TOnErrorHandle = (res: unknown) => void;

type TGetRequestParams = {
  page: number;
  itemPerPage: number;
  search?: string;
  searchFieldNumber?: string[];
  searchFieldString?: string[];
  searchFieldBoolean?: { [key: string]: boolean }[];
};
