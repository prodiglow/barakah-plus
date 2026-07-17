// cartEvents.ts
export const cartEvents = {
  onChange: (callback: () => void) => {
    window.addEventListener("cartUpdated", callback);
  },
  emit: () => {
    window.dispatchEvent(new Event("cartUpdated"));
  },
};
