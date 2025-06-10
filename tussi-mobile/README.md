# Tussi Mobile

This is the mobile application for the Tussi platform, built with Expo, React Native, TypeScript, and styled with Tailwind CSS (NativeWind) and shadcn/ui principles.

## ✨ Features

- **Product Listing**: View products from the Tussi catalog.
- **Automatic Fallback**: Fetches live data from the API and automatically falls back to mock data if the API is unreachable or returns no products.
- **Manual Refresh**: A refresh button to manually reload product data.
- **Modern Stack**: Built with a modern, type-safe stack.
- **Styled with Tailwind**: Consistent UI with the web frontend.

## 🚀 Getting Started

Follow these instructions to get the mobile app running on your local machine for development and testing.

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo Go](https://expo.dev/go) app on your iOS or Android device.
- A running instance of the Tussi backend services. See the main project `README.md` for setup instructions.

### Installation & Running

1.  **Navigate to the mobile app directory:**
    ```bash
    cd tussi-mobile
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm start -- --clear
    ```
    This will start the Metro bundler and show a QR code in your terminal.

4.  **Run on your device:**
    -   Open the **Expo Go** app on your iOS or Android phone.
    -   Scan the QR code from your terminal.

    Alternatively, you can run it on a simulator:
    -   Press `i` in the terminal to run on the iOS Simulator.
    -   Press `a` in the terminal to run on the Android Emulator.

## 🔧 Configuration

### API Integration

The mobile app fetches product data from the `products-api` service. The API endpoint is configured in `api/products.ts`.

-   **File**: `tussi-mobile/api/products.ts`
-   **Constant**: `API_URL`

By default, it's set to `http://localhost:8001`, which works for the iOS Simulator.

**Important:**
-   **For Android Emulator:** You need to change `API_URL` to `http://10.0.2.2:8001`.
-   **For running on a physical device:** You must change `localhost` to your computer's local network IP address (e.g., `http://192.168.1.10:8001`). Your phone and computer must be on the same Wi-Fi network.

## 🔀 Data Fetching & Fallback

The application is designed to be resilient. It follows this data-fetching logic:

1.  It attempts to fetch the product list from the live API.
2.  If the API call is successful and returns products, they are displayed.
3.  If the API call fails (e.g., network error, server is down) or returns no products, the app automatically loads a local mock dataset and displays a status banner to inform the user.

-   **Mock Data**: Defined in `tussi-mobile/constants/mocks.ts`. This data is used for the fallback scenario.

## 🎨 Styling

The app's UI is built to be consistent with the Tussi web frontend.
- **Tailwind CSS**: `nativewind` is used for styling via utility classes.
- **shadcn/ui**: Components are structured following `shadcn/ui` principles for reusability and consistency. Core UI components are located in `tussi-mobile/components/ui`.
- **Styling Configuration**: `tailwind.config.js` and `app/global.css`. 