import api from "./api";

const API_URL = "/email";
//const API_URL = "https://barakah-project-be.vercel.app/api/email";

export const sendGenericEmail = async (to: string, subject: string, text: string, html?: string) => {
  const response = await api.post(`${API_URL}/send-generic`, {
    to,
    subject,
    text,
    html,
  });
  return response.data;
};
