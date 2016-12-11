exports.string = 'var(--css-variable, 2px) var(--css-variable, var(--another-one)) var(--css-variable)';

exports.object = [
  { type: 'variable', value: 'var(--css-variable, 2px)' },
  { type: 'variable', value: 'var(--css-variable, var(--another-one))' },
  { type: 'variable', value: 'var(--css-variable)' },
];
