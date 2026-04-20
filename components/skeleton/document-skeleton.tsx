import Skeleton from "@/components/ui/skeleton";

function LeftSidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-72 shrink-0 sticky top-22 self-start h-[calc(100vh-5.5rem)] overflow-hidden py-5.5 border-r border-[#E2DDD5] dark:border-white/10 bg-[#F7F5F0] dark:bg-[#09090B]">
      <div className="px-5 space-y-7">
        {[0, 1, 2].map((group) => (
          <div key={group} className="space-y-2.5">
            <Skeleton className="h-3 w-24 rounded-md" />
            <div className="space-y-2">
              {[0, 1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  className={`h-11 rounded-lg ${item % 2 === 0 ? "w-full" : "w-[88%]"}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function RightSidebarSkeleton() {
  return (
    <aside className="hidden xl:block w-72 shrink-0 sticky top-22 self-start max-h-[calc(100vh-5.5rem)] overflow-hidden border-l border-[#E2DDD5] dark:border-white/10 px-6 py-7 bg-[#F7F5F0] dark:bg-[#09090B]">
      <Skeleton className="h-14 w-full rounded-2xl mb-5" />
      <Skeleton className="h-3 w-24 rounded-md mb-3" />
      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5, 6].map((item) => (
          <Skeleton
            key={item}
            className={`h-7 rounded-md ${
              item % 3 === 0 ? "w-[82%]" : item % 3 === 1 ? "w-full" : "w-[74%]"
            }`}
          />
        ))}
      </div>
    </aside>
  );
}

function ContentSkeleton() {
  return (
    <main className="flex-1 min-w-0">
      <article className="w-full min-w-0 max-w-200 px-5 pt-10 pb-24 sm:px-6 md:px-8 lg:px-10 xl:px-14 xl:pt-12 xl:pb-32">
        <section className="pb-10 mb-12 border-b border-[#E4DFD5] dark:border-white/10">
          <Skeleton className="h-3 w-32 rounded-md mb-5" />
          <Skeleton className="h-8 w-40 rounded-full mb-5" />
          <Skeleton className="h-14 w-72 rounded-2xl mb-4" />
          <div className="space-y-3 mb-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[92%]" />
            <Skeleton className="h-5 w-[68%]" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-11 w-40 rounded-full" />
            <Skeleton className="h-11 w-44 rounded-full" />
            <Skeleton className="h-11 w-36 rounded-full" />
          </div>
        </section>

        <section className="mb-12">
          <Skeleton className="h-10 w-44 rounded-xl mb-4" />
          <div className="space-y-3 mb-5">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[88%]" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-[#E2DDD5] dark:border-white/10 bg-white/90 dark:bg-[#121214] p-5 shadow-[0_8px_26px_rgba(26,23,20,0.04)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.22)]"
              >
                <div className="flex items-start gap-4">
                  <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-[82%]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <Skeleton className="h-10 w-40 rounded-xl mb-4" />
          <div className="space-y-3 mb-5">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[84%]" />
          </div>
          <div className="overflow-hidden rounded-2xl border border-[#E2DDD5] dark:border-white/10 bg-white/90 dark:bg-[#121214] shadow-[0_8px_26px_rgba(26,23,20,0.04)] dark:shadow-[0_10px_28px_rgba(0,0,0,0.22)]">
            <div className="border-b border-[#E2DDD5] dark:border-white/10 bg-[#F0EDE6] dark:bg-white/5 px-4 py-3">
              <Skeleton className="h-3 w-32 rounded-md" />
            </div>
            {[0, 1, 2, 3].map((row) => (
              <div
                key={row}
                className="grid grid-cols-[1.2fr_0.8fr_0.8fr_2fr] gap-4 px-4 py-4 border-b last:border-b-0 border-[#E2DDD5] dark:border-white/10"
              >
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className={`h-5 ${row % 2 === 0 ? "w-full" : "w-[78%]"}`} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="h-10 w-48 rounded-xl mb-4" />
          <div className="rounded-2xl overflow-hidden border border-white/5 shadow-[0_8px_28px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/6 bg-[#16181F]">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28CA41]" />
              </div>
              <Skeleton className="h-3 w-24 rounded-md bg-white/10 dark:bg-white/10" />
              <Skeleton className="h-3 w-10 rounded-md bg-white/10 dark:bg-white/10" />
            </div>
            <div className="bg-[#16181F] px-5 py-5 space-y-3">
              <Skeleton className="h-5 w-[70%] bg-white/10 dark:bg-white/10" />
              <Skeleton className="h-5 w-[82%] bg-white/10 dark:bg-white/10" />
              <Skeleton className="h-5 w-[58%] bg-white/10 dark:bg-white/10" />
              <Skeleton className="h-5 w-[76%] bg-white/10 dark:bg-white/10" />
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}

export default function DocumentSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] transition-colors duration-300">
      <div className="mx-auto flex w-full max-w-7xl items-start pt-22">
        <LeftSidebarSkeleton />
        <ContentSkeleton />
        <RightSidebarSkeleton />
      </div>
    </div>
  );
}
