import React, { useState, useEffect } from "react";
import BookYourSpirtualForm from "./BookYourSpirtualForm";
import { Scholar } from "../../types/Scholars";
import { Tabs, Tab, } from "@mui/material";
import { useLocation } from "react-router-dom";


interface BookYourSpirtualServiceProps {
  selectedScholar?: Scholar | null;
  onScholarChange?: (scholar: Scholar | null) => void;
}

const SERVICE_TABS = [
  { id: 0, label: "Personal Dua", keywords: ["Personal Dua", "Dua"] },
  { id: 4, label: "Free Personal Dua", keywords: ["Free Personal Dua", "Personal Dua", "Dua"] },
  // { id: 1, label: "Quran Khwani", keywords: ["Quran Khwani", "Quran Khawani", "Quran"] },
  { id: 2, label: "Wazaif and Adhkar", keywords: ["Wazaif and Adhkar", "Wazaif", "Adhkar", "Tasbeehat", "Tasbeeh"] },
  // { id: 3, label: "Istikhara", keywords: ["Istikhara"] },
  { id: 5, label: "Quran O Hadith", keywords: ["Quran O Hadith", "Quran", "Hadith"] },
];

const BookYourSpirtualService: React.FC<BookYourSpirtualServiceProps> = ({ selectedScholar, onScholarChange }) => {


  const location = useLocation();
  const initialTab = location.state?.tab ?? 0;

  const [value, setValue] = useState(initialTab);

  const activeScholar = selectedScholar || location.state?.bookScholar || null;

  // Calculate service availability for the active tab (helper logic)
  const isServiceAvailable = (scholar: Scholar | null, tabId: number) => {
    if (!scholar || tabId === 4) return true; // If no scholar selected or Free Dua, all services available
    if (!scholar.scholarServices || scholar.scholarServices.length === 0) return false;

    const tab = SERVICE_TABS.find(t => t.id === tabId);
    if (!tab) return true;

    return scholar.scholarServices.some((service: { name: string }) =>
      tab.keywords.some((keyword) =>
        service.name.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  // No longer checking for free order eligibility - unlimited allowed
  const visibleTabs = SERVICE_TABS;

  // Ensure active tab is valid if the current one gets hidden
  useEffect(() => {
    const isVisible = visibleTabs.some((t) => t.id === value);
    if (!isVisible && visibleTabs.length > 0) {
      setValue(visibleTabs[0].id);
    }
  }, [visibleTabs, value]);

  // Handle location state updates
  useEffect(() => {
    if (location.state?.tab !== undefined) {
      setValue(location.state.tab);
    }
  }, [location.state?.tab]);

  // Scroll logic
  useEffect(() => {
    // Scroll to top if accessing as a standalone page
    if (!selectedScholar && location.pathname === "/bookyourspirtualservice") {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, selectedScholar]);

  // Handle custom tab change events
  useEffect(() => {
    const handleTabChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.tab !== undefined) {
        setValue(customEvent.detail.tab);
      }
    };

    window.addEventListener("changeTab", handleTabChange);
    return () => {
      window.removeEventListener("changeTab", handleTabChange);
    };
  }, []);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      {visibleTabs.length > 0 ? (
        <>
          <Tabs id="PersonalDua"
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            textColor="inherit" // ✅ prevent MUI default blue color
            TabIndicatorProps={{
              sx: { backgroundColor: "#01B732", height: 2 },
            }}
            sx={{
              width: { xs: "100%", sm: "100%", md: "60%" },
              margin: "20px auto 0 auto",
              display: "flex",
              flexWrap: { xs: "wrap", sm: "wrap", md: "nowrap" },
              justifyContent: "center",
              "& .MuiTab-root": {
                color: "black",
                fontWeight: "bold",
                textTransform: "none",
                fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
                flex: { xs: "1 1 50%", sm: "1 1 50%", md: "1 1 25%" },
                maxWidth: "none",
              },
              "& .Mui-selected": {
                color: "#01B732 !important", // ✅ force green
              },
            }}
          >

            {visibleTabs.map((tab) => (
              <Tab key={tab.id} label={tab.label} value={tab.id} />
            ))}
          </Tabs>


          {visibleTabs.map((tab) => (
            value === tab.id && (
              <BookYourSpirtualForm
                key={tab.id}
                activeTab={tab.id}
                selectedScholar={activeScholar}
                onScholarChange={onScholarChange}
                isServiceDisabled={!isServiceAvailable(activeScholar, tab.id)}
              />
            )
          ))}
        </>
      ) : (
        // keeping this structure but visibleTabs should always have length > 0 now
        null
      )}
    </>
  );
};

export default BookYourSpirtualService;
