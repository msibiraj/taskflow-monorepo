const axios = require('axios');

class ApiClient {
  constructor(token = null) {
    this.token = token;
    // Support custom API URL via environment variable
    this.baseURL = process.env.TASKFLOW_API_URL || 'http://localhost:5000/api';
    
    console.log(`🌐 API Client configured for: ${this.baseURL}`);
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Add token to requests
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });
  }
  
  async login(credentials) {
    const response = await this.client.post('/auth/login', credentials);
    this.token = response.data.token;
    return response.data;
  }
  
  async saveActivity(activity) {
    const response = await this.client.post('/activities', activity);
    return response.data;
  }
  
  async getActivities(startDate, endDate, type = null) {
    const params = { startDate, endDate };
    if (type) params.type = type;
    
    const response = await this.client.get('/activities', { params });
    return response.data;
  }
  
  async getSummary(date) {
    const response = await this.client.get('/analytics/summary', {
      params: { date }
    });
    return response.data;
  }
  
  async getCategories() {
    const response = await this.client.get('/categories');
    return response.data;
  }
}

module.exports = ApiClient;
