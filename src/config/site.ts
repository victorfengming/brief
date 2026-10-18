export const site = {
  name: 'Victor',
  title: '自动驾驶云端软件工程师',
  titleEn: 'Autonomous Driving Software Engineer',
  description: '专注自动驾驶云端系统、分布式通信与可靠性工程，探索从车辆数据到云端智能的工程实践。',
  location: 'ShangHai',
  email: 'victorfm@163.com',
  github: 'https://github.com/victorfengming',
  resumePdf: '',
  skills: ['Go', 'MQTT', 'Redis', 'Kubernetes', 'Python'],
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const path = (route = '') => `${base}/${route.replace(/^\//, '')}`;
