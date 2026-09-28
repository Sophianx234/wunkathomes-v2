const fs = require('fs');
let file = fs.readFileSync('src/components/overview-client.tsx', 'utf8');

file = file.replace('<Card className=\"rounded-lg shadow-none\">', '<Card className=\"rounded-lg border-transparent border shadow-none bg-white border-zinc-200/50\">');
file = file.replace('<Card className=\"rounded-lg  bg-white \">', '<Card className=\"rounded-lg shadow-none bg-white border border-zinc-200/50\">');
file = file.replaceAll('<Card className=\"rounded-lg shadow-none bg-white \">', '<Card className=\"rounded-lg shadow-none bg-white border border-zinc-200/50\">');
file = file.replaceAll('<Card className=\"flex flex-col h-full rounded-lg shadow-none bg-white \">', '<Card className=\"flex flex-col h-full rounded-lg shadow-none bg-white border border-zinc-200/50\">');

file = file.replaceAll('className=\"overflow-hidden rounded-lg  bg-white flex-1 shadow-none\"', 'className=\"overflow-hidden rounded-lg border border-border/60 bg-white flex-1 shadow-sm\"');
file = file.replaceAll('className=\"h-full overflow-hidden rounded-lg  bg-white shadow-none\"', 'className=\"h-full overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm\"');
file = file.replaceAll('className=\"h-9 w-9 shrink-0 overflow-hidden rounded-md  bg-muted\"', 'className=\"h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted\"');
file = file.replaceAll('className=\"h-full flex flex-col overflow-hidden rounded-lg  bg-white shadow-none\"', 'className=\"h-full flex flex-col overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm\"');
file = file.replaceAll('className=\"overflow-hidden rounded-lg lg:col-span-12  bg-white shadow-none lg:col-span-2\"', 'className=\"overflow-hidden rounded-lg lg:col-span-12 border border-border/60 bg-white shadow-sm lg:col-span-2\"');
file = file.replaceAll('className=\"overflow-hidden rounded-lg lg:col-span-12  bg-white shadow-none\"', 'className=\"overflow-hidden rounded-lg lg:col-span-12 border border-border/60 bg-white shadow-sm\"');

file = file.replaceAll('className=\"size-8  shadow-none mt-0.5\"', 'className=\"size-8 border border-border/60 shadow-sm mt-0.5\"');
file = file.replaceAll('className=\"flex h-8 w-8 items-center justify-center rounded-lg  text-muted-foreground\"', 'className=\"flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground\"');

fs.writeFileSync('src/components/overview-client.tsx', file);
console.log('Restored perfectly!');
