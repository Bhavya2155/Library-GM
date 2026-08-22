import fs from 'fs';

const path = 'd:/mern-library/frontend/src/pages/Circulation.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `{role === 'admin' && <th className="px-3 py-3 font-semibold ">Delete</th>}`,
  `{(role === 'admin' || role === 'senior_leader') && <th className="px-3 py-3 font-semibold ">Delete</th>}`
);

content = content.replace(
  `} else if (role === 'admin') {`,
  `} else if (role === 'admin' || role === 'senior_leader') {`
);

content = content.replace(
  ` : role === 'admin' ? (`,
  ` : (role === 'admin' || role === 'senior_leader') ? (`
);

content = content.replace(
  `role === 'admin' && (`,
  `(role === 'admin' || role === 'senior_leader') && (`
);

fs.writeFileSync(path, content);
console.log('Done Circulation');
