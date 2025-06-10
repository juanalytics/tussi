# Tussi Mobile

This is the mobile application for the Tussi platform, built with Expo, React Native, TypeScript, and styled with Tailwind CSS (NativeWind) and shadcn/ui principles.

## ✨ Features

- **Product Listing**: View products from the Tussi catalog.
- **Mock & Live Data**: Toggle between mock data for UI testing and live data from the backend API.
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
    npm start
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

### Testing with Mock Data

The application provides a button on the main screen to toggle between fetching live data from the API and using a local mock dataset. This is useful for UI development and testing without needing a running backend.

-   **Mock Data**: Defined in `tussi-mobile/constants/mocks.ts`.
-   **Toggle**: The "Load Mock Data" / "Load Live Data" button on the product list screen.

## 🎨 Styling

The app's UI is built to be consistent with the Tussi web frontend.
- **Tailwind CSS**: `nativewind` is used for styling via utility classes.
- **shadcn/ui**: Components are structured following `shadcn/ui` principles for reusability and consistency. Core UI components are located in `tussi-mobile/components/ui`.
- **Styling Configuration**: `tailwind.config.js` and `app/global.css`. 