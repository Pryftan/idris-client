// @generated by protoc-gen-es v1.10.1
// @generated from file filesystem.proto (package fs, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { proto3 } from "@bufbuild/protobuf";

/**
 * File information
 *
 * @generated from message fs.FileInfo
 */
export const FileInfo = /*@__PURE__*/ proto3.makeMessageType(
  "fs.FileInfo",
  () => [
    { no: 1, name: "filename", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "is_dir", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
    { no: 3, name: "comment", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 4, name: "hidden", kind: "scalar", T: 8 /* ScalarType.BOOL */ },
  ],
);

/**
 * Request a list of files
 *
 * @generated from message fs.ListFilesRequest
 */
export const ListFilesRequest = /*@__PURE__*/ proto3.makeMessageType(
  "fs.ListFilesRequest",
  () => [
    { no: 1, name: "path", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * Response with file information
 *
 * @generated from message fs.ListFilesResponse
 */
export const ListFilesResponse = /*@__PURE__*/ proto3.makeMessageType(
  "fs.ListFilesResponse",
  () => [
    { no: 1, name: "files", kind: "message", T: FileInfo, repeated: true },
  ],
);

/**
 * Request image data
 *
 * @generated from message fs.GetImageRequest
 */
export const GetImageRequest = /*@__PURE__*/ proto3.makeMessageType(
  "fs.GetImageRequest",
  () => [
    { no: 1, name: "path", kind: "scalar", T: 9 /* ScalarType.STRING */ },
    { no: 2, name: "width", kind: "scalar", T: 13 /* ScalarType.UINT32 */ },
  ],
);

/**
 * Binary image data
 *
 * @generated from message fs.GetImageResponse
 */
export const GetImageResponse = /*@__PURE__*/ proto3.makeMessageType(
  "fs.GetImageResponse",
  () => [
    { no: 1, name: "image_data", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
  ],
);

/**
 * Request file data
 *
 * @generated from message fs.GetFileRequest
 */
export const GetFileRequest = /*@__PURE__*/ proto3.makeMessageType(
  "fs.GetFileRequest",
  () => [
    { no: 1, name: "path", kind: "scalar", T: 9 /* ScalarType.STRING */ },
  ],
);

/**
 * Binary file data
 *
 * @generated from message fs.GetFileResponse
 */
export const GetFileResponse = /*@__PURE__*/ proto3.makeMessageType(
  "fs.GetFileResponse",
  () => [
    { no: 1, name: "file_data", kind: "scalar", T: 12 /* ScalarType.BYTES */ },
  ],
);

