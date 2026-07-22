export const TEX_MACROS: Record<string, string | [string, number]> = {
  dd: '{\\mathrm{d}}',
  ii: '{\\mathrm{i}}',
  ee: '{\\mathrm{e}}',
  Tr: '{\\operatorname{Tr}}',
  bra: ['\\left\\langle #1 \\right|', 1],
  ket: ['\\left| #1 \\right\\rangle', 1],
  braket: ['\\left\\langle #1 \\middle| #2 \\right\\rangle', 2],
  expect: ['\\left\\langle #1 \\right\\rangle', 1],
  comm: ['\\left[ #1, #2 \\right]', 2],
  anticom: ['\\left\\{ #1, #2 \\right\\}', 2],
};
