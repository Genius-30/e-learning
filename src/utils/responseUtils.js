export const ErrorResponse = (message, statusCode = 400, errorCode = "") => {
  return new Response(JSON.stringify({ success: false, message, errorCode }), {
    status: statusCode,
    headers: { "Content-Type": "application/json" },
  });
};

export const SuccessResponse = (message, data) => {
  return new Response(JSON.stringify({ success: true, message, ...data }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
