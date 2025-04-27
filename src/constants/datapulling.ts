export const cleanStreetName = (street : string) => {
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