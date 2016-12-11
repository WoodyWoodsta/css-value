exports.string = 'calc(1px + 2px) calc(10px + var(--css-var))';

exports.object = [
  { type: 'calc', value: 'calc(1px + 2px)' },
  { type: 'calc', value: 'calc(10px + var(--css-var))' },
];
