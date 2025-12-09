import axios from "axios";

export const fetchCamping = async (params = {}) => {
  const response = await axios.get("/api/camping", {
    params,
  });
  return response.data;
};
