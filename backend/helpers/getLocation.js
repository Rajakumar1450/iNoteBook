const getLocationFromIp = async (ip) => {
  try {
    // in case we are checking locally on localhost it will stuck in loop hole
    //If you send "127.0.0.1" to a geolocation API, it will fail because that IP doesn't exist on the public internet; it has no city or country.so we assign a fake ip "8.8.8.8" that is Google's public DNS IP, located in the US
    //if we are not locally then the ip address will give the exact location of the device
    const checkip = ip === "::1" || ip === "127.0.0.1" ? "8.8.8.8" : ip;
    const response = await fetch(`http://ip-api.com/json/${checkip}`);
    const data = response.json();
    if (data.status === "success") {
      return `${data.city} ,${data.country}`;
    }
    return "unknown location";
  } catch (error) {
    return "unknown location";
  }
};

module.exports = getLocationFromIp;
