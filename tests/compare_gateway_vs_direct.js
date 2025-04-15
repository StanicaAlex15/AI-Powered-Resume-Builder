import http from "k6/http";
import { group, check, sleep } from "k6";

export let options = {
  vus: 210,
  duration: "20s",
};

const fileId = "67fc77dcaa2eafe092db944b";

export default function () {
  group("🔁 API Gateway", () => {
    const res = http.get(`http://localhost:3000/export/cv/${fileId}`);
    check(res, {
      "Gateway status 200": (r) => r.status === 200,
      "Gateway is PDF": (r) => r.headers["Content-Type"] === "application/pdf",
    });
  });

  group("🎯 Direct to Export Service", () => {
    const res = http.get(`http://localhost:3004/export/cv/${fileId}`);
    check(res, {
      "Direct status 200": (r) => r.status === 200,
      "Direct is PDF": (r) => r.headers["Content-Type"] === "application/pdf",
    });
  });

  sleep(1);
}
