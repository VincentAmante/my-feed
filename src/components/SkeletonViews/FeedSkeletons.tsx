export function LoadingSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-opacity-0">
      <span className="loading loading-bars loading-lg text-primary"></span>
    </div>
  );
}

export function ErrorSkeleton() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <span className="text-2xl text-primary">Something went wrong</span>
    </div>
  );
}
