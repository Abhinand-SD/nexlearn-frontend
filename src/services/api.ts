import axiosInstance from './axios';

// --- Global API Interfaces ---

export interface OptionData {
  id: number;
  option: string;
  is_correct: boolean;
  image: string | null;
  text?: string;
  option_text?: string;
}

export interface QuestionData {
  question_id: number;
  id?: number;
  number: number;
  question: string;
  comprehension: string | null;
  image: string | null;
  options: OptionData[];
}

export interface ExamData {
  success?: boolean;
  title?: string;
  questions_count: number;
  total_marks: number;
  total_time: number;
  duration?: number | string;
  time_for_each_question?: number;
  mark_per_each_answer?: number;
  instruction: string;
  questions: QuestionData[];
  data?: any; // Fallback wrapper
}

export interface SubmitResponse {
  success: boolean;
  exam_history_id?: number | string;
  score: number;
  correct: number;
  wrong: number;
  not_attended: number;
  submitted_at?: string;
  details?: any;
  message?: string;
  data?: any; // Fallback wrapper if API wraps in data object
}

export const authService = {
  sendOtp: async (mobile: string) => {
    const formData = new FormData();
    formData.append('mobile', mobile);
    const response = await axiosInstance.post('/auth/send-otp', formData);
    return response.data;
  },

  verifyOtp: async (mobile: string, otp: string) => {
    const formData = new FormData();
    formData.append('mobile', mobile);
    formData.append('otp', otp);
    const response = await axiosInstance.post('/auth/verify-otp', formData);
    return response.data;
  },

  createProfile: async (
    mobile: string,
    name: string,
    email: string,
    qualification: string,
    profileImage: File
  ) => {
    const formData = new FormData();
    formData.append('mobile', mobile);
    formData.append('name', name);
    formData.append('email', email);
    formData.append('qualification', qualification);
    formData.append('profile_image', profileImage);

    const response = await axiosInstance.post('/auth/create-profile', formData);
    return response.data;
  },

  logout: async () => {
    // Calling the API endpoint for logout
    await axiosInstance.post('/auth/logout');
  },
};

export const questionService = {
  getList: async (): Promise<ExamData> => {
    const response = await axiosInstance.get('/question/list');
    return response.data;
  },
};

export const answerService = {
  submit: async (answersJson: string): Promise<SubmitResponse> => {
    const formData = new FormData();
    formData.append('answers', answersJson);
    const response = await axiosInstance.post('/answers/submit', formData);
    return response.data;
  },
};
