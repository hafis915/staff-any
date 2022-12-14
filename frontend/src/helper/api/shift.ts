import { getAxiosInstance } from ".";

export const getShifts = async () => {
  const api = getAxiosInstance()
  const { data } = await api.get("/shifts?order[date]=DESC&order[startTime]=ASC");
  return data;
};

export const getWeeklyShift = async (startDate:string , endDate:string) => {
  const api = getAxiosInstance()
  const { data } = await api.get(`/shifts?range=true&firstDate=${startDate}&lastDate=${endDate}`)
  return data
}

export const getShiftById = async (id: string) => {
  const api = getAxiosInstance()
  const { data } = await api.get(`/shifts/${id}`);
  return data;
};

export const createShifts = async (payload: any) => {
  const api = getAxiosInstance()
  const { data } = await api.post("/shifts", payload);
  return data;
};

export const updateShiftById = async (id: string, payload: any) => {
  const api = getAxiosInstance()
  const { data } = await api.patch(`/shifts/${id}`, payload);
  return data;
};

export const deleteShiftById = async (id: string) => {
  const api = getAxiosInstance()
  const { data } = await api.delete(`/shifts/${id}`);
  return data;
};

export const bulkPublish = async(id : string[], status:boolean) => {
  const api = getAxiosInstance()
  const payload = {
    id,
    status
  }
  const {data} = await api.post('/shifts/publish', payload)
  return data
}