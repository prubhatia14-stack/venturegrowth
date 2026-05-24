export function SuccessStamp() {
  return (
    <div className="paper-card relative mx-auto max-w-xl px-8 py-12 text-center paper-rise">
      <div className="absolute -top-4 right-8">
        <span className="stamp text-lg font-bold">Received</span>
      </div>
      <h2 className="font-display text-3xl text-foreground">Application received.</h2>
      <p className="mt-4 text-lg text-muted-foreground">
        The <span className="highlight-text font-semibold">Regional Manager</span> will review it soon.
      </p>
      <p className="font-hand mt-2 text-2xl text-foreground/70">Probably.</p>
      <p className="mt-8 text-sm text-muted-foreground">
        Memo posted to the bulletin board. We'll be in touch.
      </p>
    </div>
  );
}
