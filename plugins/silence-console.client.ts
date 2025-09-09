export default (_nuxtApp: any) => {
  // In production we silence noisy console methods to avoid spamming the browser console.
  // Keep console.error / console.warn so real problems are still visible.
  if (process.env.NODE_ENV === 'production') {
    const noop = (..._args: any[]) => {
      /* no-op in production */
    }
    // Assigning to console methods — cast to any to satisfy TypeScript
    ;(console as any).log = noop
    ;(console as any).debug = noop
  }
}
