# Studio Blockchain Explorer

A modern, feature-rich blockchain explorer for the Studio Blockchain network. This application allows users to explore blocks, transactions, addresses, tokens, and NFTs on the Studio Blockchain.

## Features

- **Block Explorer**: View detailed information about blocks, including transactions, gas used, and more.
- **Transaction Explorer**: Explore transactions with detailed information about gas usage, input data, and event logs.
- **Address Explorer**: View address details, including balance, transactions, tokens, and NFTs.
- **Token Explorer**: Browse tokens on the network with market data and transfer history.
- **NFT Explorer**: Discover NFT collections and individual NFTs with ownership history and properties.
- **AI Dashboard**: Visualize the on-chain neural networks that power Studio Blockchain's priority system gas fees.
- **Responsive Design**: Fully responsive interface that works on desktop, tablet, and mobile devices.
- **Dark Mode**: Sleek dark theme for comfortable viewing in all environments.

## Technology Stack

- **Frontend**: React, React Router, Framer Motion
- **Styling**: Tailwind CSS
- **Data Visualization**: Chart.js, React Chart.js 2
- **Build Tool**: Vite
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/studioblockchain/explorer.git
   cd explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory, ready to be deployed to a web server.

## Deployment

### Server Requirements

- Any static file server (Nginx, Apache, etc.)
- HTTPS certificate (recommended for production)

### Deployment Steps

1. Build the application as described above.
2. Use the deployment script to create a deployment package:
   ```bash
   npm run deploy
   ```
3. Upload the generated `studio-blockchain-explorer.zip` file to your web server.
4. Extract the ZIP file to your web server's public directory.
5. Configure your web server to serve the application.

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name explorer.studioblockchain.com;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name explorer.studioblockchain.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    root /path/to/dist;
    index index.html;
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

## API Integration

The explorer is designed to work with the Studio Blockchain API. The API endpoints are configured in `src/services/api.js`.

The application connects to the Studio Blockchain Indexer API at `https://mainnetindexer.studio-blockchain.com` by default. You can modify this in the `src/services/api/core.js` file if needed.

## Project Structure

```
studio-blockchain-explorer/
├── public/                  # Static assets
│   ├── token-logos/         # Token logos
│   └── ...
├── src/
│   ├── assets/              # Application assets
│   ├── components/          # React components
│   │   ├── addresses/       # Address-related components
│   │   ├── ai-visualization/ # AI visualization components
│   │   ├── blocks/          # Block-related components
│   │   ├── common/          # Common/shared components
│   │   ├── contracts/       # Contract-related components
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── nfts/            # NFT-related components
│   │   ├── tokens/          # Token-related components
│   │   └── transactions/    # Transaction-related components
│   ├── context/             # React context providers
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Page components
│   ├── services/            # API services
│   │   ├── api/             # API modules
│   │   └── ...
│   ├── store/               # State management
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main application component
│   ├── App.css              # Application styles
│   ├── index.css            # Global styles
│   └── main.jsx             # Application entry point
├── .gitignore               # Git ignore file
├── build-for-deploy.js      # Deployment script
├── DEPLOYMENT.md            # Deployment guide
├── eslint.config.js         # ESLint configuration
├── package.json             # Project dependencies and scripts
├── postcss.config.js        # PostCSS configuration
├── README.md                # Project documentation
├── tailwind.config.js       # Tailwind CSS configuration
└── vite.config.js           # Vite configuration
```

## Key Features Explained

### AI Neural Network Visualization

The Studio Blockchain Explorer includes a unique AI Dashboard that visualizes the on-chain neural networks that power Studio Blockchain's priority system gas fees. This feature provides insights into:

- Block prediction accuracy
- Network optimization
- Transaction priority
- Learning progress

### Priority System Gas Fees

Studio Blockchain is the first Ethereum fork with on-chain neural networks and priority system gas fees. The AI analyzes transaction patterns and network conditions to optimize block production and transaction processing, resulting in a more efficient and accessible blockchain for all users.

Transactions are processed based on their priority level, with higher priority transactions being processed faster. Users can choose their priority level based on their needs, creating a balanced system that maintains network efficiency while providing flexibility for different types of transactions.

### Token and NFT Support

The explorer provides comprehensive support for tokens and NFTs on the Studio Blockchain network, including:

- Token details and transfer history
- NFT collections and individual NFT properties
- Token price information

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Studio Blockchain Team
- React and Vite communities
- All open-source libraries used in this project
