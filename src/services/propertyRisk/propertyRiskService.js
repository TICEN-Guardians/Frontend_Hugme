import axiosInstance from '../../api/axiosInstance.js';

export const searchProperty = async (address) => {
  const { data } = await axiosInstance.post('/api/properties/search', { address });
  return data;
};

export const resolveProperty = async ({ address, dongName, hoName }) => {
  const { data } = await axiosInstance.post('/api/properties/resolve', {
    address,
    dongName: dongName || null,
    hoName: hoName || null,
  });
  return data;
};

export const createDiagnosis = async (payload) => {
  const { data } = await axiosInstance.post('/api/diagnoses', payload);
  return data;
};

export const uploadRegistry = async ({ analysisId, file }) => {
  const formData = new FormData();
  formData.append('file', file);

  await axiosInstance.post(
      `/api/diagnoses/${analysisId}/registry`,
      formData,
  );
};

export const analyzeDiagnosis = async (analysisId) => {
  const { data } = await axiosInstance.post(`/api/diagnoses/${analysisId}/analyze`);
  return data;
};

export const getDiagnosis = async (analysisId) => {
  const { data } = await axiosInstance.get(`/api/diagnoses/${analysisId}`);
  return data;
};
