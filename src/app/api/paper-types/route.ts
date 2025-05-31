import { NextResponse } from "next/server";
import { createClient } from "../../../../supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  try {
    const supabase = await createClient();
    
    if (type) {
      const { data, error } = await supabase
        .from('paper_types')
        .select('gsm')
        .eq('name', type)
        .single();
        
      if (error || !data) {
        return NextResponse.json({ gsm: '' });
      }
      
      return NextResponse.json({ gsm: data.gsm.toString() });
    } else {
      const { data, error } = await supabase
        .from('paper_types')
        .select('*')
        .order('name');
        
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      
      return NextResponse.json(data);
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    if (!body.name || !body.gsm) {
      return NextResponse.json({ error: "Name and GSM are required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("paper_types")
      .insert({ 
        name: body.name.trim(),
        gsm: parseInt(body.gsm)
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}