import Skeleton from "@/components/ui/skeleton";

function PrivacyHeroSkeleton() {
  return (
    <section className="relative overflow-hidden border-b border-black/9 dark:border-white/9 bg-white dark:bg-[#111113] min-h-screen flex items-center justify-center px-6 py-28 md:px-10 lg:px-16">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-[rgba(0,188,161,0.08)] blur-3xl dark:bg-[rgba(0,188,161,0.10)]" />
        <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-[rgba(56,189,248,0.08)] blur-3xl dark:bg-[rgba(56,189,248,0.10)]" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[rgba(212,169,106,0.08)] blur-3xl dark:bg-[rgba(212,169,106,0.10)]" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <Skeleton className="h-4 w-36 rounded-full mb-6" />
        <Skeleton className="h-16 w-[min(42rem,90%)] rounded-3xl mb-5" />
        <div className="w-full max-w-3xl space-y-3 mb-8">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-[92%] mx-auto" />
          <Skeleton className="h-5 w-[68%] mx-auto" />
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </section>
  );
}

function PrivacySectionSkeleton({ index }: { index: number }) {
  return (
    <div className="border-t border-black/[0.14] dark:border-white/[0.14] py-6 md:py-8">
      <div className="grid items-center gap-5" style={{ gridTemplateColumns: "44px 1fr auto" }}>
        <Skeleton className="h-4 w-8 rounded-md" />
        <Skeleton className="h-8 w-[min(28rem,90%)] rounded-xl" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>

      <div className="pl-0 md:pl-16 pt-6 space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-[92%]" />
        <Skeleton className="h-5 w-[74%]" />

        {index % 2 === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-5">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white dark:bg-[#111113] border border-black/[0.14] dark:border-white/[0.14] rounded p-4 space-y-3"
              >
                <Skeleton className="h-3 w-20 rounded-md" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-[76%]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 my-5">
            {[0, 1, 2, 3, 4].map((item) => (
              <div key={item} className="flex gap-3 items-start">
                <Skeleton className="h-5 w-5 rounded-full mt-0.5 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-full" />
                  {item % 2 === 0 && <Skeleton className="h-5 w-[72%]" />}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="border-l-[3px] border-[#00BCA1] bg-[rgba(0,188,161,0.08)] dark:bg-[rgba(0,188,161,0.10)] rounded-r-lg px-4 py-4 space-y-3">
          <Skeleton className="h-5 w-[85%]" />
          <Skeleton className="h-5 w-[70%]" />
        </div>
      </div>
    </div>
  );
}

export default function PrivacyPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] dark:bg-[#09090B] text-[#1A1A1A] dark:text-[#EDEDED]">
      <PrivacyHeroSkeleton />

      <section className="mx-auto w-full max-w-6xl px-6 py-14 md:px-10 lg:px-16">
        {[0, 1, 2, 3, 4, 5].map((section) => (
          <PrivacySectionSkeleton key={section} index={section} />
        ))}
      </section>
    </div>
  );
}
