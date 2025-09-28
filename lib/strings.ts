export const formatNotificationContent = (input: string): string => {
  // Error handling
  if (typeof input !== "string") {
    return input;
  }

  if (input.trim() === "") {
    return input;
  }

  try {
    return (
      input
        // Replace underscores with spaces
        .replace(/_/g, " ")
        // Convert to lowercase first to handle cases like 'HELLO_WORLD'
        .toLowerCase()
        // Capitalize first character of each word (proper case)
        .replace(/\b\w/g, (match) => match.toUpperCase())
    );
  } catch (error) {
    return input;
  }
};

export const formatPhoneNumber = (phoneNumber: string) => {
  // Format phone number as +91 XXXXX XXXXX
  if (phoneNumber.startsWith("+91")) {
    return phoneNumber.replace(/(\+91)(\d{5})(\d{5})/, "$1 $2 $3");
  }
  // If no country code, add +91 and format
  if (phoneNumber.length === 10) {
    return `+91 ${phoneNumber.slice(0, 5)} ${phoneNumber.slice(5)}`;
  }
  return phoneNumber;
};

export const toTitleCaseLabel = (text: string) =>
  text
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
