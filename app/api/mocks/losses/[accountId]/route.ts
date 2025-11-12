
export async function GET(_: Request, { params }: { params: { accountId: string } }) {
  const { accountId } = await params;
  return Response.json({
    accountId,
    years: [
      { year: 2021, freq: 2, severity: 35000 },
      { year: 2022, freq: 1, severity: 12000 },
      { year: 2023, freq: 0, severity: 0 }
    ]
  });
}
