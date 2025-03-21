import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== ファイルアップロード開始 ===');
  
  try {
    // フォームデータの解析
    let formData;
    try {
      formData = await request.formData();
      console.log('Form data received');
    } catch (e) {
      console.error('Failed to parse form data:', e);
      return NextResponse.json({
        status: 'failed',
        error: 'Invalid form data',
        code: 'INVALID_FORM_DATA'
      }, { status: 400 });
    }
    
    // ファイルの検証
    const file = formData.get('file');
    if (!file) {
      console.error('No file in form data');
      return NextResponse.json({
        status: 'failed',
        error: 'No file provided',
        code: 'NO_FILE'
      }, { status: 400 });
    }
    
    // ファイル情報のログ出力
    if (file instanceof File) {
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024).toFixed(2)} KB`
      });
    }

    // Dify APIへのアップロード準備
    const difyFormData = new FormData();
    difyFormData.append('file', file);
    difyFormData.append('user', 'default-user');
    
    const uploadEndpoint = process.env.NEXT_PUBLIC_DIFY_FILE_UPLOAD_ENDPOINT || 'https://api.dify.ai/v1/files/upload';
    const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY || 'app-SnVwOwGNGtuIih9bIV5tldhx';
    
    console.log('Uploading file to Dify API:', uploadEndpoint);

    // Dify APIへのアップロード
    let response;
    try {
      response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: difyFormData
      });
    } catch (e) {
      console.error('Failed to connect to Dify API:', e);
      return NextResponse.json({
        status: 'failed',
        error: 'Failed to connect to Dify API',
        code: 'CONNECTION_ERROR'
      }, { status: 500 });
    }
    
    // レスポンスの解析
    let responseText;
    try {
      responseText = await response.text();
      console.log('Dify API upload response:', responseText);
    } catch (e) {
      console.error('Failed to read response text:', e);
      return NextResponse.json({
        status: 'failed',
        error: 'Failed to read response from Dify API',
        code: 'RESPONSE_READ_ERROR'
      }, { status: 500 });
    }
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      return NextResponse.json({
        status: 'failed',
        error: 'Invalid JSON response from Dify API',
        code: 'INVALID_RESPONSE',
        details: { responseText }
      }, { status: 500 });
    }
    
    // エラーレスポンスの処理
    if (!response.ok) {
      console.error('Dify API upload error:', {
        status: response.status,
        data
      });
      return NextResponse.json({
        status: 'failed',
        error: data.message || 'File upload failed',
        code: 'UPLOAD_ERROR',
        details: data
      }, { status: response.status });
    }
    
    console.log('File uploaded successfully:', data);
    console.log('=== ファイルアップロード完了 ===');
    
    // 成功レスポンスの返却
    return NextResponse.json({
      status: 'succeeded',
      ...data
    });
  } catch (error) {
    console.error('=== ファイルアップロードエラー ===', error);
    return NextResponse.json({
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}
