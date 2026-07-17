import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Divider,
  IconButton,
  Tooltip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { CartItem } from "../../types/cart";
import { removeFromCart } from "../../services/cartService";
import { cartEvents } from "./cartEvents";
import BookYourSpirtualForm from "../home_page/BookYourSpirtualForm";

const getServiceTab = (serviceName: string) => {
   if (serviceName.includes("Free")) return 4;
   if (serviceName.includes("Quran Khawani")) return 1;
   if (serviceName.includes("Personal Dua")) return 0;
   if (serviceName.includes("Wazaif")) return 2;
   if (serviceName.includes("Quran O Hadith")) return 5;
   return 0; 
};


interface Props {
  cartItems: CartItem[];
  onItemRemoved?: () => void;
}

const CartItems: React.FC<Props> = ({ cartItems, onItemRemoved }) => {
  const [editingItemId, setEditingItemId] = React.useState<string | null>(null);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const handleDelete = async (id: string) => {
    try {
      await removeFromCart(id);
      cartEvents.emit();

      if (onItemRemoved) onItemRemoved();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };
  return (
    <>
      {cartItems.map((item, index) => (
        <React.Fragment key={item._id}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            {/* Left section: Image + Details */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                paddingBottom: "50px",
                mt: 4,
              }}
            >
              <Avatar
                src={
                  item.service === "Quran Khawani"
                    ? "https://res.cloudinary.com/debszasgn/image/upload/v1775195032/open-holy-quran-book-with-light-rays-falling-on-it-photo_frljff.jpg"
                    : item.scholarID?.ProfileImg
                }
                alt={item.service}
                sx={{
                  width: { xs: 80, sm: 80, md: 130 },
                  height: { xs: 80, sm: 80, md: 130 },
                }}
              />
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    color: "#0b0b2e",
                    fontSize: { sm: "1rem", xs: "1rem", md: "1.2rem" },
                    paddingBottom: "10px",
                  }}
                >
                  {item.service}
                </Typography>
                <Typography variant="body2" sx={{ color: "gray", mt: 0.3 }}>
                  Reason:{" "}
                  <Typography
                    component="span"
                    sx={{ color: "#0b0b2e", fontWeight: 500 }}
                  >
                    {isSmallScreen && <br />}
                    {item.reason}
                  </Typography>
                </Typography>
              </Box>
            </Box>

            {/* Right section: Price + Delete */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                mt: 8,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#0b0b2e",
                  fontSize: { sm: "1rem", xs: "1rem", md: "1.2rem" },
                  mb: 1,
                }}
              >
                PKR: {item.fee}/-
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mr: 2 }} onClick={() => setEditingItemId(editingItemId === item._id ? null : item._id)}>
                  <Tooltip title="Edit Item" arrow>
                    <IconButton
                      sx={{
                        color: "#F69320",
                        "&:hover": { backgroundColor: "#fff5e6" },
                      }}
                    >
                      <EditOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                  <Typography variant="body2" sx={{ color: "#F69320", fontWeight: 500, fontSize: "0.8rem", ml: 0.5 }}>
                    Click here to make changes to your request
                  </Typography>
                </Box>

                <Tooltip title="Remove Item" arrow>
                  <IconButton
                    onClick={() => handleDelete(item._id)}
                    sx={{
                      color: "red",
                      "&:hover": { backgroundColor: "#ffeaea" },
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>

          {editingItemId === item._id && (
             <Box sx={{ width: '100%', mb: 3 }}>
                <BookYourSpirtualForm 
                   activeTab={getServiceTab(item.service)}
                   isEditMode={true}
                   editData={item}
                   onEditSuccess={() => {
                      setEditingItemId(null);
                      if (onItemRemoved) onItemRemoved();
                   }}
                   onCancelEdit={() => setEditingItemId(null)}
                />
             </Box>
          )}

          {index < cartItems.length - 1 && (
            <Divider sx={{ my: 2, borderColor: "#e0e0e0" }} />
          )}
        </React.Fragment>
      ))}
    </>
  );
};

export default CartItems;
