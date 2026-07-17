import React from "react";
import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import ScholarPage from "../pages/ScholarPage";
import ScholarProfilePage from "../pages/ScholarProfilePage";
import UserSettings from "../Components/user_settings/UserSettings";
import UserDashboard from "../Components/userDashboard/UserDashboard";
import EventDetailPage from "../pages/EventDetailPage";
import AllEventsPage from "../pages/AllEventsPage";
import AllBlogsPage from "../pages/AllBlogsPage";
import BlogDetailPage from "../pages/BlogDetailPage";
import ProtectedRoute from "./ProtectedRoute";
import BookYourSpirtualService from "../Components/home_page/BookYourSpirtualService";
import IslamicDuas from "../pages/IslamicDuas";
import Cart from "../Components/cart/Cart";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import CategoryDuasPage from "../pages/CategoryDuasPage";
import JazzCashCheckout from "../pages/JazzCashCheckout";
import AlfalahCheckout from "../pages/AlfalahCheckout";
import AlfalahCallback from "../pages/AlfalahCallback";
import PaymentCallback from "../pages/PaymentCallback";
import PaymentCallbackNew from "../componentsnew/PaymentCallback1";
import IslamicMerchandisePage from "../componentsnew/islamic-merchandise/IslamicMerchandisePage";
import CategoryProductsPage from "../componentsnew/islamic-merchandise/CategoryProductsPage";
import ProductDetailsPage from "../componentsnew/islamic-merchandise/ProductDetailsPage";
import HomePage1 from "../componentsnew/HomePage1";
import AllProductsPage from "../componentsnew/islamic-merchandise/AllProductsPage";
import AboutUs from "../componentsnew/AboutUs";
import FAQ from "../componentsnew/FAQ";
import RefundPolicy from "../componentsnew/RefundPolicy";
import TermsConditions from "../componentsnew/TermsConditions";
import PaymentPrivacyPolicy from "../componentsnew/PaymentPrivacyPolicy";
import ContactUs from "../componentsnew/ContactUs";
import NewCart from "../componentsnew/Cart";
import Checkout from "../componentsnew/Checkout";
import CheckoutSuccess from "../componentsnew/CheckoutSuccess";
import NotFoundPage from "../pages/NotFoundPage";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage1 />} />
      <Route path="/home-baraka" element={<HomePage />} />
      <Route path="/scholars" element={<ScholarPage />} />
      <Route path="/scholars/scholar/:scholarId" element={<ScholarProfilePage />} />
      <Route path="/bookyourspirtualservice" element={<BookYourSpirtualService />} />
      <Route path="/islamic-duas" element={<IslamicDuas />} />
      <Route path="/islamic-duas/:categoryId" element={<CategoryDuasPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/checkout" element={<JazzCashCheckout />} />
      <Route path="/payment/callback" element={<PaymentCallback />} />
      <Route path="/payment/callback1" element={<PaymentCallbackNew />} />
      <Route path="/alfalah-payment-test" element={<AlfalahCheckout />} />
      <Route path="/payment/alfalah-callback" element={<AlfalahCallback />} />
      <Route path="/islamic-merchandise" element={<IslamicMerchandisePage />} />
      <Route path="/shop-islamic" element={<AllProductsPage />} />
      <Route path="/islamic-merchandise/:category" element={<CategoryProductsPage />} />
      <Route path="/islamic-products/:productId" element={<ProductDetailsPage />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/payment-privacy-policy" element={<PaymentPrivacyPolicy />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/cart1" element={<NewCart />} />
      <Route path="/checkout1" element={<Checkout />} />
      <Route path="/checkout-success" element={<CheckoutSuccess />} />

      {/* ✅ Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/user/settings" element={<UserSettings />} />
        <Route path="/user/dashboard/*" element={<UserDashboard />} />
        <Route path="/user/cart/*" element={<Cart />} />
      </Route>

      <Route path="/user/events" element={<AllEventsPage />} />
      <Route path="/user/events/:eventId" element={<EventDetailPage />} />
      <Route path="/user/event/create" element={<EventDetailPage />} />

      {/* Blog routes */}
      <Route path="/blogs" element={<AllBlogsPage />} />
      <Route path="/blogs/:identifier" element={<BlogDetailPage />} />

      {/* 404 Not Found - Catch all undefined routes */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
