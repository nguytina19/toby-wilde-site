const store = new Map<string, string>();

let counter = 0;

export function storeAnswer(answer: string): string {
  const id = `ans_${Date.now()}_${++counter}`;
  store.set(id, answer);
  // Auto-expire after 1 hour
  setTimeout(() => store.delete(id), 60 * 60 * 1000);
  return id;
}

export function getAnswer(id: string): string | undefined {
  return store.get(id);
}
