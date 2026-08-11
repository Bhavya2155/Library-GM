const fs = require('fs');
let code = fs.readFileSync('src/pages/Books.tsx', 'utf8');

// Replace table tag
code = code.replace(/<table className="w-full text-left border-collapse whitespace-nowrap">/g, '<table className="w-full text-left border-collapse whitespace-nowrap md:table-fixed">');

// Replace th tags
code = code.replace(/<th className="p-4 font-semibold ">ISBN \/ ID<\/th>/, '<th className="p-4 font-semibold md:w-[10%]">ISBN / ID</th>');
code = code.replace(/<th className="p-4 font-semibold ">Title<\/th>/, '<th className="p-4 font-semibold md:w-[35%]">Title</th>');
code = code.replace(/<th className="p-4 font-semibold ">Author<\/th>/, '<th className="p-4 font-semibold md:w-[20%]">Author</th>');
code = code.replace(/<th className="p-4 font-semibold ">Category<\/th>/, '<th className="p-4 font-semibold md:w-[15%]">Category</th>');
code = code.replace(/<th className="p-4 font-semibold ">Availability<\/th>/, '<th className="p-4 font-semibold md:w-[10%]">Availability</th>');
code = code.replace(/<th className="p-4 font-semibold ">Actions<\/th>/, '<th className="p-4 font-semibold md:w-[10%]">Actions</th>');

fs.writeFileSync('src/pages/Books.tsx', code);
