import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('=== ワークフロー実行開始 ===');
  
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
        status: 'failed',
        error: `Missing required environment variables: ${missingEnvVars.join(', ')}`,
        code: 'DIFY_CONFIGURATION_ERROR'
      }, { status: 500 });
    }

    // リクエストボディの解析
    let body;
    try {
      body = await request.json();
      console.log('Received raw request body:', body);
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json({
        status: 'failed',
        error: 'Invalid request body',
        code: 'INVALID_REQUEST'
      }, { status: 400 });
    }

    // ファイルIDの検証
    const fileId = body.fileId;
    if (!fileId) {
      console.error('No file ID in request body:', body);
      return NextResponse.json({
        status: 'failed',
        error: 'No file ID provided',
        code: 'MISSING_FILE_ID'
      }, { status: 400 });
    }

    console.log('Extracted file ID:', fileId);
    console.log('Environment configuration:', {
      workflowId: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ID,
      endpoint: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT,
      hasApiKey: !!process.env.NEXT_PUBLIC_DIFY_API_KEY
    });

    // ワークフローIDの検証
    const workflowId = process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ID || '';
    if (!workflowId) {
      console.error('ワークフローIDが設定されていません');
      return NextResponse.json({
        status: 'failed',
        error: 'ワークフローIDが設定されていません',
        code: 'MISSING_WORKFLOW_ID',
        details: {
          workflowId: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ID,
          endpoint: process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT
        }
      }, { status: 500 });
    }

    // エンドポイントの検証
    const endpoint = process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT;
    if (!endpoint) {
      console.error('ワークフローエンドポイントが設定されていません');
      return NextResponse.json({
        status: 'failed',
        error: 'ワークフローエンドポイントが設定されていません',
        code: 'MISSING_ENDPOINT'
      }, { status: 500 });
    }
    
    console.log('Using workflow ID:', workflowId);
    
    // リクエストボディの構築
    const requestBody = {
      workflow_id: workflowId,
      inputs: {
        image: [{
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
    
    // APIリクエストの送信
    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer app-SnVwOwGNGtuIih9bIV5tldhx',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
    } catch (e) {
      console.error('Failed to fetch from Dify API:', e);
      return NextResponse.json({
        status: 'failed',
        error: 'Failed to connect to Dify API',
        code: 'CONNECTION_ERROR'
      }, { status: 500 });
    }

    console.log('Dify API Response Headers:', Object.fromEntries(response.headers.entries()));
    
    // レスポンスの解析
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
      return NextResponse.json({
        status: 'failed',
        error: 'Invalid JSON response from Dify API',
        code: 'INVALID_RESPONSE'
      }, { status: 500 });
    }

    // エラーレスポンスの処理
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
          status: 'failed',
          error: `Dify API error: ${response.status} ${response.statusText}`,
          code: 'DIFY_API_ERROR',
          details: responseData
        },
        { status: response.status }
      );
    }

    console.log('Dify API Success Response:', responseData);

    // run_idの抽出
    const runId = responseData.workflow_run_id || // 新しいレスポンス形式
                 responseData.data?.id ||        // データ内のID
                 responseData.id;               // 直接のID
    
    if (!runId) {
      console.error('No run ID in Dify response:', responseData);
      return NextResponse.json(
        {
          status: 'failed',
          error: 'No run ID in Dify response',
          code: 'MISSING_RUN_ID',
          details: responseData
        },
        { status: 500 }
      );
    }

    // 出力データの解析
    let outputs = responseData.data?.outputs || {};
    let result = null;
    
    if (outputs['成功']) {
      try {
        result = JSON.parse(outputs['成功']);
        console.log('Parsed result:', result);
      } catch (e) {
        console.warn('Failed to parse output as JSON, using raw value:', e);
        result = outputs['成功'];
      }
    }

    console.log('=== ワークフロー実行完了 ===');
    
    // 成功レスポンスの返却
    return NextResponse.json({
      status: 'succeeded',
      run_id: runId,
      outputs: outputs,
      result: result
    });

  } catch (error) {
    console.error('=== ワークフロー実行エラー ===', error);
    return NextResponse.json(
      {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        code: 'INTERNAL_SERVER_ERROR'
      },
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
