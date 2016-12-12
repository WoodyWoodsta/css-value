exports.string = 'calc(1px + 2px) calc(10px + var(--css-var)) calc(var(--variable, var(--variable2)) + 200px / var(--testing))';

exports.object = [
  { type: 'calc', value: 'calc(1px + 2px)' },
  { type: 'calc', value: 'calc(10px + var(--css-var))' },
  { type: 'calc', value: 'calc(var(--variable, var(--variable2)) + 200px / var(--testing))' },
];
