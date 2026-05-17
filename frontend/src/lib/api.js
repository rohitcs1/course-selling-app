import { config } from "../config";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;
    error.response = data;
    throw error;
  }

  return data;
}

export async function getCourses() {
  const response = await fetch(`${config.apiBaseUrl}/api/courses`);
  return parseResponse(response);
}

export async function getCourseById(courseId) {
  const response = await fetch(`${config.apiBaseUrl}/api/courses/${courseId}`);
  return parseResponse(response);
}

export async function createOrder(payload) {
  const response = await fetch(`${config.apiBaseUrl}/api/payments/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function verifyPayment(payload) {
  const response = await fetch(`${config.apiBaseUrl}/api/payments/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getEnrollments(email) {
  const query = new URLSearchParams({ email });
  const response = await fetch(`${config.apiBaseUrl}/api/user/enrollments?${query.toString()}`);
  return parseResponse(response);
}

export async function getHomepageVideo() {
  const response = await fetch(`${config.apiBaseUrl}/api/home/video`);
  return parseResponse(response);
}

export async function createCourseAdmin(payload, token) {
  const response = await fetch(`${config.apiBaseUrl}/api/courses/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function getAllCoursesAdmin(token) {
  const response = await fetch(`${config.apiBaseUrl}/api/courses/admin/all`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  return parseResponse(response);
}

export async function updateCourseAdmin(courseId, payload, token) {
  console.log("updateCourseAdmin - courseId:", courseId, "token:", token ? token.substring(0, 20) + "..." : "none");
  const response = await fetch(`${config.apiBaseUrl}/api/courses/admin/${courseId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  console.log("updateCourseAdmin response status:", response.status);
  return parseResponse(response);
}

export async function deleteCourseAdmin(courseId, token) {
  console.log("deleteCourseAdmin - courseId:", courseId, "token:", token ? token.substring(0, 20) + "..." : "none");
  const response = await fetch(`${config.apiBaseUrl}/api/courses/admin/${courseId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  console.log("deleteCourseAdmin response status:", response.status);
  return parseResponse(response);
}

export async function getHomepageVideoAdmin(token) {
  const response = await fetch(`${config.apiBaseUrl}/api/admin/homepage-video`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseResponse(response);
}

export async function updateHomepageVideoAdmin(payload, token) {
  const response = await fetch(`${config.apiBaseUrl}/api/admin/homepage-video`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}
