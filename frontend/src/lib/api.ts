const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

export const api = {
  listMeetings: (params?: {
    search?: string;
    participant?: string;
    sort?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.participant) qs.set("participant", params.participant);
    if (params?.sort) qs.set("sort", params.sort);
    if (params?.dateFrom) qs.set("date_from", params.dateFrom);
    if (params?.dateTo) qs.set("date_to", params.dateTo);
    return request(`/api/meetings?${qs.toString()}`);
  },
  getMeeting: (id: number) => request(`/api/meetings/${id}`),
  createMeeting: (data: any) =>
    request(`/api/meetings`, { method: "POST", body: JSON.stringify(data) }),
  updateMeeting: (id: number, data: any) =>
    request(`/api/meetings/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMeeting: (id: number) =>
    request(`/api/meetings/${id}`, { method: "DELETE" }),
  searchTranscript: (id: number, q: string) =>
    request(`/api/meetings/${id}/transcript/search?q=${encodeURIComponent(q)}`),
  globalSearch: (q: string) =>
    request(`/api/meetings/search/global?q=${encodeURIComponent(q)}`),
  createActionItem: (meetingId: number, data: any) =>
    request(`/api/meetings/${meetingId}/action-items`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateActionItem: (meetingId: number, itemId: number, data: any) =>
    request(`/api/meetings/${meetingId}/action-items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteActionItem: (meetingId: number, itemId: number) =>
    request(`/api/meetings/${meetingId}/action-items/${itemId}`, {
      method: "DELETE",
    }),
};
