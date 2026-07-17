import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Chip,
  Grid,
  Button,
  LinearProgress,
  Paper,
} from "@mui/material";
import VerifiedIcon from "@mui/icons-material/Verified";
import { Breadcrumbs, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Scholar } from "../../types/Scholars";
import { useNavigate } from "react-router-dom";

interface ScholarDetailsProps {
  scholar: Scholar;
}

const ScholarDetails: React.FC<ScholarDetailsProps> = ({ scholar }) => {
  const navigate = useNavigate();
  const [showAllReviews, setShowAllReviews] = React.useState(false);

  // Calculate dynamic stats from approved reviews
  const totalRating = scholar.reviews.reduce((acc, rev) => acc + rev.rating, 0);
  const averageRating = scholar.reviews.length > 0 ? totalRating / scholar.reviews.length : 0;
  const satisfactionPercentage = scholar.reviews.length > 0 ? Math.round((averageRating / 5) * 100) : 0;

  return (
    <Paper elevation={3} sx={{ pt: 10, pb: 20, maxWidth: 2000 }}>

      <Grid container spacing={4} width="85%" alignItems="center" mx="auto" mb={2}>
        {/* Left - Avatar & Basic Info */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
            sx={{ mb: 2 }}
          >
            <Link
              underline="hover"
              color="black"
              href="/home-baraka"
              fontSize={14}
            >
              HOME
            </Link>
            <Link
              underline="hover"
              color="black"
              href="/scholars"
              fontSize={14}

            >
              SCHOLARS
            </Link>
            <Typography fontSize={14} color="text.secondary" >
              {scholar.scholarName.toUpperCase()}
            </Typography>
          </Breadcrumbs>
        </Grid>

      </Grid>
      {/* Top Section */}
      <Grid container spacing={4} width="85%" alignItems="center" mx="auto">
        {/* Left - Avatar & Basic Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              alt={scholar.scholarName}
              src={scholar.ProfileImg}
              sx={{ width: 110, height: 110 }}
            />
            <Box>
              <svg
                width="176"
                height="28"
                viewBox="0 0 196 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_190_1991)">
                  <g clip-path="url(#clip1_190_1991)">
                    <g clip-path="url(#clip2_190_1991)">
                      <path
                        d="M182.667 5H14.6289C8.00149 5 2.62891 10.3726 2.62891 17C2.62891 23.6274 8.00149 29 14.6289 29H182.667C189.294 29 194.667 23.6274 194.667 17C194.667 10.3726 189.294 5 182.667 5Z"
                        fill="url(#paint0_linear_190_1991)"
                      />
                      <path
                        d="M81.2383 28.9996L102.749 4.99805L127.759 4.99878L105.555 28.9996H81.2383Z"
                        fill="white"
                        fill-opacity="0.13"
                      />
                      <g filter="url(#filter0_i_190_1991)">
                        <path
                          d="M17.2991 0.0273338C17.5189 0.00911787 17.7399 0.00911791 17.9597 0.0273339L20.0972 0.204449C20.317 0.222665 20.535 0.259035 20.7488 0.313186L22.828 0.839703C23.0418 0.893855 23.2508 0.965602 23.4528 1.05421L25.417 1.91576C25.619 2.00437 25.8133 2.10954 25.998 2.23019L27.7935 3.40328C27.9782 3.52394 28.1526 3.65966 28.3149 3.80906L29.8929 5.26169C30.0551 5.41109 30.2048 5.57366 30.3403 5.74773L31.6576 7.44028C31.7931 7.61436 31.914 7.79934 32.019 7.99334L33.0398 9.87964C33.1448 10.0737 33.2335 10.276 33.3052 10.4847L34.0016 12.5133C34.0732 12.7219 34.1275 12.9361 34.1638 13.1537L34.5168 15.2692C34.5531 15.4868 34.5713 15.707 34.5713 15.9276V18.0724C34.5713 18.293 34.5531 18.5132 34.5168 18.7308L34.1638 20.8463C34.1275 21.0639 34.0732 21.2781 34.0016 21.4867L33.3052 23.5153C33.2335 23.724 33.1448 23.9263 33.0398 24.1203L32.019 26.0066C31.914 26.2006 31.7931 26.3856 31.6576 26.5597L30.3403 28.2522C30.2048 28.4263 30.0551 28.5889 29.8929 28.7383L28.3149 30.1909C28.1526 30.3403 27.9782 30.476 27.7935 30.5967L25.998 31.7698C25.8133 31.8904 25.619 31.9956 25.417 32.0842L23.4528 32.9458C23.2508 33.0344 23.0418 33.1061 22.828 33.1603L20.7488 33.6868C20.535 33.7409 20.317 33.7773 20.0972 33.7955L17.9597 33.9726C17.7399 33.9908 17.5189 33.9908 17.2991 33.9726L15.1616 33.7955C14.9418 33.7773 14.7238 33.7409 14.51 33.6868L12.4308 33.1603C12.217 33.1061 12.008 33.0344 11.806 32.9458L9.84186 32.0842C9.63986 31.9956 9.44553 31.8904 9.26086 31.7698L7.4653 30.5967C7.28063 30.476 7.10626 30.3403 6.94397 30.1909L5.36599 28.7383C5.2037 28.5889 5.05404 28.4263 4.91855 28.2522L3.60119 26.5597C3.4657 26.3856 3.34485 26.2006 3.23986 26.0066L2.21905 24.1203C2.11406 23.9263 2.0253 23.724 1.95367 23.5153L1.25725 21.4867C1.18563 21.2781 1.13138 21.0639 1.09508 20.8463L0.742054 18.7308C0.705747 18.5132 0.6875 18.293 0.6875 18.0724V15.9276C0.6875 15.707 0.705747 15.4868 0.742054 15.2692L1.09508 13.1537C1.13138 12.9361 1.18563 12.7219 1.25725 12.5133L1.95367 10.4847C2.0253 10.276 2.11406 10.0737 2.21905 9.87964L3.23986 7.99334C3.34485 7.79934 3.4657 7.61436 3.60119 7.44028L4.91855 5.74773C5.05404 5.57366 5.2037 5.41109 5.36599 5.26169L6.94397 3.80906C7.10626 3.65966 7.28063 3.52394 7.4653 3.40328L9.26086 2.23019C9.44553 2.10954 9.63986 2.00437 9.84187 1.91576L11.806 1.05421C12.008 0.965602 12.217 0.893855 12.4308 0.839703L14.51 0.313186C14.7238 0.259035 14.9418 0.222665 15.1616 0.204449L17.2991 0.0273338Z"
                          fill="url(#paint1_linear_190_1991)"
                        />
                      </g>
                      <g filter="url(#filter1_i_190_1991)">
                        <path
                          d="M17.2982 2.02734C17.518 2.00912 17.739 2.00912 17.9588 2.02734L19.7671 2.17718C19.9869 2.1954 20.2049 2.23177 20.4187 2.28592L22.1777 2.73135C22.3915 2.7855 22.6005 2.85724 22.8025 2.94585L24.4642 3.67472C24.6662 3.76333 24.8605 3.8685 25.0452 3.98915L26.5642 4.98158C26.7489 5.10223 26.9233 5.23795 27.0855 5.38735L28.4205 6.61626C28.5828 6.76566 28.7325 6.92823 28.8679 7.10231L29.9824 8.53419C30.1179 8.70826 30.2388 8.89325 30.3438 9.08725L31.2073 10.6831C31.3123 10.8771 31.4011 11.0794 31.4727 11.2881L32.0619 13.0042C32.1335 13.2129 32.1878 13.4271 32.2241 13.6446L32.5227 15.4344C32.559 15.652 32.5773 15.8722 32.5773 16.0928V17.9072C32.5773 18.1278 32.559 18.348 32.5227 18.5656L32.2241 20.3554C32.1878 20.5729 32.1335 20.7871 32.0619 20.9958L31.4727 22.7119C31.4011 22.9206 31.3123 23.1229 31.2073 23.3169L30.3438 24.9127C30.2388 25.1067 30.1179 25.2917 29.9824 25.4658L28.8679 26.8977C28.7325 27.0717 28.5828 27.2343 28.4205 27.3837L27.0856 28.6126C26.9233 28.762 26.7489 28.8977 26.5642 29.0184L25.0452 30.0108C24.8605 30.1315 24.6662 30.2366 24.4642 30.3252L22.8025 31.0541C22.6005 31.1427 22.3915 31.2145 22.1777 31.2686L20.4187 31.7141C20.2049 31.7682 19.9869 31.8046 19.7671 31.8228L17.9588 31.9726C17.739 31.9908 17.518 31.9908 17.2982 31.9726L15.4899 31.8228C15.2701 31.8046 15.0521 31.7682 14.8383 31.7141L13.0793 31.2686C12.8655 31.2145 12.6565 31.1427 12.4545 31.0541L10.7928 30.3252C10.5908 30.2366 10.3964 30.1315 10.2118 30.0108L8.69275 29.0184C8.50808 28.8977 8.33371 28.762 8.17141 28.6126L6.83646 27.3837C6.67416 27.2343 6.52451 27.0717 6.38902 26.8977L5.27454 25.4658C5.13906 25.2917 5.0182 25.1067 4.91321 24.9127L4.04961 23.3169C3.94462 23.1229 3.85586 22.9206 3.78424 22.7119L3.19508 20.9958C3.12345 20.7871 3.06921 20.5729 3.0329 20.3554L2.73425 18.5656C2.69794 18.348 2.67969 18.1278 2.67969 17.9072V16.0928C2.67969 15.8722 2.69794 15.652 2.73425 15.4344L3.0329 13.6446C3.06921 13.4271 3.12345 13.2129 3.19508 13.0042L3.78424 11.2881C3.85586 11.0794 3.94462 10.8771 4.04961 10.6831L4.91321 9.08725C5.0182 8.89325 5.13906 8.70826 5.27454 8.53419L6.38902 7.10231C6.52451 6.92823 6.67416 6.76566 6.83646 6.61626L8.17141 5.38735C8.33371 5.23795 8.50808 5.10223 8.69275 4.98158L10.2118 3.98915C10.3964 3.8685 10.5908 3.76333 10.7928 3.67472L12.4545 2.94585C12.6565 2.85724 12.8655 2.7855 13.0793 2.73135L14.8383 2.28592C15.0521 2.23177 15.2701 2.1954 15.4899 2.17718L17.2982 2.02734Z"
                          fill="url(#paint2_linear_190_1991)"
                        />
                      </g>
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M17.4829 11.0132C17.369 11.0442 17.2534 11.1117 17.1775 11.1915C17.1414 11.2296 16.4318 12.2941 15.6007 13.5571C14.7124 14.9071 14.0729 15.8536 14.049 15.8538C14.0266 15.854 13.5136 15.7596 12.9091 15.644C11.6616 15.4054 11.568 15.3989 11.3561 15.5363C11.1912 15.6433 11.0825 15.8245 11.0637 16.0241C11.0509 16.1598 11.1299 16.4691 11.9007 19.3019C12.3688 21.0222 12.7714 22.4861 12.7953 22.5549C12.8192 22.6237 12.8877 22.7318 12.9475 22.7951C13.155 23.0148 12.812 22.9998 17.6287 22.9998C22.4454 22.9998 22.1024 23.0148 22.3099 22.7951C22.3697 22.7318 22.4382 22.6237 22.4621 22.5549C22.486 22.4861 22.8886 21.0222 23.3567 19.3019C24.1275 16.4691 24.2065 16.1598 24.1938 16.0241C24.1643 15.7115 23.9232 15.4654 23.6244 15.443C23.515 15.4347 23.1728 15.4892 22.3683 15.6429C21.7602 15.7591 21.2413 15.854 21.2152 15.8538C21.1829 15.8536 20.9737 15.5583 20.5601 14.9294C18.0853 11.1651 18.088 11.1691 17.9534 11.0923C17.8158 11.0137 17.6089 10.9789 17.4829 11.0132Z"
                        fill="white"
                      />
                      <path
                        d="M180.63 22.8327C183.852 22.8327 186.464 20.221 186.464 16.9993C186.464 13.7777 183.852 11.166 180.63 11.166C177.409 11.166 174.797 13.7777 174.797 16.9993C174.797 20.221 177.409 22.8327 180.63 22.8327Z"
                        stroke="white"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M180.629 14.666V16.9993"
                        stroke="white"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M180.629 19.334H180.634"
                        stroke="white"
                        stroke-width="1.2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <g filter="url(#filter2_d_190_1991)">
                        <path
                          d="M45.102 13.0825C46.1154 13.0825 46.8548 13.3009 47.3203 13.7378C47.7858 14.1711 48.0185 14.769 48.0185 15.5317C48.0185 15.8755 47.9666 16.2049 47.8628 16.52C47.7589 16.8315 47.5889 17.109 47.3525 17.3525C47.1198 17.596 46.8083 17.7894 46.418 17.9326C46.0277 18.0723 45.5461 18.1421 44.9731 18.1421H44.2589V20.9351H42.5938V13.0825H45.102ZM45.0161 14.4468H44.2589V16.7778H44.8066C45.1182 16.7778 45.3885 16.7367 45.6177 16.6543C45.8468 16.5719 46.0241 16.443 46.1494 16.2676C46.2747 16.0921 46.3374 15.8665 46.3374 15.5908C46.3374 15.2041 46.23 14.9176 46.0151 14.7314C45.8003 14.5417 45.4673 14.4468 45.0161 14.4468Z"
                          fill="white"
                        />
                        <path
                          d="M51 20.9351V13.0825H52.665V19.5601H55.8501V20.9351H51Z"
                          fill="white"
                        />
                        <path
                          d="M63.5298 20.9351L62.9605 19.0659H60.0977L59.5284 20.9351H57.7344L60.5059 13.0503H62.5415L65.3238 20.9351H63.5298ZM62.563 17.6694L61.9937 15.8433C61.9579 15.7215 61.9095 15.5658 61.8487 15.376C61.7914 15.1826 61.7323 14.9875 61.6714 14.7905C61.6141 14.59 61.5676 14.4163 61.5318 14.2695C61.496 14.4163 61.4458 14.599 61.3814 14.8174C61.3205 15.0322 61.2614 15.2363 61.2041 15.4297C61.1469 15.623 61.1057 15.7609 61.0806 15.8433L60.5166 17.6694H62.563Z"
                          fill="white"
                        />
                        <path
                          d="M70.8442 20.9351H69.1792V14.4683H67.0469V13.0825H72.9765V14.4683H70.8442V20.9351Z"
                          fill="white"
                        />
                        <path
                          d="M75.6875 20.9351V13.0825H77.3526V20.9351H75.6875Z"
                          fill="white"
                        />
                        <path
                          d="M87.7945 20.9351H85.6782L82.2622 14.9946H82.2139C82.2282 15.2417 82.2407 15.4906 82.2515 15.7412C82.2622 15.9919 82.273 16.2425 82.2837 16.4932C82.2945 16.7402 82.3052 16.9891 82.3159 17.2397V20.9351H80.8281V13.0825H82.9282L86.3389 18.9639H86.3765C86.3693 18.7204 86.3604 18.4787 86.3496 18.2388C86.3389 17.9989 86.3281 17.759 86.3174 17.519C86.3102 17.2791 86.3031 17.0392 86.2959 16.7993V13.0825H87.7945V20.9351Z"
                          fill="white"
                        />
                        <path
                          d="M97.668 13.0825V18.1636C97.668 18.7043 97.548 19.193 97.3081 19.6299C97.0718 20.0632 96.7119 20.4069 96.2285 20.6611C95.7487 20.9154 95.1436 21.0425 94.4131 21.0425C93.3747 21.0425 92.5833 20.7775 92.0391 20.2476C91.4948 19.7176 91.2227 19.0158 91.2227 18.1421V13.0825H92.8823V17.8896C92.8823 18.5378 93.0148 18.9925 93.2798 19.2539C93.5448 19.5153 93.9369 19.646 94.4561 19.646C94.8213 19.646 95.1167 19.5833 95.3423 19.458C95.5715 19.3327 95.7398 19.1393 95.8472 18.8779C95.9546 18.6165 96.0083 18.2835 96.0083 17.8789V13.0825H97.668Z"
                          fill="white"
                        />
                        <path
                          d="M104.415 20.9351L102.524 14.7744H102.476C102.483 14.9212 102.494 15.1432 102.508 15.4404C102.526 15.734 102.542 16.0474 102.556 16.3804C102.571 16.7134 102.578 17.0142 102.578 17.2827V20.9351H101.09V13.0825H103.357L105.215 19.0874H105.247L107.218 13.0825H109.485V20.9351H107.933V17.2183C107.933 16.9712 107.936 16.6865 107.943 16.3643C107.954 16.042 107.967 15.7358 107.981 15.4458C107.995 15.1522 108.006 14.932 108.013 14.7852H107.965L105.94 20.9351H104.415Z"
                          fill="white"
                        />
                      </g>
                      <g filter="url(#filter3_d_190_1991)">
                        <path
                          d="M120.137 15.1992C120.1 14.8581 119.947 14.5924 119.676 14.4023C119.408 14.2122 119.059 14.1172 118.629 14.1172C118.327 14.1172 118.068 14.1628 117.852 14.2539C117.635 14.3451 117.47 14.4687 117.355 14.625C117.241 14.7812 117.182 14.9596 117.18 15.1602C117.18 15.3268 117.217 15.4714 117.293 15.5937C117.371 15.7161 117.477 15.8203 117.609 15.9062C117.742 15.9896 117.889 16.0599 118.051 16.1172C118.212 16.1745 118.375 16.2227 118.539 16.2617L119.289 16.4492C119.591 16.5195 119.882 16.6146 120.16 16.7344C120.441 16.8542 120.693 17.0052 120.914 17.1875C121.138 17.3698 121.315 17.5898 121.445 17.8477C121.576 18.1055 121.641 18.4076 121.641 18.7539C121.641 19.2227 121.521 19.6354 121.281 19.9922C121.042 20.3464 120.695 20.6237 120.242 20.8242C119.792 21.0221 119.246 21.1211 118.605 21.1211C117.983 21.1211 117.443 21.0247 116.984 20.832C116.529 20.6393 116.172 20.3581 115.914 19.9883C115.659 19.6185 115.521 19.168 115.5 18.6367H116.926C116.947 18.9154 117.033 19.1471 117.184 19.332C117.335 19.5169 117.531 19.6549 117.773 19.7461C118.018 19.8372 118.292 19.8828 118.594 19.8828C118.909 19.8828 119.185 19.8359 119.422 19.7422C119.661 19.6458 119.849 19.513 119.984 19.3437C120.12 19.1719 120.189 18.9714 120.191 18.7422C120.189 18.5339 120.128 18.362 120.008 18.2266C119.888 18.0885 119.72 17.974 119.504 17.8828C119.29 17.7891 119.04 17.7057 118.754 17.6328L117.844 17.3984C117.185 17.2292 116.664 16.9727 116.281 16.6289C115.901 16.2826 115.711 15.8229 115.711 15.25C115.711 14.7786 115.839 14.3659 116.094 14.0117C116.352 13.6576 116.702 13.3828 117.145 13.1875C117.587 12.9896 118.089 12.8906 118.648 12.8906C119.216 12.8906 119.714 12.9896 120.141 13.1875C120.57 13.3828 120.908 13.6549 121.152 14.0039C121.397 14.3503 121.523 14.7487 121.531 15.1992H120.137ZM129.78 15.6992H128.319C128.278 15.4596 128.201 15.2474 128.089 15.0625C127.977 14.875 127.838 14.7161 127.671 14.5859C127.504 14.4557 127.314 14.3581 127.101 14.293C126.89 14.2253 126.662 14.1914 126.417 14.1914C125.982 14.1914 125.597 14.3008 125.261 14.5195C124.925 14.7357 124.662 15.0534 124.472 15.4727C124.282 15.8893 124.187 16.3984 124.187 17C124.187 17.612 124.282 18.1276 124.472 18.5469C124.664 18.9635 124.927 19.2786 125.261 19.4922C125.597 19.7031 125.981 19.8086 126.413 19.8086C126.653 19.8086 126.877 19.7773 127.085 19.7148C127.296 19.6497 127.485 19.5547 127.651 19.4297C127.821 19.3047 127.963 19.151 128.077 18.9687C128.194 18.7865 128.275 18.5781 128.319 18.3437L129.78 18.3516C129.726 18.7318 129.607 19.0885 129.425 19.4219C129.245 19.7552 129.009 20.0495 128.718 20.3047C128.426 20.5573 128.085 20.7552 127.694 20.8984C127.304 21.0391 126.87 21.1094 126.394 21.1094C125.69 21.1094 125.063 20.9466 124.511 20.6211C123.959 20.2956 123.524 19.8255 123.206 19.2109C122.888 18.5964 122.729 17.8594 122.729 17C122.729 16.138 122.89 15.401 123.21 14.7891C123.53 14.1745 123.966 13.7044 124.519 13.3789C125.071 13.0534 125.696 12.8906 126.394 12.8906C126.839 12.8906 127.253 12.9531 127.636 13.0781C128.019 13.2031 128.36 13.3867 128.659 13.6289C128.959 13.8685 129.205 14.1628 129.397 14.5117C129.593 14.8581 129.72 15.2539 129.78 15.6992ZM131.107 21V13H132.557V16.3867H136.264V13H137.717V21H136.264V17.6016H132.557V21H131.107ZM146.441 17C146.441 17.862 146.28 18.6003 145.957 19.2148C145.637 19.8268 145.199 20.2956 144.645 20.6211C144.092 20.9466 143.466 21.1094 142.766 21.1094C142.065 21.1094 141.438 20.9466 140.883 20.6211C140.331 20.293 139.893 19.8229 139.57 19.2109C139.25 18.5964 139.09 17.8594 139.09 17C139.09 16.138 139.25 15.401 139.57 14.7891C139.893 14.1745 140.331 13.7044 140.883 13.3789C141.438 13.0534 142.065 12.8906 142.766 12.8906C143.466 12.8906 144.092 13.0534 144.645 13.3789C145.199 13.7044 145.637 14.1745 145.957 14.7891C146.28 15.401 146.441 16.138 146.441 17ZM144.984 17C144.984 16.3932 144.889 15.8815 144.699 15.4648C144.512 15.0456 144.251 14.7292 143.918 14.5156C143.585 14.2995 143.201 14.1914 142.766 14.1914C142.331 14.1914 141.947 14.2995 141.613 14.5156C141.28 14.7292 141.018 15.0456 140.828 15.4648C140.641 15.8815 140.547 16.3932 140.547 17C140.547 17.6068 140.641 18.1198 140.828 18.5391C141.018 18.9557 141.28 19.2721 141.613 19.4883C141.947 19.7018 142.331 19.8086 142.766 19.8086C143.201 19.8086 143.585 19.7018 143.918 19.4883C144.251 19.2721 144.512 18.9557 144.699 18.5391C144.889 18.1198 144.984 17.6068 144.984 17ZM147.812 21V13H149.261V19.7852H152.784V21H147.812ZM155.37 21H153.823L156.64 13H158.429L161.249 21H159.702L157.565 14.6406H157.503L155.37 21ZM155.421 17.8633H159.64V19.0273H155.421V17.8633ZM162.303 21V13H165.303C165.917 13 166.433 13.1068 166.85 13.3203C167.269 13.5339 167.585 13.8333 167.799 14.2187C168.015 14.6016 168.123 15.0482 168.123 15.5586C168.123 16.0716 168.014 16.5169 167.795 16.8945C167.579 17.2695 167.26 17.5599 166.838 17.7656C166.416 17.9687 165.898 18.0703 165.283 18.0703H163.146V16.8672H165.088C165.447 16.8672 165.742 16.8177 165.971 16.7187C166.2 16.6172 166.369 16.4701 166.479 16.2773C166.59 16.082 166.646 15.8424 166.646 15.5586C166.646 15.2747 166.59 15.0326 166.479 14.832C166.367 14.6289 166.196 14.4753 165.967 14.3711C165.738 14.2643 165.442 14.2109 165.08 14.2109H163.752V21H162.303ZM166.436 17.375L168.416 21H166.799L164.854 17.375H166.436Z"
                          fill="white"
                        />
                      </g>
                    </g>
                  </g>
                </g>
                <defs>
                  <filter
                    id="filter0_i_190_1991"
                    x="0.6875"
                    y="0.0136719"
                    width="33.8828"
                    height="35.9725"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="2" />
                    <feGaussianBlur stdDeviation="1" />
                    <feComposite
                      in2="hardAlpha"
                      operator="arithmetic"
                      k2="-1"
                      k3="1"
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="shape"
                      result="effect1_innerShadow_190_1991"
                    />
                  </filter>
                  <filter
                    id="filter1_i_190_1991"
                    x="2.67969"
                    y="2.01367"
                    width="29.8984"
                    height="31.9725"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="BackgroundImageFix"
                      result="shape"
                    />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="2" />
                    <feGaussianBlur stdDeviation="1" />
                    <feComposite
                      in2="hardAlpha"
                      operator="arithmetic"
                      k2="-1"
                      k3="1"
                    />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="shape"
                      result="effect1_innerShadow_190_1991"
                    />
                  </filter>
                  <filter
                    id="filter2_d_190_1991"
                    x="41.5938"
                    y="13.0503"
                    width="68.8906"
                    height="9.99219"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="1" />
                    <feGaussianBlur stdDeviation="0.5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_190_1991"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_190_1991"
                      result="shape"
                    />
                  </filter>
                  <filter
                    id="filter3_d_190_1991"
                    x="114.5"
                    y="12.8906"
                    width="54.9141"
                    height="10.2305"
                    filterUnits="userSpaceOnUse"
                    color-interpolation-filters="sRGB"
                  >
                    <feFlood flood-opacity="0" result="BackgroundImageFix" />
                    <feColorMatrix
                      in="SourceAlpha"
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                      result="hardAlpha"
                    />
                    <feOffset dy="1" />
                    <feGaussianBlur stdDeviation="0.5" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix
                      type="matrix"
                      values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    />
                    <feBlend
                      mode="normal"
                      in2="BackgroundImageFix"
                      result="effect1_dropShadow_190_1991"
                    />
                    <feBlend
                      mode="normal"
                      in="SourceGraphic"
                      in2="effect1_dropShadow_190_1991"
                      result="shape"
                    />
                  </filter>
                  <linearGradient
                    id="paint0_linear_190_1991"
                    x1="2.62891"
                    y1="17.012"
                    x2="242.833"
                    y2="17.012"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#B46A11" />
                    <stop offset="0.3198" stop-color="#D68D15" />
                    <stop offset="0.6802" stop-color="#E7AC18" />
                    <stop offset="1" stop-color="#F8C73D" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_190_1991"
                    x1="-1.87056"
                    y1="-3.79138e-05"
                    x2="36.6294"
                    y2="40"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#FFC725" />
                    <stop offset="1" stop-color="#DE9E0D" />
                  </linearGradient>
                  <linearGradient
                    id="paint2_linear_190_1991"
                    x1="-8.87393"
                    y1="-6.71906"
                    x2="32.6285"
                    y2="27.832"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#E7AC18" />
                    <stop offset="0.584838" stop-color="#D68D15" />
                    <stop offset="1" stop-color="#F8C73D" />
                  </linearGradient>
                  <clipPath id="clip0_190_1991">
                    <rect
                      width="195"
                      height="34"
                      fill="white"
                      transform="translate(0.628906)"
                    />
                  </clipPath>
                  <clipPath id="clip1_190_1991">
                    <rect
                      width="195"
                      height="34"
                      fill="white"
                      transform="translate(0.628906)"
                    />
                  </clipPath>
                  <clipPath id="clip2_190_1991">
                    <rect
                      width="195"
                      height="34"
                      fill="white"
                      transform="translate(0.628906)"
                    />
                  </clipPath>
                </defs>
              </svg>

              <Typography variant="h5" fontWeight="bold">
                {scholar.scholarName}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <VerifiedIcon color="success" fontSize="small" />
                <Typography variant="body2" color="text.secondary">
                  Pay-to-pray Verified
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {scholar.scholarSpecialization.map(spec => spec.name).join(", ")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {scholar.scholarEducation.map(spec => spec.name).join(", ")}
              </Typography>
              <Box mt={1} display="flex" gap={4}>
                {/* Left block: Experience */}
                <Box textAlign="center">
                  <Typography variant="h6" fontWeight="bold">
                    {scholar.scholarExperience} Years
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Experience
                  </Typography>
                </Box>

                {/* Right block: Rating and reviews */}
                <Box
                  textAlign="center"
                  display="flex"
                  alignItems="center"
                  gap={1}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold" component="span">
                      <svg
                        width="14"
                        height="13"
                        viewBox="0 0 14 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.4375 10.2395L10.5899 12.0811C11.1672 12.4186 11.8737 11.9197 11.7217 11.2887L10.8862 7.82576L13.6739 5.49264C14.1829 5.06711 13.9094 4.26005 13.241 4.20869L9.57202 3.90788L8.13635 0.635654C7.87808 0.0413704 6.99692 0.0413704 6.73865 0.635654L5.30298 3.90055L1.63404 4.20136C0.965574 4.25272 0.692112 5.05977 1.20105 5.4853L3.98884 7.81842L3.15327 11.2814C3.00134 11.9123 3.70779 12.4112 4.28509 12.0737L7.4375 10.2395Z"
                          fill="#FFB955"
                        />
                      </svg>
                      &nbsp;
                      {averageRating.toFixed(1)} ({scholar.reviews.length})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Reviews
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Right - Services */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              mb={2}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <svg
                width="25"
                height="25"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.5 0.5C15.7054 0.5 18.7188 1.74809 20.9854 4.01465C23.2519 6.28121 24.5 9.29459 24.5 12.5C24.5 15.7054 23.2519 18.7188 20.9854 20.9854C18.7188 23.2519 15.7054 24.5 12.5 24.5C11.5424 24.5 10.5958 24.3865 9.67773 24.165C7.43725 23.6245 4.95465 23.2012 2.62793 23.9766L1.14941 24.4697L1.13184 24.4756C1.08238 24.4919 1.03107 24.4999 0.980469 24.5C0.855167 24.5 0.732284 24.451 0.640625 24.3594C0.512522 24.2313 0.467471 24.0408 0.524414 23.8682L1.02344 22.3721C1.79884 20.0453 1.3755 17.5628 0.834961 15.3223C0.613489 14.4042 0.5 13.4576 0.5 12.5C0.5 9.29455 1.74859 6.28121 4.01465 4.01465C6.2812 1.74808 9.29455 0.5 12.5 0.5ZM9.62012 8.66016C7.49934 8.66016 5.78027 10.3792 5.78027 12.5C5.78027 14.6208 7.49934 16.3398 9.62012 16.3398H13.1367C14.3988 16.3397 15.4219 15.3168 15.4219 14.0547L15.8789 14.3428C17.3298 15.2577 19.2197 14.2153 19.2197 12.5C19.2197 10.7847 17.3298 9.74234 15.8789 10.6572L15.4219 10.9453C15.4219 9.68325 14.3988 8.66028 13.1367 8.66016H9.62012Z"
                  fill="url(#paint0_linear_190_2492)"
                  stroke="#399477"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_190_2492"
                    x1="12.5"
                    y1="0"
                    x2="12.5"
                    y2="25"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="#0A9E6F" />
                    <stop offset="0.4904" stopColor="#098B62" />
                    <stop offset="1" stopColor="#087955" />
                  </linearGradient>
                </defs>
              </svg>
              <span style={{ marginLeft: "8px" }}>Services Offered</span>
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={1} mb={2} py={5}>
              {scholar.scholarServices?.filter((service) =>
                !["quran khwani", "quran khawani", "istikhara", "isthekhara"].some(hidden => service.name.toLowerCase().includes(hidden))
              ).map((service) => (
                <Chip
                  key={service._id}
                  label={service.name}
                  sx={{
                    border: "1px solid green",
                    color: "green",
                    background: "white",
                  }}
                />
              ))}
            </Box>


            <Button
              fullWidth
              variant="contained"
              sx={{
                background: "linear-gradient(180deg, #0A9E6F 0%, #098B62 49.04%, #087955 100%)",
                color: "white",
                "&:hover": {
                  background: "linear-gradient(180deg, #087955 0%, #076b4b 49.04%, #065c41 100%)"
                }
              }}
              onClick={() => {
                navigate("/bookyourspirtualservice", { state: { bookScholar: scholar } });
              }}
            >
              <svg
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.98 10.0534C12.98 10.1699 12.9166 10.2771 12.8146 10.3334C12.7125 10.3898 12.588 10.3862 12.4894 10.3238L10.4478 9.03648V10.24C10.4478 10.4166 10.3045 10.56 10.1278 10.56H4.34C4.16336 10.56 4.02 10.4166 4.02 10.24V5.75999C4.02 5.58335 4.16336 5.44 4.34 5.44H10.1278C10.3045 5.44 10.4478 5.58335 10.4478 5.75999V6.96351L12.4894 5.67616C12.588 5.61376 12.7125 5.61024 12.8146 5.66656C12.9166 5.72288 12.98 5.83008 12.98 5.94656V10.0534ZM14.157 2.34304C12.646 0.832 10.637 0 8.5 0C6.36304 0 4.35408 0.832 2.84304 2.34304C1.33232 3.85408 0.5 5.86304 0.5 7.99999C0.5 9.46943 0.90032 10.9008 1.65936 12.1498L0.51632 15.5789C0.47824 15.6938 0.508 15.8205 0.59376 15.9062C0.65488 15.9674 0.73648 16 0.82 16C0.85392 16 0.88816 15.9946 0.92112 15.9837L4.35024 14.8406C5.5992 15.5997 7.03056 16 8.5 16C10.637 16 12.646 15.168 14.157 13.657C15.668 12.1459 16.5 10.137 16.5 7.99999C16.5 5.86304 15.668 3.85408 14.157 2.34304Z"
                  fill="white"
                />
              </svg>
              &nbsp; Request Blessings
            </Button>

          </Paper>
        </Grid>

      </Grid>

      {/* Reviews Section */}
      <Box width="100%" mt={5}>
        {/* Inner content centered at 85% width */}
        <Box width="85%" mx="auto">
          <Typography variant="h6" fontWeight="bold">
            {scholar.scholarName}’s Reviews
          </Typography>

          {/* Reviews Stats */}
          <Grid container spacing={3} mt={2}>
            {/* Left column */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Box
                bgcolor="grey.900"
                color="white"
                p={3}
                textAlign="center"
                borderRadius={100}
              >
                <Typography variant="h4">{satisfactionPercentage}%</Typography>
                <Typography variant="body2">
                  Satisfied out of {scholar.reviews.length} reviews
                </Typography>
              </Box>
            </Grid>

            {/* Right column - Static for now as per design, could be dynamic later */}
            <Grid size={{ xs: 12, md: 3 }}>
              {/* ... stats ... */}
              <Box>
                <Typography variant="body2">Communication</Typography>
                <LinearProgress variant="determinate" value={95} sx={{ mb: 1 }} />
                <Typography variant="body2">Knowledge</Typography>
                <LinearProgress variant="determinate" value={98} sx={{ mb: 1 }} />
                <Typography variant="body2">Effectiveness</Typography>
                <LinearProgress variant="determinate" value={97} />
              </Box>
            </Grid>
          </Grid>

          {/* Reviews List */}
          <Box mt={4}>
            {scholar.reviews.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No reviews yet. Be the first to leave a review!
              </Typography>
            ) : (
              // Sort by date (newest first) and then slice
              ([...scholar.reviews].reverse())
                .slice(0, showAllReviews ? undefined : 1)
                .map((review) => (
                  <Paper key={review._id} variant="outlined" sx={{ p: 3, mb: 2, borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar src={review.reviewer?.profilePic} alt={review.reviewer?.name} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {review.reviewer?.name || "Anonymous User"}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <VerifiedIcon sx={{ fontSize: 14, color: "green" }} />
                            <Typography variant="caption" color="green">Verified User</Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={1} gap={0.5}>
                      {/* Simple Star Display */}
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          width="14"
                          height="13"
                          viewBox="0 0 14 13"
                          fill={i < review.rating ? "#FFB955" : "none"}
                          stroke={i < review.rating ? "none" : "#FFB955"}
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.4375 10.2395L10.5899 12.0811C11.1672 12.4186 11.8737 11.9197 11.7217 11.2887L10.8862 7.82576L13.6739 5.49264C14.1829 5.06711 13.9094 4.26005 13.241 4.20869L9.57202 3.90788L8.13635 0.635654C7.87808 0.0413704 6.99692 0.0413704 6.73865 0.635654L5.30298 3.90055L1.63404 4.20136C0.965574 4.25272 0.692112 5.05977 1.20105 5.4853L3.98884 7.81842L3.15327 11.2814C3.00134 11.9123 3.70779 12.4112 4.28509 12.0737L7.4375 10.2395Z"
                          />
                        </svg>
                      ))}
                    </Box>

                    <Typography variant="body1" color="text.primary">
                      {review.comment}
                    </Typography>
                  </Paper>
                ))
            )}
          </Box>

          {/* Button */}
          {scholar.reviews.length > 1 && (
            <Box mt={3}>
              <Button variant="outlined" onClick={() => setShowAllReviews(!showAllReviews)}>
                {showAllReviews ? "Show Less" : "Read all reviews"}
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      <Box width="100%" mt={5}>
        {/* Inner content centered at 85% width */}
        <Box width="85%" mx="auto" borderTop="1px solid lightgray" pt={3}>
          <Typography variant="h5" color="black" gutterBottom>
            Education
          </Typography>

          {/* Inline list with dots */}
          <Box display="flex" flexWrap="wrap" gap={{ xs: 2, sm: 2, md: 40 }} mt={5}>
            {scholar.scholarEducation.map((edu) => (
              <Box
                key={edu._id}
                display="flex"
                alignItems="center"
                gap={1}
                mb={0.5}
                sx={{
                  width: { xs: "100%", sm: "100%", md: "auto" }, // full width on xs/sm
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "black",
                  }}
                />
                <Typography variant="body2" color="text.primary">
                  {edu.name}
                </Typography>
              </Box>
            ))}
          </Box>

        </Box>
      </Box>

      <Box width="100%" mt={5}>
        {/* Inner content centered at 85% width */}
        <Box width="85%" mx="auto" borderTop="1px solid lightgray" pt={3}>
          <Typography variant="h5" color="black" gutterBottom>
            Specializations
          </Typography>

          <Box display="flex" flexWrap="wrap" gap={{ xs: 2, sm: 2, md: 2 }} mt={5}>
            {scholar.scholarSpecialization.map((edu) => (
              <Box
                key={edu._id}
                display="flex"
                alignItems="center"
                gap={1}
                mb={0.5}
                sx={{
                  width: { xs: "100%", sm: "100%", md: "100%" }, // full width on xs/sm
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "black",
                  }}
                />
                <Typography variant="body2" color="text.primary">
                  {edu.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      <Box width="100%" mt={5}>
        {/* Inner content centered at 85% width */}
        <Box width="85%" mx="auto" borderTop="1px solid lightgray" pt={3}>
          <Typography variant="h5" color="black" gutterBottom>
            Experience
          </Typography>

          {/* Inline list with dots */}
          <Box display="flex" flexWrap="wrap" gap={30} mt={5}>
            <Typography variant="body2" color="text.primary">
              {scholar.scholarName} has over {scholar.scholarExperience} years of experience in her field.
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box width="100%" mt={5}>
        {/* Inner content centered at 85% width */}
        <Box width="85%" mx="auto" borderTop="1px solid lightgray" pt={3}>
          <Typography variant="h5" color="black" gutterBottom>
            About {scholar.scholarName}
          </Typography>

          {/* Inline list with dots */}
          <Box display="flex" flexWrap="wrap" gap={30} mt={5}>
            <Typography variant="body2" color="text.primary">
              {scholar.scholarName} is a top Islamic Alima with {scholar.scholarExperience} years of experience
              currently <br />
              available for Duas, Istikhara and Wazaif and Adhkar. <br />
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={30}>
            <Typography variant="h6" color="text.primary" marginTop={5} py={1}>
              Experience
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={30}>
            <Typography variant="body2" color="text.primary">
              {scholar.scholarName} has over {scholar.scholarExperience} years of experience in her field
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={30}>
            <Typography variant="h6" color="text.primary" marginTop={5} py={1}>
              Qualifications
            </Typography>
          </Box>
          <Box display="flex" flexWrap="wrap" gap={30}>
            <Typography variant="body2" color="text.primary">
              {scholar.scholarName} has the following qualifications:
            </Typography>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={{ xs: 2, sm: 2, md: 3 }} mt={2}>
            {scholar.scholarEducation.map((edu) => (
              <Box
                key={edu._id}
                display="flex"
                alignItems="center"
                gap={1}
                ml={3}
                sx={{
                  width: { xs: "100%", sm: "100%", md: "100%" } // full width on xs/sm
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "black",
                  }}
                />
                <Typography variant="body2" color="text.primary">
                  {edu.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default ScholarDetails;
