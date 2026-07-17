import React from "react";
import ScholarHeroImg from "../Components/scholar_Page/ScholarHeroImg";
import TrustBanner from "../Components/home_page/TrustBanner";
import FindScholar from "../Components/scholar_Page/FindScholar";

const ScholarPage: React.FC = () => {
    return <>
    <ScholarHeroImg />
    <TrustBanner />
    <FindScholar />
    </>;
}

export default ScholarPage;