import axiosInstance from './axios';

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
  getList: async () => {
    const response = await axiosInstance.get('/question/list');
    return response.data;
  },
};

export const answerService = {
  submit: async (answersJson: string) => {
    const formData = new FormData();
    formData.append('answers', answersJson);
    const response = await axiosInstance.post('/answers/submit', formData);
    return response.data;
  },
};
