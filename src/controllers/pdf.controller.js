import { processPDF } from "../services/pdf.service.js";

export async function uploadPDF(req, res) {
  try {
    const result = await processPDF(req.file.path, req.user.userId);

    res.json({
      success: true,
      message: "PDF processed successfully",
      chunks: result.chunks,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "PDF processing failed",
    });
  }
}