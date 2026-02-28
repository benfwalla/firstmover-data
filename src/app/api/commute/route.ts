import { NextRequest } from 'next/server';
import commuteData from '@/data/commute-data.json';
import subwayLines from '@/data/neighborhood-subway-lines.json';

const HUB_LABELS: Record<string, string> = {
  timesSquare: 'Times Square / Midtown West',
  grandCentral: 'Grand Central / Midtown',
  midtownEast: 'Midtown East',
  penn: 'Penn Station / MSG',
  hudsonYards: 'Hudson Yards',
  fidi: 'Financial District',
  unionSquare: 'Union Square / Flatiron',
  barclays: 'Downtown Brooklyn / Barclays',
  nyu: 'NYU / West Village',
  columbiaCampus: 'Columbia / Morningside Heights',
};

const HUB_KEYS = Object.keys(HUB_LABELS);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const neighborhood = searchParams.get('neighborhood');

  if (neighborhood) {
    const commute = (commuteData as any)[neighborhood];
    if (!commute) return Response.json({ error: 'Not found' }, { status: 404 });
    const lines = (subwayLines as any)[neighborhood] || [];
    return Response.json({ neighborhood, lines, commute });
  }

  const summary = Object.entries(commuteData as any).map(([name, data]: [string, any]) => {
    const lines = (subwayLines as any)[name] || [];
    const times: Record<string, number | null> = {};
    for (const hub of HUB_KEYS) times[hub] = data[hub] ?? null;
    const hasData = HUB_KEYS.some(h => data[h] != null);
    return { name, lines, ...times, hasData };
  }).sort((a, b) => a.name.localeCompare(b.name));

  const withData = summary.filter(s => s.hasData).length;

  return Response.json({
    total: summary.length,
    withCommuteData: withData,
    withoutCommuteData: summary.length - withData,
    hubs: HUB_LABELS,
    neighborhoods: summary,
  });
}
