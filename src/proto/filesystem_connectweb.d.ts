// @generated by protoc-gen-connect-web v0.11.0
// @generated from file filesystem.proto (package fs, syntax proto3)
/* eslint-disable */
// @ts-nocheck

import { GetImageRequest, GetImageResponse, ListFilesRequest, ListFilesResponse } from "./filesystem_pb.js";
import { MethodKind } from "@bufbuild/protobuf";

/**
 * Service definition
 *
 * @generated from service fs.FileSystem
 */
export declare const FileSystem: {
  readonly typeName: "fs.FileSystem",
  readonly methods: {
    /**
     * @generated from rpc fs.FileSystem.ListFiles
     */
    readonly listFiles: {
      readonly name: "ListFiles",
      readonly I: typeof ListFilesRequest,
      readonly O: typeof ListFilesResponse,
      readonly kind: MethodKind.Unary,
    },
    /**
     * @generated from rpc fs.FileSystem.GetImage
     */
    readonly getImage: {
      readonly name: "GetImage",
      readonly I: typeof GetImageRequest,
      readonly O: typeof GetImageResponse,
      readonly kind: MethodKind.Unary,
    },
  }
};

