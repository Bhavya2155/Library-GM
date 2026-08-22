import fs from 'fs';

const path = 'd:/mern-library/frontend/src/components/Sidebar.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `role === 'admin' || role === 'coordinator' ? 'Coordinator Library Dashboard' : role === 'leader' ? 'Leader Library Dashboard' : 'Student Library Dashboard'`,
  `role === 'admin' || role === 'coordinator' || role === 'senior_leader' ? 'Coordinator Library Dashboard' : role === 'leader' ? 'Leader Library Dashboard' : 'Student Library Dashboard'`
);

content = content.replace(
  `{(role === 'admin' || role === 'coordinator' || role === 'leader') && (`,
  `{(role === 'admin' || role === 'coordinator' || role === 'senior_leader' || role === 'leader') && (`
);

content = content.replace(
  `{(role === 'admin' || role === 'coordinator') && (`,
  `{(role === 'admin' || role === 'coordinator' || role === 'senior_leader') && (`
);

content = content.replace(
  `newStaffRole === 'admin' ? 'Boss' : newStaffRole`,
  `newStaffRole === 'admin' ? 'Boss' : newStaffRole.replace('_', ' ')`
);

const roleOption = `                            <div 
                              className={\`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center \${newStaffRole === 'student' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}\`}
                              onMouseDown={(e) => { e.preventDefault(); setNewStaffRole('student'); setShowRoleDropdown(false); }}
                            >
                              Student
                            </div>`;

const newRoleOption = `                            <div 
                              className={\`px-3 py-2.5 text-sm cursor-pointer transition-colors flex items-center \${newStaffRole === 'senior_leader' ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}\`}
                              onMouseDown={(e) => { e.preventDefault(); setNewStaffRole('senior_leader'); setShowRoleDropdown(false); }}
                            >
                              Senior Leader
                            </div>\n` + roleOption;

content = content.replace(roleOption, newRoleOption);

content = content.replace(
  `staff.role === 'leader' ? 'bg-purple-100 text-purple-700' :`,
  `staff.role === 'leader' ? 'bg-purple-100 text-purple-700' :\n                              staff.role === 'senior_leader' ? 'bg-fuchsia-100 text-fuchsia-700' :`
);

content = content.replace(
  `staff.role === 'admin' ? 'super account' : staff.role || 'student'`,
  `staff.role === 'admin' ? 'super account' : (staff.role || 'student').replace('_', ' ')`
);

fs.writeFileSync(path, content);
console.log('Done');
