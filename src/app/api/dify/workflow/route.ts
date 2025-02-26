import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 環境変数のチェック
    const requiredEnvVars = {
      'NEXT_PUBLIC_DIFY_API_KEY': process.env.NEXT_PUBLIC_DIFY_API_KEY,
      'NEXT_PUBLIC_DIFY_WORKFLOW_ID': process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ID,
      'NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT': process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT
    };

    const missingEnvVars = Object.entries(requiredEnvVars)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      console.error('Missing required environment variables:', missingEnvVars);
      return NextResponse.json({
        error: 'DIFY_CONFIGURATION_ERROR',
        message: `Missing required environment variables: ${missingEnvVars.join(', ')}`,
      }, { status: 500 });
    }

    const body = await request.json();
    console.log('Received raw request body:', body);

    const fileId = body.fileId;
    if (!fileId) {
      console.error('No file ID in request body:', body);
      return NextResponse.json({ error: 'No file ID provided' }, { status: 400 });
    }

    console.log('Extracted file ID:', fileId);
    console.log('Environment configuration:', {
      workflowId: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ID,
      endpoint: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT,
      hasApiKey: !!process.env.NEXT_PUBLIC_DIFY_API_KEY
    });

    const workflowId = process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ID || '';
    if (!workflowId) {
      console.error('ワークフローIDが設定されていません');
      return NextResponse.json({ 
        error: 'DIFY_CONFIGURATION_ERROR',
        message: 'ワークフローIDが設定されていません',
        details: {
          workflowId: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ID,
          endpoint: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT
        }
      }, { status: 500 });
    }

    const endpoint = process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT;
    if (!endpoint) {
      console.error('ワークフローエンドポイントが設定されていません');
      return NextResponse.json({ 
        error: 'DIFY_CONFIGURATION_ERROR',
        message: 'ワークフローエンドポイントが設定されていません'
      }, { status: 500 });
    }
    
    console.log('Using workflow ID:', workflowId);
    
    // ユーザーから提供された新しいリクエスト形式
    const requestBody = {
      workflow_id: workflowId,  // workflow_idを追加
      inputs: {
        image: [{  // imageをリストとして送信
          upload_file_id: fileId,
          transfer_method: "local_file",
          type: "image"
        }]
      },
      response_mode: "blocking",
      user: "abc-456"
    };
    
    console.log('Sending request to Dify API:', {
      endpoint,
      body: requestBody
    });
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer app-SnVwOwGNGtuIih9bIV5tldhx',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Dify API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Dify API Raw Response:', responseText);
    
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed response data:', responseData);
    } catch (e) {
      console.error('Failed to parse Dify API response:', {
        text: responseText,
        error: e instanceof Error ? e.message : 'Unknown error'
      });
      throw new Error('Invalid JSON response from Dify API');
    }

    if (!response.ok) {
      console.error('Dify API Error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        error: responseData,
        requestBody: requestBody
      });
      return NextResponse.json(
        { 
          error: 'DIFY_API_ERROR',
          message: `Dify API error: ${response.status} ${response.statusText}`,
          details: responseData
        },
        { status: response.status }
      );
    }

    console.log('Dify API Success Response:', responseData);

    // run_idを抽出して返す（複数の可能性のあるフィールドをチェック）
    const runId = responseData.workflow_run_id || // 新しいレスポンス形式
                 responseData.data?.id ||        // データ内のID
                 responseData.id;               // 直接のID
    
    if (!runId) {
      console.error('No run ID in Dify response:', responseData);
      return NextResponse.json(
        { 
          error: 'INVALID_RESPONSE', 
          message: 'No run ID in Dify response', 
          details: responseData 
        },
        { status: 500 }
      );
    }

    // 成功レスポンスにデータも含める
    return NextResponse.json({ 
      run_id: runId,
      outputs: responseData.data?.outputs || {},
      status: responseData.data?.status || 'unknown'
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'INTERNAL_SERVER_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const runId = searchParams.get('runId');

    if (!runId) {
      return NextResponse.json({ error: 'No run ID provided' }, { status: 400 });
    }

    // ワークフローステータスエンドポイントを構築
    let endpoint = '';
    if (process.env.NEXT_PUBLIC_DIFY_WORKFLOW_STATUS_ENDPOINT) {
      endpoint = process.env.NEXT_PUBLIC_DIFY_WORKFLOW_STATUS_ENDPOINT.replace(':workflow_id', runId);
    } else {
      endpoint = `https://api.dify.ai/v1/workflows/run/${runId}`;
    }
    
    console.log('Checking workflow status at:', endpoint);
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': 'Bearer app-SnVwOwGNGtuIih9bIV5tldhx',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
      console.error('Dify workflow status API error:', errorData);
      return NextResponse.json(
        {
          error: 'DIFY_CONNECTION_ERROR',
          message: errorData.message || `Dify API returned status: ${response.status}`,
          details: {
            status: response.status,
            endpoint: endpoint,
            runId: runId
          }
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      run_id: data.id,
      status: data.status,
      output: data.answer || data.output
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Status check failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
