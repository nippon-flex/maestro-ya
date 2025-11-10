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

    // Validar que las variables de entorno existan
    if (!process.env.R2_ACCOUNT_ID) {
      console.error('❌ R2_ACCOUNT_ID no está definido');
      return NextResponse.json({ error: 'R2_ACCOUNT_ID no configurado' }, { status: 500 });
    }
    if (!process.env.R2_ACCESS_KEY_ID) {
      console.error('❌ R2_ACCESS_KEY_ID no está definido');
      return NextResponse.json({ error: 'R2_ACCESS_KEY_ID no configurado' }, { status: 500 });
    }
    if (!process.env.R2_SECRET_ACCESS_KEY) {
      console.error('❌ R2_SECRET_ACCESS_KEY no está definido');
      return NextResponse.json({ error: 'R2_SECRET_ACCESS_KEY no configurado' }, { status: 500 });
    }
    if (!process.env.R2_BUCKET_NAME) {
      console.error('❌ R2_BUCKET_NAME no está definido');
      return NextResponse.json({ error: 'R2_BUCKET_NAME no configurado' }, { status: 500 });
    }
    if (!process.env.R2_PUBLIC_URL) {
      console.error('❌ R2_PUBLIC_URL no está definido');
      return NextResponse.json({ error: 'R2_PUBLIC_URL no configurado' }, { status: 500 });
    }

    console.log('✅ Todas las variables R2 están definidas');

    const { uploadUrl, key, fileUrl } = await getUploadUrl(fileName, fileType);

    console.log('✅ URL generada exitosamente:', key);

    return NextResponse.json({ 
      uploadUrl, 
      key, 
      publicUrl: fileUrl
    });
  } catch (error) {
    console.error('❌ Error generando URL de subida:', error);
    return NextResponse.json(
      { error: `Error interno: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}