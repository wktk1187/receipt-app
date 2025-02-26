import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Dify APIにファイルをアップロード
    const difyFormData = new FormData();
    difyFormData.append('file', file);
    // オプションのユーザーIDを追加（必要に応じて）
    difyFormData.append('user', 'default-user');

    console.log('Uploading file to Dify:', {
      filename: file.name,
      size: file.size,
      type: file.type
    });

    const difyResponse = await fetch(process.env.NEXT_PUBLIC_DIFY_FILE_UPLOAD_ENDPOINT || 'https://api.dify.ai/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DIFY_API_KEY}`,
      },
      body: difyFormData,
    });

    if (!difyResponse.ok) {
      const errorData = await difyResponse.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('Dify API error:', {
        status: difyResponse.status,
        statusText: difyResponse.statusText,
        error: errorData,
        headers: Object.fromEntries(difyResponse.headers.entries())
      });
      return NextResponse.json(
        {
          error: 'DIFY_CONNECTION_ERROR',
          message: errorData.message || `Dify API returned status: ${difyResponse.status}`,
          details: {
            status: difyResponse.status,
            endpoint: process.env.NEXT_PUBLIC_DIFY_FILE_UPLOAD_ENDPOINT
          }
        },
        { status: difyResponse.status }
      );
    }

    const data = await difyResponse.json();
    console.log('Dify upload success:', data);

    // Difyのレスポンス形式に合わせて返却
    return NextResponse.json({
      file_id: data.id,  // IDをfile_idとして返す
      name: data.name,
      size: data.size,
      mime_type: data.mime_type,
      created_at: data.created_at
    });

  } catch (error) {
    console.error('Dify upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
