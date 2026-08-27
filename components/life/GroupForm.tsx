"use client";

import { FormEvent, useState } from "react";

type GroupFormProps = {
  initialName?: string;
  submitLabel: string;
  onSubmit: (name: string) => Promise<void>;
  onCancel: () => void;
  busy?: boolean;
};

export default function GroupForm({
  initialName = "",
  submitLabel,
  onSubmit,
  onCancel,
  busy = false,
}: GroupFormProps) {
  const [name, setName] = useState(initialName);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSubmit(name);
  }

  return (
    <form
      className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
      onSubmit={(event) => void handleSubmit(event)}
    >
      <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-gray-700">
        Group name
        <input
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
