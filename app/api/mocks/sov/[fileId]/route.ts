
export async function GET(_: Request, { params }: { params: { fileId: string } }) {
  const rows = 12; // pretend we parsed a small SoV
  return Response.json({ fileId: params.fileId, rows, tIv: 12_500_000 });
}
