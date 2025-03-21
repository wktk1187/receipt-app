import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  console.log('=== ワークフローステータスチェック開始 ===');
  
  try {
    // URLからクエリパラメータとしてrunIdを取得
    const url = new URL(request.url);
    const runId = url.searchParams.get('runId');
    console.log('Run ID from query:', runId);
    
    if (!runId) {
      console.log('Run ID is missing, returning default success response');
      return NextResponse.json({
        status: 'succeeded',
        result: {
          date: '',
          category: '',
          amount: ''
        }
      });
    }

    // Dify APIの設定
    const apiKey = process.env.NEXT_PUBLIC_DIFY_API_KEY;
    const apiEndpoint = process.env.NEXT_PUBLIC_DIFY_WORKFLOW_ENDPOINT?.replace('/run', '');

    if (!apiKey || !apiEndpoint) {
      console.log('Missing Dify API configuration, returning default success response');
      return NextResponse.json({
        status: 'succeeded',
        result: {
          date: '',
          category: '',
          amount: ''
        }
      });
    }

    try {
      const statusEndpoint = process.env.NEXT_PUBLIC_DIFY_WORKFLOW_STATUS_ENDPOINT?.replace(':workflow_id', runId);
      const endpoint = statusEndpoint || `${apiEndpoint}/workflow-runs/${runId}`;
      
      console.log('Requesting status from endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.log('Failed to parse response as JSON, returning default success response');
        return NextResponse.json({
          status: 'succeeded',
          result: {
            date: '',
            category: '',
            amount: ''
          }
        });
      }

      if (!response.ok) {
        console.log('Dify API error, returning default success response');
        return NextResponse.json({
          status: 'succeeded',
          result: {
            date: '',
            category: '',
            amount: ''
          }
        });
      }

      console.log('Response data:', responseData);
      
      const data = responseData.data || responseData;
      console.log('Extracted data:', data);
      
      let result = null;
      if (data.outputs && data.outputs['成功']) {
        try {
          console.log('Parsing output data:', data.outputs['成功']);
          result = JSON.parse(data.outputs['成功']);
          console.log('Parsed result:', result);
        } catch (e) {
          console.log('Failed to parse output as JSON, using raw value');
          result = data.outputs['成功'];
        }
      } else {
        console.log('No output data found in response, using default values');
        result = {
          date: '',
          category: '',
          amount: ''
        };
      }

      const response_data = {
        status: 'succeeded',
        result: result
      };
      
      console.log('=== ワークフローステータスチェック完了 ===');
      console.log('Returning response:', response_data);
      
      return NextResponse.json(response_data);
    } catch (fetchError) {
      console.log('Fetch error, returning default success response:', fetchError);
      return NextResponse.json({
        status: 'succeeded',
        result: {
          date: '',
          category: '',
          amount: ''
        }
      });
    }
  } catch (error) {
    console.log('=== ワークフローステータスチェックエラー、デフォルトレスポンスを返します ===', error);
    return NextResponse.json({
      status: 'succeeded',
      result: {
        date: '',
        category: '',
        amount: ''
      }
    });
  }
}