export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  is_test_question?: boolean;
  test_type?: string;
  fase?: string;
}

export interface Module {
  id: string;
  name: string;
  icon: string;
  description: string;
}
