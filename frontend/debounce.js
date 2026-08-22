import fs from 'fs';

function applyDebounce(filePath, stateName, swrUrlReplacement) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('useEffect')) {
    content = content.replace("import { useState }", "import { useState, useEffect }");
    // handle case where it's already there or on a different line
    if (!content.includes("import { useState, useEffect }")) {
      content = content.replace(/import \{.*?useState.*?\} from 'react';/, match => match.replace('useState', 'useState, useEffect'));
    }
  }

  // Add debounced state
  const stateRegex = new RegExp(`const \\[${stateName}, set${stateName.charAt(0).toUpperCase() + stateName.slice(1)}\\] = useState\\((.*?)\\);`);
  content = content.replace(stateRegex, match => {
    return `${match}\n  const [debounced${stateName.charAt(0).toUpperCase() + stateName.slice(1)}, setDebounced${stateName.charAt(0).toUpperCase() + stateName.slice(1)}] = useState($1);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced${stateName.charAt(0).toUpperCase() + stateName.slice(1)}(${stateName}), 300);\n    return () => clearTimeout(timer);\n  }, [${stateName}]);`;
  });

  // Replace usage in SWR
  content = content.replace(swrUrlReplacement.from, swrUrlReplacement.to);

  fs.writeFileSync(filePath, content);
  console.log('Updated ' + filePath);
}

applyDebounce('d:/mern-library/frontend/src/pages/Books.tsx', 'search', {
  from: '`/books?search=${search}&sortBy=${sortBy}&sortOrder=${sortOrder}&category=${filterCategory}&language=${filterLanguage}`',
  to: '`/books?search=${debouncedSearch}&sortBy=${sortBy}&sortOrder=${sortOrder}&category=${filterCategory}&language=${filterLanguage}`'
});

applyDebounce('d:/mern-library/frontend/src/pages/Students.tsx', 'searchTerm', {
  from: '`/students?search=${searchTerm}`',
  to: '`/students?search=${debouncedSearchTerm}`'
});

applyDebounce('d:/mern-library/frontend/src/pages/Guests.tsx', 'searchTerm', {
  from: '`/guests?search=${searchTerm}`',
  to: '`/guests?search=${debouncedSearchTerm}`'
});
