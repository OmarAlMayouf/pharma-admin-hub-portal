export const cleanStreetName = (street: string) => {
  if (!street || street === "") return "No street info";
  let array = street.split(" ");
  for (let i = 0; i < array.length; i++) {
    if (array[i] != undefined && array[i].includes("+")) array.splice(i, 1);
    if (array[i] != undefined && /^\d+$/.test(array[i])) array.splice(i, 1);
    if (array[i] != undefined && /^(?=.*[a-zA-Z])(?=.*\d).+$/.test(array[i]))
      array.splice(i, 1);
  }
  street = array.join(" ");

  return !street ? "No street info" : street;
};

export const isPharmacyOpen = (workingHours) => {
  if (!workingHours) return "Closed";
  try {
    const now = new Date();
    const dayOfWeek = now.toLocaleString("en-US", { weekday: "long" });
    const hours = JSON.parse(workingHours)[dayOfWeek];

    if (!hours || hours.toLowerCase() === "closed") return "Closed";
    if (hours.toLowerCase() === "open 24 hours") return "Opened";

    const timeRanges = hours.split(",");
    for (let timeRange of timeRanges) {
      let [startTime, endTime] = timeRange.trim().split("-");

      const parseTime = (time) => {
        const match = time.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
        if (!match) throw new Error("Invalid time format");
        let [, hour, minute = "0", modifier] = match;
        hour = parseInt(hour);
        minute = parseInt(minute);
        if (modifier.toUpperCase() === "PM" && hour !== 12) hour += 12;
        if (modifier.toUpperCase() === "AM" && hour === 12) hour = 0;
        const date = new Date();
        date.setHours(hour, minute, 0, 0);
        return date;
      };

      let start = parseTime(startTime);
      let end = parseTime(endTime);

      if (end < start) end.setDate(end.getDate() + 1);
      if (now >= start && now <= end) return "Opened";
    }
  } catch (error) {
    return "Closed";
  }
  return "Closed";
};