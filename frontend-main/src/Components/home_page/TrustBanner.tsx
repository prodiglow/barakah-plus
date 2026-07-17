import React from "react";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledBanner = styled(Box)(({ theme }) => ({
  backgroundColor: "#f5a623",
  padding: "20px 20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-evenly",
  flexWrap: "wrap",
  gap: "20px",
  [theme.breakpoints.down("md")]: {
    gap: "15px",
    padding: "15px 20px",
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    textAlign: "center",
    gap: "15px",
    padding: "20px 15px",
  },
}));

const Badge = styled(Box)(({ theme }) => ({
 margin: "0 125px",
  display: "flex",
  alignItems: "center",
  color: "#fff",
  fontWeight: "bold",
  flex: "1 1 auto",
  minWidth: "250px",
  justifyContent: "center",
  "& img": {
    marginRight: theme.spacing(1),
    width: "40px",
    height: "40px",
  },
  [theme.breakpoints.down("lg")]: {
    minWidth: "220px",
  },
  [theme.breakpoints.down("md")]: {
    minWidth: "200px",
    "& img": {
      width: "35px",
      height: "35px",
    },
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    minWidth: "100%",
 margin: "0 0",

    justifyContent: "center",
    alignItems: "center",
    padding: "10px 0",
    gap: "8px",
    "& img": {
      width: "35px",
      height: "35px",
      marginRight: "0",
      marginBottom: "0",
    },
  },
  [theme.breakpoints.down("xs")]: {
    gap: "6px",
    padding: "8px 0",
    "& img": {
      width: "30px",
      height: "30px",
    },
  },
}));

const TypographyResponsive = styled(Typography)(({ theme }) => ({
  fontSize: "1.5rem",
  lineHeight: "1.2",
  textAlign: "left",
  marginLeft: "10px",
  width: "100%",
  [theme.breakpoints.down("lg")]: {
    fontSize: "1.4rem",
  },
  [theme.breakpoints.down("md")]: {
    fontSize: "1.3rem",
  },
  [theme.breakpoints.down("sm")]: {
    fontSize: "1.1rem",
    textAlign: "center",
    marginTop: "4px",
  },
  [theme.breakpoints.down("xs")]: {
    fontSize: "1rem",
    textAlign: "center",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  [theme.breakpoints.down("sm")]: {
    marginBottom: "4px",
  },
}));

const TrustBanner: React.FC = () => {
  return (
    <StyledBanner>
      <Badge>
        <IconWrapper>
          <svg
            width="28"
            height="18"
            viewBox="0 0 28 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18.9844 7.75C21.0594 7.75 22.7219 6.075 22.7219 4C22.7219 1.925 21.0594 0.25 18.9844 0.25C16.9094 0.25 15.2344 1.925 15.2344 4C15.2344 6.075 16.9094 7.75 18.9844 7.75ZM8.98438 7.75C11.0594 7.75 12.7219 6.075 12.7219 4C12.7219 1.925 11.0594 0.25 8.98438 0.25C6.90938 0.25 5.23438 1.925 5.23438 4C5.23438 6.075 6.90938 7.75 8.98438 7.75ZM8.98438 10.25C6.07188 10.25 0.234375 11.7125 0.234375 14.625V17.75H17.7344V14.625C17.7344 11.7125 11.8969 10.25 8.98438 10.25ZM18.9844 10.25C18.6219 10.25 18.2094 10.275 17.7719 10.3125C19.2219 11.3625 20.2344 12.775 20.2344 14.625V17.75H27.7344V14.625C27.7344 11.7125 21.8969 10.25 18.9844 10.25Z"
              fill="white"
            />
          </svg>
        </IconWrapper>
        <TypographyResponsive variant="h5">
          Trusted by 300+ people.
        </TypographyResponsive>
      </Badge>
      <Badge>
        <IconWrapper>
          <svg
            width="25"
            height="30"
            viewBox="0 0 25 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_133_2600)">
              <g clipPath="url(#clip1_133_2600)">
                <path
                  d="M23.2891 4.78002C18.4242 4.78002 13.3826 0.270591 13.3327 0.225415C12.9976 -0.0783935 12.4868 -0.0783935 12.1518 0.225415C12.1016 0.270942 7.07312 4.78002 2.19531 4.78002C1.70992 4.78002 1.31641 5.17354 1.31641 5.65893V16.1846C1.31641 24.7114 7.65835 28.1186 12.4288 29.9398C12.5297 29.9783 12.6359 29.9975 12.7422 29.9975C12.8485 29.9975 12.9548 29.9783 13.0557 29.9398C19.7444 27.3863 24.168 23.4031 24.168 16.1846V5.65893C24.168 5.17354 23.7745 4.78002 23.2891 4.78002Z"
                  fill="white"
                />
                <path
                  d="M12.5977 7.3457C8.46216 7.3457 5.09766 10.7102 5.09766 14.8457C5.09766 18.9812 8.46216 22.3457 12.5977 22.3457C16.7332 22.3457 20.0977 18.9812 20.0977 14.8457C20.0977 10.7102 16.7332 7.3457 12.5977 7.3457ZM15.4981 14.5318L12.2838 17.7461C12.0747 17.9553 11.8005 18.06 11.5263 18.06C11.2521 18.06 10.9778 17.9554 10.7687 17.7461L9.69723 16.6747C9.2788 16.2563 9.2788 15.5779 9.69723 15.1595C10.1156 14.7411 10.794 14.7411 11.2125 15.1595L11.5263 15.4733L13.9831 13.0166C14.4014 12.5982 15.0798 12.5982 15.4983 13.0166C15.9166 13.4351 15.9166 14.1134 15.4981 14.5318Z"
                  fill="#F99724"
                />
              </g>
            </g>
            <defs>
              <clipPath id="clip0_133_2600">
                <rect
                  width="24"
                  height="30"
                  fill="white"
                  transform="translate(0.957031)"
                />
              </clipPath>
              <clipPath id="clip1_133_2600">
                <rect
                  width="24"
                  height="30"
                  fill="white"
                  transform="translate(0.957031)"
                />
              </clipPath>
            </defs>
          </svg>
        </IconWrapper>
        <TypographyResponsive variant="h5">
          100% Secure.
        </TypographyResponsive>
      </Badge>
      <Badge>
        <IconWrapper>
          <svg
            width="27"
            height="30"
            viewBox="0 0 27 30"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.07467 19.2886L0.23745 24.9621C0.10104 25.2347 0.11569 25.5586 0.27568 25.8177C0.43612 26.0765 0.71856 26.2342 1.0232 26.2342H5.29116L7.85189 29.6485C8.01829 29.8712 8.27943 30 8.55433 30C8.91943 30 9.20713 29.7821 9.34073 29.5143L12.0143 24.167C8.39963 23.8214 5.21266 21.9885 3.07467 19.2886Z"
              fill="white"
            />
            <path
              d="M26.2846 24.9621L23.4474 19.2886C21.3094 21.9885 18.1225 23.8214 14.5078 24.167L17.1816 29.5143C17.315 29.7821 17.6027 30 17.9678 30C18.2427 30 18.504 29.8712 18.6704 29.6485L21.2309 26.2342H25.4989C25.8035 26.2342 26.086 26.0765 26.2464 25.8177C26.4064 25.5586 26.4211 25.2347 26.2846 24.9621Z"
              fill="white"
            />
            <path
              d="M24.4962 11.2344C24.4962 5.03975 19.4564 0 13.2617 0C7.06709 0 2.02734 5.03975 2.02734 11.2344C2.02734 17.4289 7.06709 22.4689 13.2617 22.4689C19.4564 22.4689 24.4962 17.4291 24.4962 11.2344ZM14.5911 15.9414C14.5911 16.4268 14.1976 16.8203 13.7122 16.8203C13.227 16.8203 12.8333 16.4268 12.8333 15.9414V8.65997L11.5319 9.97078C11.1899 10.3152 10.6335 10.3173 10.289 9.97513C9.94463 9.63318 9.94253 9.07677 10.2845 8.7323L13.0885 5.90813C13.3393 5.65544 13.7179 5.57899 14.047 5.71472C14.3762 5.85045 14.5911 6.17134 14.5911 6.52725V15.9414Z"
              fill="white"
            />
          </svg>
        </IconWrapper>
        <TypographyResponsive variant="h5">
          Pakistan's Largest App for Muslims Devotees.
        </TypographyResponsive>
      </Badge>
    </StyledBanner>
  );
};

export default TrustBanner;