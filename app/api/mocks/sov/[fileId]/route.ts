
export async function GET(_: Request, { params }: { params: { fileId: string } }) {
  const { fileId } = await params;
  const rows = 12; // pretend we parsed a small SoV
  return Response.json({ fileId, rows, tIv: 12_500_000 });
}
