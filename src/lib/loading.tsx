export default function Loading() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}
