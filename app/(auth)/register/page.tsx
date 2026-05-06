import Image from "next/image";
import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-8 transition-colors duration-300 dark:bg-[#09090B]">
      <div className="grid min-h-160 w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/60 transition-colors duration-300 md:grid-cols-2 dark:border-gray-700 dark:bg-[#111114] dark:shadow-black/30">

        {/* ── Left Side — image panel ── */}
        <div className="hidden md:flex relative flex-col justify-between p-8 overflow-hidden">
          {/* Background image */}
          <Image
            src="/shadow.webp"
            alt="Auto Offensive Mascot"
            fill
            className="object-cover"
            loading="eager"
            unoptimized
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-black/30" />

          {/* Top: logo + back link */}
          <div className="relative z-10 flex items-center justify-between">
            <Link href="/">
              <Image
                src="/Auto_Offensive_Dark-mode.png"
                alt="Auto Offensive Logo"
                width={110}
                height={36}
                className="object-contain drop-shadow-md"
                unoptimized
              />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-xl border border-white/25 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md transition hover:bg-white/25"
            >
              Back to website →
            </Link>
          </div>

          {/* Bottom: tagline + dots */}
          <div className="relative z-10">
            <p className="text-white text-2xl font-bold leading-snug drop-shadow-lg">
              Capturing Vulnerabilities,
              <br />
              Creating Security
            </p>
          </div>
        </div>

        {/* ── Right Side — original RegisterForm, pure white panel ── */}
        <div className="flex flex-col justify-center border-t border-slate-200/80 bg-white px-10 py-12 transition-colors duration-300 md:border-t-0 md:border-l dark:border-gray-700 dark:bg-[#111114]">
          {/* Mobile-only logo */}
          <div className="md:hidden mb-8 flex justify-center">
            <Link href="/">
              <Image
                src="/Auto_Offensive_Light-mode.png"
                alt="Auto Offensive Logo"
                width={140}
                height={48}
                className="object-contain dark:hidden"
              />
              <Image
                src="/Auto_Offensive_Dark-mode.png"
                alt="Auto Offensive Logo"
                width={140}
                height={48}
                className="hidden object-contain dark:block"
                unoptimized
              />
            </Link>
          </div>

          {/* Original RegisterForm — untouched */}
          <RegisterForm />
        </div>

      </div>
    </div>
  );
}
