import http from "k6/http";
import { check, sleep } from "k6";

export let options = {
  vus: 10,
  duration: "30s",
};

const TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InZxNTJVVEJkdVNuQUxlTkxxUW5CRCJ9.eyJpc3MiOiJodHRwczovL2Rldi02MTgxYXZncGwxbjJpaDc0LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJnb29nbGUtb2F1dGgyfDEwMDM0MDEzOTE4MTEwMzE3MDkxNyIsImF1ZCI6WyJodHRwczovL3Jlc3VtZS1idWlsZGVyLWFwaSIsImh0dHBzOi8vZGV2LTYxODFhdmdwbDFuMmloNzQudXMuYXV0aDAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTc0ODgxNTMxMiwiZXhwIjoxNzQ4OTAxNzEyLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIiwiYXpwIjoib3FIZENVcFBZaXljNFYxME9KckFKVWtXRUNxVHRRd0ciLCJwZXJtaXNzaW9ucyI6W119.XAkGfU47PSbm5kQYJrVUbA7GcrnkvnxETu_AFsuTsp3jYZd5OTdGSP9wYgKu8qFwJqAQiuM90y_yn7luSWnVDMW0hURid8ZLhvW3AoLlbFMgQuPGGgXhKASAqo8SWQunXbu32e6xGptBTOw_q2etO4Uo3CSMp_ufQktns73ncVoW9EtSXJ9kwfXOZl1c7xljOGdMS-qYb2IW2j3PT1P_MI9KrjLrHWUbjovCbJ7JUJE5G8OXLQLvCqxGQDdKF_Sxbw4z4T94V8EoztFmJxqZi9OH1n0oqI8vCkZ2mKFG6z09ee6FJj5jjO3ojd3U33YgfnqkVeuD5oBcMrX0ZKjJwg";

export default function () {
  let params = {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  };
  let res = http.get(
    "http://localhost/export/cv/d1451bc6-e9b3-4e49-9eda-b3e09f0b59d4",
    params
  );
  check(res, {
    "status is 200": (r) => r.status === 200,
  });
  sleep(1);
}
