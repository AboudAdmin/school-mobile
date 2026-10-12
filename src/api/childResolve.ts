/** Pure: the stored child if the parent still has it, else the first child (a stale stored id falls back). */
export const resolveActiveChild = <T extends { id: number }>(children: T[], storedId: number | null): T | null => children.find((c) => c.id === storedId) ?? children[0] ?? null;
