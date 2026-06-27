const fs = require('fs');

const targetFile = 'src/components/overview-client.tsx';
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Update background of main canvas
content = content.replace(
  /<div className="min-h-screen bg-\[\#FDFDFD\] p-4 lg:p-8 lg:pt-0 font-sans selection:bg-zinc-200">/,
  '<div className="min-h-screen bg-neutral-50/60 p-4 lg:p-8 lg:pt-0 font-sans selection:bg-zinc-200">'
);

// 2. Format Currency with decimal muting
content = content.replace(
  /const formatCurrency = \(amount: number\) => `₵ \$\{amount.toLocaleString\(\)\}`/,
  `const formatCurrency = (amount: number) => {
  const parts = amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).split(".");
  return (
    <>
      ₵{parts[0]}<span className="text-sm opacity-60 font-normal">.{parts[1]}</span>
    </>
  );
}`
);

// 3. Focal Card 1: Revenue
content = content.replace(
  /<Card className="rounded-lg border-transparent border shadow-none bg-white border-zinc-200\/50">([\s\S]*?)<span className="text-sm font-medium text-foreground">Total Revenue<\/span>([\s\S]*?)<HugeiconsIcon icon=\{Wallet02Icon\} strokeWidth=\{1\} className="size-10 text-zinc-400" \/>([\s\S]*?)<span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">([\s\S]*?)<span className="mr-1\.5 flex items-center font-medium text-emerald-600">([\s\S]*?)since last month/m,
  `<Card className="rounded-xl border-0 shadow-[0_1px_2px_rgba(0,0,0,0.01)] bg-zinc-950 text-white">$1<span className="text-sm font-medium text-zinc-400">Total Revenue</span>$2<HugeiconsIcon icon={Wallet02Icon} strokeWidth={1.5} className="size-8 text-zinc-500" />$3<span className="text-3xl font-bold tracking-tight font-tabular-nums text-white">$4<span className="mr-1.5 flex items-center font-medium text-emerald-500">$5vs last month`
);

// 4. Update all other cards to use rounded-xl and drop borders
content = content.replace(
  /className="rounded-lg shadow-none bg-white border border-zinc-200\/50"/g,
  'className="rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.01)] bg-white border-0"'
);
content = content.replace(
  /className="flex flex-col h-full rounded-lg shadow-none bg-white border border-zinc-200\/50"/g,
  'className="flex flex-col h-full rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.01)] bg-white border-0"'
);

// 5. Focal Card 2: Smart Locks (Hardware)
content = content.replace(
  /<Card className="rounded-xl shadow-\[0_1px_2px_rgba\(0,0,0,0\.01\)\] bg-white border-0">\s*<div className="flex flex-col p-5">\s*<div className="flex items-center justify-between">\s*<span className="text-sm font-medium text-foreground">Hardware<\/span>\s*<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border\/60 text-muted-foreground">\s*<HugeiconsIcon icon=\{SmartPhone01Icon\} strokeWidth=\{2\} className="size-4" \/>\s*<\/div>\s*<\/div>\s*<div className="mt-3 flex flex-col">\s*<span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">\s*\{metrics\.onlineLocks\} <span className="text-lg font-semibold text-muted-foreground">\/ \{metrics\.totalLocks\}<\/span>\s*<\/span>\s*<div className="mt-1 flex items-center text-\[11px\] font-medium text-muted-foreground">\s*Locks online/m,
  `<Card className="rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.01)] bg-zinc-950 text-white border-0">
                  <div className="flex flex-col p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-400">Hardware</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-zinc-400 border-0">
                        <HugeiconsIcon icon={SmartPhone01Icon} strokeWidth={2} className="size-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col">
                      <span className="text-3xl font-bold tracking-tight text-white font-tabular-nums">
                        {metrics.onlineLocks} <span className="text-lg font-medium text-zinc-600">/ {metrics.totalLocks}</span>
                      </span>
                      <div className="mt-1 flex items-center text-[11px] font-medium text-emerald-500">
                        Systems Online`
);

// 6. Update Table containers
content = content.replace(
  /className="overflow-hidden rounded-lg border border-border\/60 bg-white flex-1 shadow-sm"/g,
  'className="overflow-hidden rounded-xl border-0 bg-white flex-1 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"'
);
content = content.replace(
  /className="h-full overflow-hidden rounded-lg border border-border\/60 bg-white shadow-sm"/g,
  'className="h-full overflow-hidden rounded-xl border-0 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)]"'
);
content = content.replace(
  /className="h-full flex flex-col overflow-hidden rounded-lg border border-border\/60 bg-white shadow-sm"/g,
  'className="h-full flex flex-col overflow-hidden rounded-xl border-0 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)]"'
);
content = content.replace(
  /className="overflow-hidden rounded-lg lg:col-span-12 border border-border\/60 bg-white shadow-sm lg:col-span-2"/g,
  'className="overflow-hidden rounded-xl lg:col-span-12 border-0 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.01)] lg:col-span-2"'
);

// 7. Strip dark borders and normalize to pure white background and monochrome colors where needed.
content = content.replace(/border-b border-border\/40/g, 'border-b border-zinc-100/50');
content = content.replace(/text-foreground/g, 'text-zinc-900');
content = content.replace(/text-muted-foreground/g, 'text-zinc-500');
content = content.replace(/bg-muted\/30/g, 'bg-zinc-50/50');
content = content.replace(/var\(--border\)/g, '#e4e4e7'); // zinc-200
content = content.replace(/var\(--muted-foreground\)/g, '#71717a'); // zinc-500
content = content.replace(/var\(--foreground\)/g, '#18181b'); // zinc-900

// 8. Clean up micro copy for High Data-to-Ink ratio
content = content.replace(/Occupied Units/g, "Occupancy");
content = content.replace(/Pending Verifications/g, "Pending Funds");
content = content.replace(/Outstanding Rentals/g, "Rent Arrears");
content = content.replace(/Tenant Feedback & Reviews/g, "Tenant Feedback");
content = content.replace(/Recently Published/g, "Recent Listings");
content = content.replace(/Sales dynamics/g, "Sales Dynamics");
content = content.replace(/Across active tenancies/g, "Total arrears");

// 9. Ensure tight tracking and tabular nums everywhere
content = content.replace(/text-2xl/g, "text-3xl"); // Bump major display numbers size
// Ensure totalAssets is 3xl in Donut chart
content = content.replace(/text-3xl font-bold font-tabular-nums/g, "text-4xl font-bold font-tabular-nums");

fs.writeFileSync(targetFile, content);
console.log("Refactoring complete");
