# CronPay - Decentralized Payment & Dispute Platform

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-18.3.1-61DAFB.svg?logo=react)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-3.x-38B2AC.svg?logo=tailwind-css)
![Wagmi](https://img.shields.io/badge/wagmi-2.12.32-blue.svg)
![Ethers](https://img.shields.io/badge/ethers-^6.13.4-3C3C3D.svg?logo=ethereum)

Cronpay is a comprehensive Web3 decentralized application (DApp) designed to facilitate secure, escrow-style cryptocurrency payments with a robust built-in dispute resolution system. 

Built with React, the application allows users to seamlessly send and receive payments using their preferred Web3 wallets. It features user-friendly dashboards for monitoring transactions and an integrated Admin panel for overseeing and resolving disputes.

## 🌟 Key Features

* **Secure Wallet Connection**: Seamlessly connect your wallet using `wagmi` and `viem` to interact securely with the blockchain.
* **Escrow Payments (`/pay`)**: Make secure cryptocurrency payments to other users.
* **Receive Payments (`/get-paid`)**: Request and claim incoming payments through connected wallets.
* **Dispute Resolution System**: 
  * Open a dispute if a transaction goes wrong (`/dispute/report-problem`).
  * Dedicated Support Center for continuous updates and tracking (`/dispute/support-center`).
* **Admin Dashboard & Resolutions**: Dedicated access for Admin users (`/admin-dashboard`, `/admin-dispute`) to monitor ongoing payments and fairly resolve any reported disputes.
* **User Accounts & Registration**: Set up custom avatars and manage your identity.
* **Fully Responsive UI**: A modern interface developed with a combination of Material UI, Styled Components, and Tailwind CSS.

## 🛠 Tech Stack

### Core Technologies
* [React](https://reactjs.org/) (v18)
* [React Router DOM](https://reactrouter.com/) (v6) - For comprehensive application routing.

### Web3 & Blockchain
* [Wagmi](https://wagmi.sh/) / [@wagmi/core](https://wagmi.sh/core/getting-started) - React Hooks for Ethereum.
* [Viem](https://viem.sh/) - TypeScript Interface for Ethereum.
* [Ethers.js](https://docs.ethers.org/v6/) - A complete and compact library for interacting with the Ethereum Blockchain.
* [Bignumber.js](https://mikemcl.github.io/bignumber.js/) - Handling large blockchain numbers accurately.

### Styling & UI
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
* [Material UI (@mui/material)](https://mui.com/) - Advanced React UI components.
* [Styled Components](https://styled-components.com/) & [@emotion/react](https://emotion.sh/) - CSS-in-JS styling solutions.
* [React Toastify](https://fkhadra.github.io/react-toastify/) - Responsive notifications.
* [React Loading Skeleton](https://www.npmjs.com/package/react-loading-skeleton) - Beautiful loading placeholders.

### Data Fetching & API
* [React Query (@tanstack/react-query)](https://tanstack.com/query/latest) - Powerful asynchronous state management.
* [Axios](https://axios-http.com/) - Promise-based HTTP client.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your local machine:
* Node.js (v16.14.0 or above recommended)
* npm or yarn

### Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <repository_url>
   cd cronpay-frontend
   ```

2. **Install dependencies**:
   Run the following command in the project root to install all required packages:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**:
   A `.env` file should be available in the root folder with the necessary configuration details like API keys, Infura/Alchemy URLs, or Smart Contract Addresses. If it's missing, ensure you create one and configure the variables required.

4. **Start the Development Server**:
   ```bash
   npm start
   # or
   yarn start
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in your browser. The page will automatically reload if you make edits.

## 🏗 Project Structure

```text
src/
├── ABI/                    # Smart Contract ABI Definitions (e.g.ABI)
├── api/                    # Axios API calls and backend communication logic
├── components/             # Reusable UI components (Modals, Custom Avatars, etc.)
├── config/                 # Setup configuration files
├── constant/               # Global Contexts and Constant Values (Addresses, Token Lists)
├── pages/                  # Route-based page components
│   ├── adminPanel/         # Admin Dashboard and Dispute management Pages
│   ├── dashboard/          # User Home and Dashboard logic
│   ├── dispute/            # Dispute, Report Problem, and Support Center Pages
│   ├── getPaid/            # Payment Receiving workflows
│   ├── header/             # Header, Navigation, and Wallet Connection
│   ├── login/              # Login logic mapping to wallet connecting
│   ├── onGoing/            # Ongoing Payment lists
│   ├── pay/                # Outbound Payment interfaces
│   └── registration/       # Account creation flows
├── utils/                  # Helper functions and Wagmi configurations
├── App.js                  # Main Application Component with Routing Rules and Layouts
└── index.js                # React Root DOM Mount Entry Point
```

## 🏗 Available Scripts

In the project directory, you can also run:

* `npm test`: Launches the test runner in the interactive watch mode.
* `npm run build`: Builds the app for production to the `build` folder. It minifies the build and generates filenames with hashes.

## 🤝 Contributing

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🛡 License

This project is licensed under the MIT License.
