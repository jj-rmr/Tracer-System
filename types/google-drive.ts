export interface DriveBrowserItem {
  id: string;
  name: string;
  mimeType: string;
  isFolder: boolean;
  size: number | null;
  modifiedTime: string | null;
  webViewLink: string | null;
}

export interface DriveBreadcrumb {
  id: string;
  name: string;
}
