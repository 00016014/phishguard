import { apiFetch, cachedGet, API_BASE_URL } from '@/lib/apiFetch';

const _API_BASE_URL = API_BASE_URL;

export const LearningLabService = {
  async getChallenges() {
    const data = await cachedGet(`${_API_BASE_URL}/learning-lab/`);
    return data ?? [];
  },

  async getStats() {
    return cachedGet(`${_API_BASE_URL}/learning-lab/stats/`);
  },

  async getLeaderboard() {
    const data = await cachedGet(`${_API_BASE_URL}/learning-lab/leaderboard/`);
    return data ?? [];
  },

  async completeChallenge(id: number, score: number) {
    const response = await apiFetch(`${_API_BASE_URL}/learning-lab/${id}/complete/`, {
      method: 'POST',
      body: JSON.stringify({ score }),
    });
    return await response.json();
  },
};
