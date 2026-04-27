export function Toast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-7 right-7 bg-blue-dark text-primary-foreground rounded-lg px-5 py-3.5 flex items-center gap-2.5 text-sm font-bold shadow-lg z-[999] animate-[fade-up_0.3s_ease]">
      {message}
    </div>
  );
}
