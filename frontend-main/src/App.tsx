
import { useLocation } from "react-router-dom";
import Header from "./Components/home_page/Header";
import MerchandiseHeader from "./componentsnew/home/Header";
import Footer from "./Components/home_page/Footer";
import MerchandiseFooter from "./componentsnew/home/Footer";
import AppRoutes from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import { AlertDialogProvider } from "./context/AlertDialogContext";
import { CartProvider } from "./context/CartContext";

function App() {
  const location = useLocation();

  // Routes that use the MAIN header/footer (original Baraka app pages)
  const isMainAppPage = location.pathname.startsWith("/home-baraka") ||
    location.pathname.startsWith("/scholars") ||
    location.pathname === "/bookyourspirtualservice" ||
    location.pathname.startsWith("/islamic-duas") ||
    location.pathname === "/reset-password" ||
    location.pathname === "/checkout" ||
    location.pathname === "/payment/callback" ||
    location.pathname.startsWith("/user/") ||
    location.pathname.startsWith("/blogs");

  // All other routes (including 404) use the componentsnew header/footer

  return (
    <AlertDialogProvider>
      <CartProvider>
        <div translate={isMainAppPage ? "yes" : "no"} className={isMainAppPage ? "" : "notranslate"} style={{ display: 'contents' }}>
          {isMainAppPage ? <Header /> : <MerchandiseHeader />}
          <AppRoutes />
          {isMainAppPage ? <Footer /> : <MerchandiseFooter />}
        </div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ zIndex: 99999 }}
        />
      </CartProvider>
    </AlertDialogProvider>
  );
}

export default App;
