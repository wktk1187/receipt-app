import { DifyResponse } from './types';

// ファイルアップロード
export async function uploadFile(file: File): Promise<string> {
  console.log('Uploading file:', {
    name: file.name,
    size: file.size,
    type: file.type
  });

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/dify/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('File upload error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorData
    });
    throw new Error(`Failed to upload file: ${response.status} ${response.statusText}${errorData.error ? ` - ${errorData.error}` : ''}`);
  }

  const data = await response.json();
  console.log('File upload success:', data);
  
  // サーバーからのレスポンスには file_id が含まれている
  if (!data.file_id) {
    console.error('Upload response does not contain file_id:', data);
    throw new Error('Upload response does not contain file_id');
  }
  
  console.log('Returning file_id:', data.file_id);
  return data.file_id; // サーバーからのレスポンスから file_id を返す
}

// ワークフロー実行開始
export async function startWorkflow(fileId: string): Promise<{ 
  runId: string;
  outputs?: any;
  status?: string;
}> {
  if (!fileId) {
    throw new Error('File ID is required');
  }

  console.log('Starting workflow with file ID:', fileId);
  
  try {
    const response = await fetch('/api/dify/workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId: fileId,
      }),
    });

    // レスポンスをテキストとして取得
    const responseText = await response.text();
    console.log('Raw workflow response:', responseText);
    
    // JSONとしてパース
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed workflow response:', responseData);
    } catch (e) {
      console.error('Failed to parse workflow response:', e);
      throw new Error(`Failed to parse workflow response: ${responseText}`);
    }
    
    // エラーチェック
    if (!response.ok) {
      console.error('Workflow start error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        sentFileId: fileId
      });
      
      const errorMessage = responseData.message || responseData.error || 
        (responseData.details ? JSON.stringify(responseData.details) : `${response.status} ${response.statusText}`);
      throw new Error(`Failed to start workflow: ${errorMessage}`);
    }
    
    console.log('Workflow started successfully:', responseData);
    
    // レスポンスの検証
    if (!responseData.run_id) {
      console.error('No run_id in response:', responseData);
      throw new Error('No run ID in workflow response');
    }
    
    return {
      runId: responseData.run_id,
      outputs: responseData.outputs,
      status: responseData.status
    };
  } catch (error) {
    console.error('Workflow start failed:', error);
    throw error;
  }
}

// ワークフロー実行状態確認
export async function checkWorkflowStatus(runId: string): Promise<DifyResponse> {
  console.log('Checking workflow status for run ID:', runId);
  
  try {
    const response = await fetch(`/api/dify/workflow?runId=${runId}`);
    
    // レスポンスをテキストとして取得
    const responseText = await response.text();
    console.log('Raw workflow status response:', responseText);
    
    // JSONとしてパース
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse workflow status response:', e);
      throw new Error(`Failed to parse workflow status response: ${responseText}`);
    }
    
    // エラーチェック
    if (!response.ok) {
      console.error('Workflow status check error:', {
        status: response.status,
        statusText: response.statusText,
        error: responseData,
        runId: runId
      });
      
      const errorMessage = responseData.message || responseData.error || `${response.status} ${response.statusText}`;
      throw new Error(`Failed to check workflow status: ${errorMessage}`);
    }
    
    console.log('Workflow status check successful:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Workflow status check failed:', error);
    throw error;
  }
}

// 領収書解析（統合関数）
export async function analyzeDifyReceipt(file: File): Promise<{
  status: 'success' | 'error';
  message?: string;
  code?: string;
  data?: {
    date: string;
    category: string;
    amount: number | string;
  };
}> {
  try {
    // ファイルアップロード
    const fileId = await uploadFile(file);
    console.log('File uploaded successfully with ID:', fileId);

    // ワークフロー開始
    const { runId, outputs, status } = await startWorkflow(fileId);
    console.log('Workflow started with run ID:', runId);

    // 成功の場合、出力を解析
    if (status === 'succeeded' && outputs) {
      try {
        // 成功キーの値をJSONとしてパース
        const successOutput = outputs['成功'];
        if (typeof successOutput === 'string') {
          const data = JSON.parse(successOutput);
          return {
            status: 'success',
            data: {
              date: data.date,
              category: data.category,
              amount: data.amount
            }
          };
        }
      } catch (e) {
        console.error('Failed to parse workflow output:', e);
      }
    }

    // エラーまたは解析失敗の場合
    return {
      status: 'error',
      message: '領収書の解析に失敗しました',
      code: 'PARSE_ERROR'
    };

  } catch (error) {
    console.error('Receipt analysis failed:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '領収書の解析に失敗しました',
      code: 'DIFY_API_ERROR'
    };
  }
}
