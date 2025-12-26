import recapData from '../../data/analysis/recap2025.json';

interface TextLine {
  text: string;
  fontSize: number;
  fontWeight: number;
  y: number;
  lineWidth?: number;
  letterSpacing?: string;
}

interface SimulationConfig {
  type: 'text' | 'image';
  color: string;
  lines?: TextLine[];
  imageSrc?: string;
}

function buildSimulationUrl(config: SimulationConfig): string {
  const encoded = btoa(JSON.stringify(config));
  return `/slide4/index.html?config=${encoded}`;
}

function formatDate(dateStr: string): string {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const date = new Date(dateStr + 'T00:00:00');
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

function getDayOfWeek(dateStr: string): string {
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
}

const mostProductive = recapData.interestingFacts.mostContributionsInOneDay;
const laziest = recapData.interestingFacts.leastContributedDay;

export default function Slide6({ color }: { color: string }) {
  const mostProductiveConfig: SimulationConfig = {
    type: 'text',
    color,
    lines: [
      { text: getDayOfWeek(mostProductive.date), fontSize: 120, fontWeight: 100, y: 0.35, letterSpacing: '10px', lineWidth: 20 },
      { text: String(mostProductive.contributions), fontSize: 380, fontWeight: 300, y: 0.65, lineWidth: 30 },
    ],
  };

  const laziestConfig: SimulationConfig = {
    type: 'text',
    color,
    lines: [
      { text: getDayOfWeek(laziest.date), fontSize: 120, fontWeight: 100, y: 0.35, letterSpacing: '10px', lineWidth: 20 },
      { text: String(laziest.contributions), fontSize: 380, fontWeight: 300, y: 0.65, lineWidth: 30 },
    ],
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full gap-6 px-4 py-8 overflow-y-auto md:gap-8">
      <div className="flex flex-col items-center justify-center w-full gap-6 xl:flex-row md:gap-8">
        {/* Most Productive Day */}
        <div className="flex flex-col items-center gap-2 md:gap-3">
          <h2
            className="font-bold tracking-wide sm:text-sm md:text-2xl font-orbitron opacity-80"
            style={{ color }}
          >
            MOST PRODUCTIVE DAY
          </h2>
          <span
            className="font-bold tracking-widest sm:text-sm md:text-2xl font-orbitron"
            style={{ color }}
          >
            {formatDate(mostProductive.date)}
          </span>
          <iframe
            src={buildSimulationUrl(mostProductiveConfig)}
            className="w-[min(280px,80vw)] aspect-square md:w-[350px] lg:w-[400px]"
            style={{
              border: `4px solid ${color}`,
              boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40, inset 0 0 20px ${color}20`,
            }}
          />
        </div>

        {/* Laziest Day */}
        <div className="flex flex-col items-center gap-2 md:gap-3">
          <h2
            className="font-bold tracking-wide sm:text-sm md:text-2xl font-orbitron opacity-80"
            style={{ color }}
          >
            LAZIEST DAY
          </h2>
          <span
            className="font-bold tracking-widest sm:text-sm md:text-2xl font-orbitron"
            style={{ color }}
          >
            {formatDate(laziest.date)}
          </span>
          <iframe
            src={buildSimulationUrl(laziestConfig)}
            className="w-[min(280px,80vw)] aspect-square md:w-[350px] lg:w-[400px]"
            style={{
              border: `4px solid ${color}`,
              boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40, inset 0 0 20px ${color}20`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
