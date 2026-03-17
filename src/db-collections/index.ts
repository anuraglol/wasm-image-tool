import { createCollection, localOnlyCollectionOptions } from "@tanstack/react-db";
import { z } from "zod";

const FileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  bytes: z.instanceof(Uint8Array),
});

export type FileRecord = z.infer<typeof FileSchema>;

export const fileCollection = createCollection(
  localOnlyCollectionOptions({
    getKey: (file) => file.name,
    schema: FileSchema,
  }),
);
