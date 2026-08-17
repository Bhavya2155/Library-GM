const https = require('https');

https.get('https://library-gm.vercel.app/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const jsFiles = data.match(/assets\/index-[^.]+\.js/g);
    if (jsFiles) {
      console.log('Found JS files:', jsFiles);
      https.get('https://library-gm.vercel.app/' + jsFiles[0], (jsRes) => {
        let jsData = '';
        jsRes.on('data', (chunk) => jsData += chunk);
        jsRes.on('end', () => {
          console.log('Contains Coordinator Library Dashboard?', jsData.includes('Coordinator Library Dashboard'));
          console.log('Contains "coordinator"?', jsData.includes('"coordinator"'));
          console.log('Contains "Admin" as string?', jsData.includes('"Admin"'));
        });
      });
    } else {
      console.log('No JS files found');
    }
  });
});
