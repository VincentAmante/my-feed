export function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <span className="loading loading-bars loading-lg text-primary"></span>
        </div>
    )
}

export function ErrorSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <span className="text-2xl text-primary">Something went wrong</span>
        </div>
    )
}