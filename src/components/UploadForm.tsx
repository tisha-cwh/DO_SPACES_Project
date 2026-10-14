"use client";

import { useActionState, useRef } from "react";
import { createItem, type CreateItemState } from "@/app/actions";

const initialState: CreateItemState = {};

function SubmitButton({ pending }: { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
    >
      {pending ? "Uploading..." : "Upload"}
    </button>
  );
}

export default function UploadForm() {
  const [state, formAction, pending] = useActionState(
    createItem,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        const result = await formAction(formData);
        formRef.current?.reset();
        return result;
      }}
      className="flex w-full flex-col gap-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800"
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Name
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Enter a name"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-black dark:focus:border-white"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="thumbnailUrl" className="text-sm font-medium">
          Thumbnail
        </label>
        <input
          id="thumbnailUrl"
          name="thumbnailUrl"
          type="text"
          placeholder="Enter thumbnail URL"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-black dark:border-zinc-700 dark:bg-black dark:focus:border-white"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="file" className="text-sm font-medium">
          Upload Files
        </label>
        <input
          id="file"
          name="file"
          type="file"
          accept="image/*"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-2 file:py-1 file:text-sm dark:border-zinc-700 dark:bg-black dark:file:bg-zinc-800 dark:file:text-white"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      {state.success && (
        <div className="flex flex-col gap-1 text-sm">
          <p className="text-green-600 dark:text-green-400">
            Saved successfully.
          </p>
          {state.uploadedFileUrl && (
            <p className="break-all text-zinc-600 dark:text-zinc-400">
              Uploaded file URL:{" "}
              <a
                href={state.uploadedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                {state.uploadedFileUrl}
              </a>
            </p>
          )}
        </div>
      )}

      <SubmitButton pending={pending} />
    </form>
  );
}
