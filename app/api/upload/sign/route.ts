import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getUploadUrl } from '@/lib/r2';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'fileName y fileType son requeridos' },
        { status: 400 }
      );
    }

    const { uploadUrl, key, fileUrl } = await getUploadUrl(fileName, fileType);

    return NextResponse.json({ uploadUrl, key, fileUrl });
  } catch (error) {
    console.error('Error generando URL de subida:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}