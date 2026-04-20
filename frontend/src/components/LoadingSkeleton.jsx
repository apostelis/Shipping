export function SkeletonCard() {
  return (
    <div className="bg-white border border-stripe-border rounded-stripe p-6 animate-pulse">
      <div className="h-3 w-24 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
      <div className="h-2 w-20 bg-gray-100 rounded"></div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="bg-white border border-stripe-border rounded-stripe p-6 animate-pulse">
      <div className="h-[400px] bg-gray-100 rounded flex items-end justify-around px-4 pb-4 gap-2">
        {[40, 55, 35, 65, 50, 70, 45, 60, 75, 55, 80, 65].map((h, i) => (
          <div key={i} className="bg-gray-200 rounded-t flex-1" style={{ height: `${h}%` }}></div>
        ))}
      </div>
    </div>
  )
}
