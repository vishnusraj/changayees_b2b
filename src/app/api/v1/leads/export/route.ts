import { NextResponse, type NextRequest } from 'next/server';
import { withApi } from '@/lib/api/route';
import { authorize } from '@/lib/api/guards';
import { getLeadsForExport } from '@/features/leads/lead.service';
import { LeadStatus, LeadSource } from '@/generated/prisma';

export const dynamic = 'force-dynamic';

function csvCell(value: string | null): string {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

/** GET /api/v1/leads/export — CSV export of (filtered) leads. */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'leads.export');
  const sp = new URL(req.url).searchParams;
  const statusParam = sp.get('status');
  const sourceParam = sp.get('source');

  const leads = await getLeadsForExport({
    status:
      statusParam && statusParam in LeadStatus
        ? (statusParam as LeadStatus)
        : undefined,
    source:
      sourceParam && sourceParam in LeadSource
        ? (sourceParam as LeadSource)
        : undefined,
    search: sp.get('search') ?? undefined,
  });

  const header = [
    'Lead #',
    'Name',
    'Phone',
    'Email',
    'Organization',
    'Source',
    'Status',
    'Assignee',
    'Created',
  ];
  const rows = leads.map((l) =>
    [
      l.leadNumber,
      l.name,
      l.phone,
      l.email,
      l.organization,
      l.source,
      l.status,
      l.assignee?.name ?? '',
      l.createdAt.toISOString(),
    ].map(csvCell).join(','),
  );
  const csv = [header.map(csvCell).join(','), ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="leads.csv"',
    },
  });
});
