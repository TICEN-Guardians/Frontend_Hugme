import axiosInstance, { publicAxiosInstance } from '../axiosInstance.js';
import {
  getAnonymousRiskSession,
  setAnonymousRiskSession,
} from '../../utils/riskDiagnosisStorage.js';

const addressClient = (anonymous) => ({
  client: anonymous ? publicAxiosInstance : axiosInstance,
  prefix: anonymous ? '/api/public/properties' : '/api/properties',
});

const diagnosisAccess = (analysisId) => {
  const session = getAnonymousRiskSession(analysisId);
  if (!session) {
    return { client: axiosInstance, prefix: '/api/diagnoses', headers: {} };
  }
  return {
    client: publicAxiosInstance,
    prefix: '/api/public/diagnoses',
    headers: { 'X-Diagnosis-Token': session.accessToken },
  };
};

export const suggestAddresses = async (address, anonymous) => {
  const { client, prefix } = addressClient(anonymous);
  const { data } = await client.post(`${prefix}/suggestions`, { address });
  return data;
};

export const searchProperty = async (address, anonymous) => {
  const { client, prefix } = addressClient(anonymous);
  const { data } = await client.post(`${prefix}/search`, { address });
  return data;
};

export const resolveProperty = async ({ address, dongName, hoName, anonymous }) => {
  const { client, prefix } = addressClient(anonymous);
  const { data } = await client.post(`${prefix}/resolve`, {
    address,
    dongName: dongName || null,
    hoName: hoName || null,
  });
  return data;
};

export const createDiagnosis = async ({ mode, anonymous }) => {
  const client = anonymous ? publicAxiosInstance : axiosInstance;
  const prefix = anonymous ? '/api/public/diagnoses' : '/api/diagnoses';
  const { data } = await client.post(prefix, { mode });
  if (anonymous) setAnonymousRiskSession(data);
  return data;
};

export const uploadRegistry = async ({ analysisId, files }) => {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  const { data } = await axiosInstance.post(
    `/api/diagnoses/${analysisId}/registry`,
    formData,
  );
  return data;
};

export const updateDiagnosisAddress = async (analysisId, payload) => {
  const { client, prefix, headers } = diagnosisAccess(analysisId);
  await client.put(`${prefix}/${analysisId}/address`, payload, { headers });
};

export const updateDiagnosisDetails = async (analysisId, payload) => {
  const { client, prefix, headers } = diagnosisAccess(analysisId);
  await client.put(`${prefix}/${analysisId}/details`, payload, { headers });
};

export const analyzeDiagnosis = async (analysisId) => {
  const { client, prefix, headers } = diagnosisAccess(analysisId);
  const { data } = await client.post(`${prefix}/${analysisId}/analyze`, null, { headers });
  return data;
};

export const getDiagnosis = async (analysisId) => {
  const { client, prefix, headers } = diagnosisAccess(analysisId);
  const { data } = await client.get(`${prefix}/${analysisId}`, { headers });
  return data;
};

export const calculateDiagnosisScenario = async (analysisId, payload) => {
  const { client, prefix, headers } = diagnosisAccess(analysisId);
  const { data } = await client.post(
    prefix + '/' + analysisId + '/scenarios',
    payload,
    { headers },
  );
  return data;
};
