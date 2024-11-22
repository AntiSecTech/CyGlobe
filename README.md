# CyGlobe 🌐

A real-time 3D visualization tool for cyber attacks across the globe.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![JavaScript](https://img.shields.io/badge/JavaScript-83.4%25-yellow)](https://github.com/AntiSecTech/CyGlobe)
[![HTML](https://img.shields.io/badge/HTML-10.1%25-red)](https://github.com/AntiSecTech/CyGlobe)
[![CSS](https://img.shields.io/badge/CSS-6.5%25-blue)](https://github.com/AntiSecTech/CyGlobe)

## 📖 Overview

CyGlobe is an interactive visualization tool that displays cyber attacks happening around the world in real-time on a 3D globe. It provides security professionals and enthusiasts with an intuitive way to monitor and analyze global cyber threats.

## ✨ Features

- Real-time visualization of cyber attacks
- Interactive 3D globe interface
- Attack origin and destination tracking
- Attack type classification
- Customizable visualization options
- Responsive design for various screen sizes

## 🚀 Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

- Clone the repository:

```sh
git clone https://github.com/AntiSecTech/CyGlobe.git
cd CyGlobe
```

- Install dependencies:

```sh
npm install
```

- Start the server:

```sh
npm start
```

- Open your browser and navigate to `http://localhost:3000`

## 🛠️ Technology Stack

- Frontend:
  - HTML5
  - CSS3
  - JavaScript
  - Three.js (for 3D visualization)
- Backend:
  - Node.js
  - Express.js

## 🔧 Configuration

Open `server.js` and replace the placeholder values with your own:

```js
const IPSTACK_API_KEY = 'YOUR_IPSTACK_API_KEY';
const ABUSEIPDB_API_KEY = 'YOUR_ABUSE_IP';
```

## 📚 API Documentation

### Endpoints

#### GET /api/attacks

Returns current cyber attack data

Response format:
(
{
  "source": {
    "lat": number,
    "lon": number,
    "country": string
  },
  "target": {
    "lat": number,
    "lon": number,
    "country": string
  },
  "type": string,
  "timestamp": string
}
)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔐 Security

For security vulnerabilities, please contact us at <antisectech@existiert.net> or use the issue tracker.

## 🙏 Acknowledgments

- [Three.js](https://threejs.org/) for 3D rendering capabilities
- [Node.js](https://nodejs.org/) for the runtime environment
- Contributors and supporters of the project

## 📞 Contact

Project Link: [https://github.com/AntiSecTech/CyGlobe](https://github.com/AntiSecTech/CyGlobe)

## 📊 Project Status

- [x] Initial Release
- [ ] Real-time Data Integration
- [ ] Advanced Analytics
- [ ] Custom Filtering Options
- [ ] Export Capabilities

## 🗺️ Roadmap

- Enhanced attack classification
- Machine learning integration for threat prediction
- Advanced filtering and search capabilities
- Custom reporting features
- API integration with major security platforms

## 📈 Statistics

- Current Version: 1.0.0
- Active Installations: TBD
- Contributors: 1
- Last Updated: 2024
