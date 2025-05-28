import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '../../../../supabase/server';

// Helper to upload file to Supabase Storage
async function uploadFileToStorage(file: File, supabase: any) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const { data, error } = await supabase.storage
    .from('job-sheets')
    .upload(fileName, file, { contentType: file.type });
  if (error) throw error;
  // Get public URL
  const { data: publicUrlData } = supabase.storage.from('job-sheets').getPublicUrl(fileName);
  return publicUrlData.publicUrl;
}

// CREATE a new job sheet (POST)
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file');
    let fileUrl = null;
    if (file && typeof file === 'object' && 'arrayBuffer' in file) {
      fileUrl = await uploadFileToStorage(file, supabase);
    }
    // Collect other fields
    const fields = {};
    for (const [key, value] of formData.entries()) {
      if (key !== 'file') fields[key] = value;
    }
    fields.file_url = fileUrl;
    const { error, data: inserted } = await supabase
      .from('job_sheets')
      .insert([fields])
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(inserted[0], { status: 201 });
  } else {
    // fallback to JSON body (no file)
    const data = await req.json();
    const { error, data: inserted } = await supabase
      .from('job_sheets')
      .insert([data])
      .select();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(inserted[0], { status: 201 });
  }
}

// READ all job sheets (GET)
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('job_sheets')
    .select('*')
    .order('id', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 200 });
}

// UPDATE a job sheet (PUT)
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const data = await req.json();
  const { id, ...updateFields } = data;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error, data: updated } = await supabase
    .from('job_sheets')
    .update(updateFields)
    .eq('id', id)
    .select();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(updated[0], { status: 200 });
}

// DELETE a job sheet (DELETE)
export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { error } = await supabase
    .from('job_sheets')
    .delete()
    .eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true }, { status: 200 });
} 