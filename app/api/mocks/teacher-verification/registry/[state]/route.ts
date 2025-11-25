/**
 * Mock Teacher Registry API
 * 
 * Returns mock teacher registry data for state-specific lookups.
 */

export async function POST(
  req: Request,
  { params }: { params: { state: string } }
) {
  const { memberId, memberName, dateOfBirth } = await req.json();
  const state = params.state;
  
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Mock registry data
  const mockRegistry: Record<string, any> = {
    '12345': {
      found: true,
      name: 'John Doe',
      dateOfBirth: '1985-05-15',
      employmentStatus: 'active',
      school: 'Lincoln High School',
      district: 'Springfield School District',
      licenseNumber: 'CA-TEACH-12345',
      licenseExpiry: '2026-12-31',
    },
    '67890': {
      found: true,
      name: 'Jane Smith',
      dateOfBirth: '1990-08-22',
      employmentStatus: 'active',
      school: 'Washington Elementary',
      district: 'Riverside School District',
      licenseNumber: 'CA-TEACH-67890',
      licenseExpiry: '2027-06-30',
    },
  };
  
  // Try to find by memberId first
  if (memberId && mockRegistry[memberId]) {
    return Response.json(mockRegistry[memberId]);
  }
  
  // Try to find by name + DOB
  if (memberName && dateOfBirth) {
    const nameLower = memberName.toLowerCase();
    for (const [id, data] of Object.entries(mockRegistry)) {
      if (data.name.toLowerCase() === nameLower && data.dateOfBirth === dateOfBirth) {
        return Response.json(data);
      }
    }
  }
  
  // Default: not found
  return Response.json({
    found: false,
    name: memberName || null,
    dateOfBirth: dateOfBirth || null,
    employmentStatus: 'unknown',
  });
}

