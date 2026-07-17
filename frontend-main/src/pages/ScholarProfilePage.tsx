import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ScholarDetails from "../Components/scholar_profile/ScholarDetails";
import { fetchScholarById } from "../services/scholarService";
import { Scholar } from "../types/Scholars";

const ScholarProfilePage: React.FC = () => {
  const { scholarId } = useParams<{ scholarId: string }>(); // get scholarId from URL
  const [scholar, setScholar] = useState<Scholar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getScholar = async () => {
      try {
        if (!scholarId) return;
        const data = await fetchScholarById(Number(scholarId));
        setScholar(data);
      } catch (err) {
        console.error("Error fetching scholar:", err);
        setError("Failed to fetch scholar details.");
      } finally {
        setLoading(false);
      }
    };

    getScholar();
  }, [scholarId]);

  if (loading) return <div>Loading scholar details...</div>;
  if (error) return <div>{error}</div>;
  if (!scholar) return <div>Scholar not found.</div>;

  return <ScholarDetails scholar={scholar} />;
};

export default ScholarProfilePage;
