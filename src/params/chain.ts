
// Matching Function:
export const match = (param: string) => {
  const chains = ['eth', 'poly', 'avax', 'op'];
  return chains.includes(param);
}