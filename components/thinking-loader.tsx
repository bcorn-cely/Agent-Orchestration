"use client"

export function ThinkingLoader() {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "0ms", animationDuration: "1000ms" }}
        />
        <span
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "150ms", animationDuration: "1000ms" }}
        />
        <span
          className="w-2 h-2 bg-primary rounded-full animate-bounce"
          style={{ animationDelay: "300ms", animationDuration: "1000ms" }}
        />
      </div>
      <span className="text-xs text-muted-foreground ml-1">Thinking...</span>
    </div>
  )
}
