export function getMapboxToken(): string | undefined {
  // Read at runtime to support test overrides
  return (
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    // Backward-compat with older docs/examples
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.MAPBOX_API_KEY
  );
}
