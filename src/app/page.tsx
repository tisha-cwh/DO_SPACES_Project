import { prisma } from "@/lib/prisma";
import UploadForm from "@/components/UploadForm";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await prisma.item.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-12 dark:bg-black">
      <main className="flex w-full max-w-2xl flex-col gap-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            DO Spaces Demo
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Enter a name, a thumbnail URL, and/or upload a file.
          </p>
        </div>

        <UploadForm />

        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-medium">Saved items</h2>

          {items.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Nothing saved yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  {item.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-zinc-100 dark:bg-zinc-900" />
                  )}
                  <p className="truncate text-sm font-medium">{item.title}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
