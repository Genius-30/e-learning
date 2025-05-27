import { verifyAdmin } from "@/middleware/verifyAdmin";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req) {
  try {
    const admin = verifyAdmin(req);

    return SuccessResponse("Admin verified", {admin});
  } catch (error) {
    console.log(error);
    return ErrorResponse(error.message, 500);
  }
}
