const fs = require('fs');

function format(file) {
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('formatName')) {
    code = code.replace(`import { toast } from 'react-hot-toast';`, `import { toast } from 'react-hot-toast';\nimport { formatName } from '../utils/nameFormatter';`);
    code = code.replace(`import { useAuth } from '../context/AuthContext';`, `import { useAuth } from '../context/AuthContext';\nimport { formatName } from '../utils/nameFormatter';`);
  }

  code = code.replace(/r\.studentId\?\.name/g, 'formatName(r.studentId?.name)');
  code = code.replace(/r\.guestId\?\.name/g, 'formatName(r.guestId?.name)');
  code = code.replace(/a\.studentId\?\.name/g, 'formatName(a.studentId?.name)');
  code = code.replace(/a\.guestId\?\.name/g, 'formatName(a.guestId?.name)');
  code = code.replace(/b\.studentId\?\.name/g, 'formatName(b.studentId?.name)');
  code = code.replace(/b\.guestId\?\.name/g, 'formatName(b.guestId?.name)');

  code = code.replace(/r\.studentId \? r\.studentId\.name : r\.guestId\?\.name/g, 'r.studentId ? formatName(r.studentId.name) : formatName(r.guestId?.name)');
  code = code.replace(/record\.studentId \? record\.studentId\.name : record\.guestId\?\.name/g, 'record.studentId ? formatName(record.studentId.name) : formatName(record.guestId?.name)');

  code = code.replace(/s\.name/g, 'formatName(s.name)');
  code = code.replace(/g\.name/g, 'formatName(g.name)');
  
  // Dashboard specific
  code = code.replace(/item\.student\?\.name/g, 'formatName(item.student?.name)');
  code = code.replace(/item\.guest\?\.name/g, 'formatName(item.guest?.name)');

  code = code.replace(/formatName\(formatName\(/g, 'formatName(').replace(/\)\)/g, ')');
  
  fs.writeFileSync(file, code);
}

format('frontend/src/pages/Circulation.tsx');
format('frontend/src/pages/Dashboard.tsx');
