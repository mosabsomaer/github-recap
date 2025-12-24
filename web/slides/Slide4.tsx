import recapData from '../../data/analysis/recap2025.json';

// Format date as "SEP 10"
function formatDate(dateStr: string): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const date = new Date(dateStr + 'T00:00:00');
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

const mostProductive = recapData.interestingFacts.mostContributionsInOneDay;
const laziest = recapData.interestingFacts.leastContributedDay;

export default function Slide4({ color }: { color: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-4">
      <h1
        className="pb-20 text-2xl font-bold tracking-wider md:text-5xl font-orbitron shrink-0"
        style={{ color }}
      >
        DEVELOPER CONTRIBUTIONS
      </h1>
      <div className="flex items-center gap-3 shrink-0">
        <h2
          className="text-sm font-bold tracking-wide md:text-3xl font-orbitron opacity-80"
          style={{ color }}
        >
          MOST PRODUCTIVE DAY
        </h2>
        <span
          className="text-sm font-bold tracking-widest md:text-lg font-orbitron"
          style={{ color }}
        >
          {formatDate(mostProductive.date)}
        </span>
      </div>
      <iframe
        src="/slide4/index.html"
        className="w-full max-w-[min(100%,50vh)] max-h-[50vh]"
        style={{
          aspectRatio: '1/1',
          border: `4px solid ${color}`,
          boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40, inset 0 0 20px ${color}20`,
        }}
      />
      <div className="flex items-center gap-3 shrink-0">
        <h2
          className="text-sm font-bold tracking-wide md:text-3xl font-orbitron opacity-80"
          style={{ color }}
        >
          LAZIEST DAY
        </h2>
        <span
          className="text-sm font-bold tracking-widest md:text-lg font-orbitron"
          style={{ color }}
        >
          {formatDate(laziest.date)}
        </span>
      </div>
    </div>
  );
}
