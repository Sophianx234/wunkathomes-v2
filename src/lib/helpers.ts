export function formatLeaseTerm(leaseTerm: string | null | undefined): string {
  if (!leaseTerm) return '';
  
  const words = leaseTerm.split('_');
  const firstWord = words[0];
  
  // Drop the number only if it's exactly 1
  const filtered = (!isNaN(Number(firstWord)) && Number(firstWord) === 1)
    ? words.slice(1)
    : words;
  
  const readable = filtered
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
    
  return `/ ${readable}`;
}

export const getNeighborhoodDescription = (property: any) => {
  const landmarks = property.landmarks || [];
  const type = property.propertyType.toLowerCase();

  // Start with the specific location
  let description = `Situated in the heart of ${property.location} `;

  // Dynamically add landmarks if they exist
  if (landmarks.length > 0) {
    const landmarkText = landmarks.length > 2 
      ? `${landmarks.slice(0, 2).join(", ")} and others` 
      : landmarks.join(" and ");
    description += `You will be conveniently close to ${landmarkText}. `;
  }

  // Add type-specific professional context
  if (type.includes("land")) {
    description += "This prime plot is ideally positioned for your next development project, offering great accessibility in a growing area.";
  } else if (type.includes("commercial")) {
    description += "This location offers excellent visibility and accessibility, perfectly suited for business operations and client access.";
  } else {
    description += "This property is set in a welcoming community with convenient access to essential shopping, business centers, and local dining.";
  }

  // Keep the consistent privacy/security closing
  description += " For your privacy and security, exact address details and entry instructions are provided confidentially once your booking is confirmed.";

  return description;
};


export const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(); 
  tomorrow.setDate(today.getDate() + 1);

  const formattedDate = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  if (date.toDateString() === today.toDateString()) return `Today, ${formattedDate}`;
  if (date.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${formattedDate}`;
  return formattedDate;
};

// NEW: Helper to extract time (e.g., "14:30") from ISO string
export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};
