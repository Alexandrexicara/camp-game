import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const REPORTS: Record<string, string> = {
  sites: '/sites',
  totals: '/reports/totals',
  'by-country': '/reports/by-country',
  countries: '/reports/countries',
};

export async function GET(request: NextRequest) {
  const apiKey = process.env.APPLIXIR_REPORTING_API_KEY;
  const adminToken = process.env.APPLIXIR_REPORTS_ADMIN_TOKEN;
  const suppliedToken = request.headers.get('x-admin-token');
  if (!apiKey || !adminToken) return NextResponse.json({ error: 'Relatórios AppLixir ainda não configurados no servidor.' }, { status: 503 });
  if (!suppliedToken || suppliedToken !== adminToken) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const report = request.nextUrl.searchParams.get('report') ?? 'totals';
  const endpoint = REPORTS[report];
  if (!endpoint) return NextResponse.json({ error: 'Relatório inválido.' }, { status: 400 });
  const upstreamUrl = new URL('https://api.applixir.com/api/v1' + endpoint);
  for (const [key, value] of request.nextUrl.searchParams.entries()) if (key !== 'report') upstreamUrl.searchParams.set(key, value);
  try {
    const upstream = await fetch(upstreamUrl, { method: 'GET', headers: { 'X-Api-Key': apiKey, Accept: 'application/json' }, cache: 'no-store' });
    return new NextResponse(await upstream.text(), { status: upstream.status, headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json', 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[AppLixir reports] upstream request failed:', error);
    return NextResponse.json({ error: 'Falha ao consultar relatórios AppLixir.' }, { status: 502 });
  }
}