
// Matching Function:
export const match = (param: string) => {
  return param.startsWith('0x') && param.length === 42;
}