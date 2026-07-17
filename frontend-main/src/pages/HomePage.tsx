import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAlertDialog } from "../context/AlertDialogContext";
import { Scholar } from "../types/Scholars";
import HeroImage from "../Components/home_page/HeroImage";
import masjid1 from '../assets/masjid1.jpg'
import TrustBanner from "../Components/home_page/TrustBanner";
import PopularCategories from "../Components/home_page/PopularCategories";
// import EventsSection from "../Components/home_page/EventsSection";
import TestimonialsSection from "../Components/home_page/TestimonialsSection";
import HadithQuoteSection from "../Components/home_page/HadithQuoteSection";
import BookYourSpiritualService from "../Components/home_page/BookYourSpirtualService";
import FeaturedSchollers from "../Components/home_page/FeaturedSchollers";
import Faqs from "../Components/home_page/Faqs";
import BlogsSection from "../Components/home_page/BlogsSection";
import HowitsWork from "../Components/home_page/HowitsWork";
import DuaLibrarySection from "../Components/home_page/DuaLibrarySection";
import { getUserConversations } from "../services/userConversationService";
import { submitFeedback, incrementPopupCount, getOrdersByUserId, maxPopupCount, incrementPlatformPopupCount } from "../services/orderService";
import FeedbackPopup from "../Components/userDashboard/FeedbackPopup";
import TestimonialPopup from "../Components/userDashboard/TestimonialPopup";
import { submitPlatformTestimonial } from "../services/platformTestimonialService";

interface FeedbackOrder {
  orderId: string;
  OrderTitle: string;
  OrderID: number;
  scholarName?: string;
  feedbackGiven?: boolean;
}

const HomePage: React.FC = () => {
  const { showAlert } = useAlertDialog();
  const [selectedScholar, setSelectedScholar] = useState<Scholar | null>(null);
  const location = useLocation();

  // Feedback Popup State
  const [activeFeedbackOrder, setActiveFeedbackOrder] = useState<FeedbackOrder | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Platform Testimonial Popup State
  const [testimonialOpen, setTestimonialOpen] = useState(false);
  const [activeTestimonialOrder, setActiveTestimonialOrder] = useState<any | null>(null);

  // Check for feedback opportunities & Testimonial eligibility on load
  useEffect(() => {
    const checkUserInteractions = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;

      try {
        // 1. Check for Order Feedback (Scholar)
        const response = await getUserConversations(userId);
        let feedbackShown = false;

        if (response.conversations && response.conversations.length > 0) {
          // Filter valid candidates
          const candidates = response.conversations.filter((conv: any) =>
            conv.orderId?.Status === "Completed" &&
            conv.orderId?.isReadByUser === true &&
            !conv.orderId?.feedbackGiven &&
            (typeof conv.orderId?.feedbackPopupCount === 'number' ? conv.orderId.feedbackPopupCount < 3 : true)
          );

          // Find specific candidate
          for (const conv of candidates) {
            const orderAmt = conv.orderId?.OrderAmt;
            const isFreeOrder = orderAmt === 0;

            if (isFreeOrder) {
              // Auto-dismiss free orders (User request: count to 3, don't show)
              await maxPopupCount(conv.orderId._id);
              // Continue to next candidate or stop? 
              // If we max out, it won't be valid next time. 
              // We should try to find a NON-FREE order to show, or just let platform feedback take over.
              // Let's continue loop to find a paid order if any.
              continue;
            }

            // Found a paid order to show feedback for
            const scholar = conv.participants?.find((p: any) => p.scholarName) as any;

            setActiveFeedbackOrder({
              orderId: conv.orderId._id,
              OrderTitle: conv.orderId.OrderTitle,
              OrderID: conv.orderId.OrderID,
              scholarName: scholar?.scholarName,
            });

            setTimeout(() => {
              setFeedbackOpen(true);
            }, 2000);
            feedbackShown = true;
            break; // Show one at a time
          }
        }

        // 2. Check for Platform Testimonial (if feedback popup is not shown)
        if (!feedbackShown) {
          const orders = await getOrdersByUserId(userId);

          // Find the FIRST order that is Completed and plateformFeedbackPopupCount < 1
          const candidateOrder = orders.find((o: any) =>
            (o.Status === "Completed" || o.status === "completed" || o.status === "Completed") &&
            o.isReadByUser === true &&
            (typeof o.plateformFeedbackPopupCount === 'number' ? o.plateformFeedbackPopupCount < 1 : true)
          );

          if (candidateOrder) {
            setActiveTestimonialOrder(candidateOrder);
            setTimeout(() => {
              setTestimonialOpen(true);
            }, 4000); // Show after a delay
          }
        }

      } catch (error) {
        console.error("Error checking eligibility:", error);
      }
    };

    checkUserInteractions();
  }, []);

  const handleFeedbackClose = async () => {
    if (activeFeedbackOrder) {
      try {
        await incrementPopupCount(activeFeedbackOrder.orderId);
      } catch (err) {
        console.error("Failed to increment popup count:", err);
      }
    }
    setFeedbackOpen(false);
    setActiveFeedbackOrder(null);
  };

  const handleFeedbackDismiss = async () => {
    if (activeFeedbackOrder) {
      try {
        await maxPopupCount(activeFeedbackOrder.orderId);
      } catch (err) {
        console.error("Failed to max popup count:", err);
      }
    }
    setFeedbackOpen(false);
    setActiveFeedbackOrder(null);
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!activeFeedbackOrder) return;

    try {
      await submitFeedback(activeFeedbackOrder.orderId, rating, comment);
      setFeedbackOpen(false);
      setActiveFeedbackOrder(null);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  // Platform Testimonial Handlers
  const handleTestimonialClose = async () => {
    if (activeTestimonialOrder) {
      try {
        // Increment logic to prevent showing again immediately (or ever, since limit is 1)
        // @ts-ignore
        await incrementPlatformPopupCount(activeTestimonialOrder._id || activeTestimonialOrder.OrderID);
      } catch (err) {
        console.error("Failed to increment platform popup count", err);
      }
    }
    setTestimonialOpen(false);
    setActiveTestimonialOrder(null);
  };

  const handleTestimonialSubmit = async (rating: number, comment: string) => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");
    if (!userId || !token || !activeTestimonialOrder) return;

    try {
      // @ts-ignore
      await submitPlatformTestimonial(token, { userId, orderId: activeTestimonialOrder._id, rating, comment });
      setTestimonialOpen(false);
      setActiveTestimonialOrder(null);
    } catch (error: any) {
      console.error("Failed to submit platform testimonial", error);
      const msg = error.response?.data?.error || "Failed to submit testimonial";
      await showAlert('Error', msg, 'error');
    }
  };


  useEffect(() => {
    if (location.state?.bookScholar) {
      setSelectedScholar(location.state.bookScholar);
      setTimeout(() => {
        const element = document.getElementById("booking-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 400); // Increased delay to ensure render
    }
  }, [location.state]);

  const handleBookNow = (scholar: Scholar) => {
    setSelectedScholar(scholar);
    const element = document.getElementById("booking-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return <>
    <HeroImage image={masjid1} />
    <TrustBanner />
    <PopularCategories />
    {/* <EventsSection /> */}
    <DuaLibrarySection />
    <HadithQuoteSection />
    <div id="booking-section">
      <BookYourSpiritualService selectedScholar={selectedScholar} onScholarChange={setSelectedScholar} />
    </div>
    <FeaturedSchollers onBookNow={handleBookNow} />
    <TestimonialsSection />
    <Faqs />
    <BlogsSection />

    <HowitsWork />

    <FeedbackPopup
      open={feedbackOpen}
      onClose={handleFeedbackClose}
      onDismiss={handleFeedbackDismiss}
      onSubmit={handleFeedbackSubmit}
      order={activeFeedbackOrder ? {
        OrderID: activeFeedbackOrder.OrderID,
        OrderTitle: activeFeedbackOrder.OrderTitle,
        _id: activeFeedbackOrder.orderId,
        scholarName: activeFeedbackOrder.scholarName
      } : null}
    />

    <TestimonialPopup
      open={testimonialOpen}
      onClose={handleTestimonialClose}
      onSubmit={handleTestimonialSubmit}
    />
  </>
}

export default HomePage;



