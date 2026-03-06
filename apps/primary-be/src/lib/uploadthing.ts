import { createUploadthing, type FileRouter } from 'uploadthing/express';

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, name: file.name, type: 'image' };
  }),

  documentUploader: f({
    pdf: { maxFileSize: '16MB', maxFileCount: 1 },
    'application/msword': { maxFileSize: '16MB', maxFileCount: 1 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      maxFileSize: '16MB',
      maxFileCount: 1,
    },
    'application/vnd.ms-excel': { maxFileSize: '16MB', maxFileCount: 1 },
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
      maxFileSize: '16MB',
      maxFileCount: 1,
    },
    'application/vnd.ms-powerpoint': { maxFileSize: '16MB', maxFileCount: 1 },
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
      maxFileSize: '16MB',
      maxFileCount: 1,
    },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, name: file.name, type: 'document' };
  }),

  videoUploader: f({
    video: { maxFileSize: '64MB', maxFileCount: 1 },
  }).onUploadComplete(({ file }) => {
    return { url: file.ufsUrl, name: file.name, type: 'video' };
  }),

  resourceUploader: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
    pdf: { maxFileSize: '16MB', maxFileCount: 1 },
    video: { maxFileSize: '64MB', maxFileCount: 1 },
    'application/msword': { maxFileSize: '16MB', maxFileCount: 1 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      maxFileSize: '16MB',
      maxFileCount: 1,
    },
  }).onUploadComplete(({ file }) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let type = 'file';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) type = 'image';
    else if (['mp4', 'webm', 'mov'].includes(ext)) type = 'video';
    else if (ext === 'pdf') type = 'pdf';
    else if (['doc', 'docx'].includes(ext)) type = 'document';
    return { url: file.ufsUrl, name: file.name, type };
  }),

  chatAttachment: f({
    image: { maxFileSize: '4MB', maxFileCount: 1 },
    pdf: { maxFileSize: '8MB', maxFileCount: 1 },
    'application/msword': { maxFileSize: '8MB', maxFileCount: 1 },
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
      maxFileSize: '8MB',
      maxFileCount: 1,
    },
  }).onUploadComplete(({ file }) => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    let type = 'file';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) type = 'image';
    else if (ext === 'pdf') type = 'pdf';
    else if (['doc', 'docx'].includes(ext)) type = 'document';
    return { url: file.ufsUrl, name: file.name, type };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

export function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'mov', 'avi'].includes(ext)) return 'video';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'document';
  if (['xls', 'xlsx'].includes(ext)) return 'spreadsheet';
  if (['ppt', 'pptx'].includes(ext)) return 'presentation';
  return 'file';
}

export function canPreview(fileType: string): boolean {
  return ['image', 'pdf', 'video'].includes(fileType);
}
