import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el usuario es admin
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden ver reclamos' }, { status: 403 });
    }

    const { id } = await params;
    const claimId = parseInt(id);

    if (isNaN(claimId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Query con SQL directo para evitar problemas de relaciones
    const result = await db.execute(sql`
      SELECT 
        wc.id,
        wc.job_id,
        wc.customer_id,
        wc.pro_id,
        wc.description,
        wc.photos_urls,
        wc.status,
        wc.admin_notes,
        wc.resolved_at,
        wc.created_at,
        wc.updated_at,
        
        -- Job info
        j.status as job_status,
        j.created_at as job_created_at,
        j.completed_at as job_completed_at,
        
        -- Customer info
        c.full_name as customer_full_name,
        c.photo_url as customer_photo_url,
        cu.email as customer_email,
        cu.phone as customer_phone,
        
        -- Pro info
        p.full_name as pro_full_name,
        p.photo_url as pro_photo_url,
        p.experience_years as pro_experience_years,
        pu.email as pro_email,
        pu.phone as pro_phone,
        
        -- Request info
        sr.title as request_title,
        sr.description as request_description,
        sc.name as category_name,
        
        -- Address info
        a.street as address_street,
        a.city as address_city,
        
        -- Quote info
        q.amount_cents as quote_amount_cents,
        q.estimated_hours as quote_estimated_hours
        
      FROM warranty_claims wc
      JOIN jobs j ON j.id = wc.job_id
      JOIN customers c ON c.id = wc.customer_id
      JOIN users cu ON cu.id = c.user_id
      JOIN pros p ON p.id = wc.pro_id
      JOIN users pu ON pu.id = p.user_id
      JOIN service_requests sr ON sr.id = j.request_id
      JOIN service_categories sc ON sc.id = sr.category_id
      JOIN addresses a ON a.id = sr.address_id
      JOIN quotes q ON q.id = j.quote_id
      WHERE wc.id = ${claimId}
      LIMIT 1
    `);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Reclamo no encontrado' }, { status: 404 });
    }

    const row = result.rows[0] as any;

    // Transformar a estructura esperada por el frontend
    const claim = {
      id: row.id,
      jobId: row.job_id,
      customerId: row.customer_id,
      proId: row.pro_id,
      description: row.description,
      photosUrls: row.photos_urls,
      status: row.status,
      adminNotes: row.admin_notes,
      resolvedAt: row.resolved_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      job: {
        id: row.job_id,
        status: row.job_status,
        createdAt: row.job_created_at,
        completedAt: row.job_completed_at,
        customer: {
          fullName: row.customer_full_name,
          photoUrl: row.customer_photo_url,
          user: {
            email: row.customer_email,
            phone: row.customer_phone,
          },
        },
        pro: {
          fullName: row.pro_full_name,
          photoUrl: row.pro_photo_url,
          experienceYears: row.pro_experience_years,
          user: {
            email: row.pro_email,
            phone: row.pro_phone,
          },
        },
        request: {
          title: row.request_title,
          description: row.request_description,
          category: {
            name: row.category_name,
          },
          address: {
            street: row.address_street,
            city: row.address_city,
          },
        },
        quote: {
          amountCents: row.quote_amount_cents,
          estimatedHours: row.quote_estimated_hours,
        },
      },
    };

    return NextResponse.json(claim);

  } catch (error) {
    console.error('Error al obtener reclamo:', error);
    return NextResponse.json(
      { error: 'Error al obtener reclamo' },
      { status: 500 }
    );
  }
}