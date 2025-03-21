-- プロフィールテーブルの作成
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- セキュリティポリシーの設定
-- 自分のプロフィールのみ読み取り可能
CREATE POLICY "ユーザーは自分のプロフィールを読み取れる" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "ユーザーは自分のプロフィールを更新できる" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 自分のプロフィールのみ挿入可能
CREATE POLICY "ユーザーは自分のプロフィールを挿入できる" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 新規ユーザー登録時にプロフィールを自動作成するトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 既存のトリガーを削除（存在する場合）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- トリガーを作成
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();