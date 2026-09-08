import React from "react";

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg">
      {/* Background Glow */}
      <div className="absolute h-[450px] w-[450px] rounded-full bg-primary/10 blur-[130px]" />

      {/* Loader */}
      <div className="relative flex flex-col items-center gap-8">
        <div className="relative flex items-center justify-center">
          {/* Outer Ring */}
          <div className="h-28 w-28 rounded-full border border-border" />

          {/* Rotating Gold Ring */}
          <div className="absolute h-28 w-28 animate-spin rounded-full border-[3px] border-transparent border-t-primary border-r-primary" />

          {/* Inner Ring */}
          <div className="absolute h-16 w-16 rounded-full border border-primary/40" />

          {/* Logo */}
          <h1 className="logo absolute text-3xl text-primary">A</h1>
        </div>

        <div className="text-center">
          <h2 className="logo text-2xl text-text">
            Luxury Collection
          </h2>

          <p className="mt-2 text-sm tracking-[0.4em] uppercase text-muted">
            Loading Experience...
          </p>
        </div>

        {/* Dots */}
        <div className="flex gap-2">
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:0ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}