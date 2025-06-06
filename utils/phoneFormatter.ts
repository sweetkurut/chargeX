export const formatKyrgyzPhone = (input: string): string => {
  const cleaned = input.replace(/\D/g, "");

  let phone = cleaned;
  if (!phone.startsWith("996")) {
    if (phone.startsWith("0")) {
      phone = "996" + phone.slice(1);
    } else if (phone.length === 9) {
      phone = "996" + phone;
    }
  }

  phone = phone.slice(0, 12);

  if (phone.length >= 3) {
    const formatted = phone.replace(/(\d{3})(\d{3})?(\d{2})?(\d{2})?/, (match, p1, p2, p3, p4) => {
      let result = `+${p1}`;
      if (p2) result += ` ${p2}`;
      if (p3) result += ` ${p3}`;
      if (p4) result += ` ${p4}`;
      return result;
    });
    return formatted;
  }

  return phone ? `+${phone}` : "";
};

export const isValidKyrgyzPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 12 && cleaned.startsWith("996");
};
