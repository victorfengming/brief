export const site = {
  name: '[YOUR_NAME]',
  title: '自动驾驶云端软件工程师',
  titleEn: 'Autonomous Driving Software Engineer',
  description: '专注自动驾驶云端系统、分布式通信与可靠性工程，探索从车辆数据到云端智能的工程实践。',
  location: '[YOUR_LOCATION]',
  email: '[YOUR_EMAIL]',
  github: '',
  resumePdf: '',
  skills: ['Go', 'MQTT', 'Redis', 'Kubernetes', 'InfluxDB', 'Python'],
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const path = (route = '') => `${base}/${route.replace(/^\//, '')}`;
