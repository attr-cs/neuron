import { Skeleton } from "@/components/ui/skeleton"

function ProfileSkeleton() {
  return (
    <div className="bg-slate-100 p-5 grid grid-cols-3 gap-4 w-full h-full animate-pulse">
      <div className="col-span-2 bg-white rounded-2xl shadow-lg">
        <div className="bg-gray-200 rounded-t-2xl h-60 relative" />
        <div className="px-8 mt-10">
          <div className="flex justify-between">
            <div className="flex gap-6">
              <Skeleton className="rounded-full w-32 h-32" />
              <div>
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <div className="flex mt-5 gap-3">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="mt-8">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg">
        <Skeleton className="h-full w-full rounded-2xl" />
      </div>
    </div>
  )
}

export default ProfileSkeleton 