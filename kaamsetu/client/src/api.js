let token = localStorage.getItem('kaamsetu_token');

export const setToken = (t) => {
  token = t;
  if (t) {
    localStorage.setItem('kaamsetu_token', t);
  } else {
    localStorage.removeItem('kaamsetu_token');
  }
};

export const getToken = () => token;

export async function api(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch('/api' + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}
