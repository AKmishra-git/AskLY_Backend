import { processPDF } from "../services/pdf.service.js";

export async function uploadPDF(req, res) {
  try {
    // ✅ Check karo file aaya hai ya nahi
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Koi file nahi mili — multer check karo"
      })
    }

    console.log("File received:", req.file)
    console.log("User:", req.user)

    const result = await processPDF(req.file.path, req.user.userId)

    res.json({
      success: true,
      message: "PDF processed successfully",
      chunks: result.chunks,
    })

  } catch (err) {
    console.error("❌ Upload error:", err.message)  // ← exact error
    console.error("❌ Stack:", err.stack)
    res.status(500).json({
      success: false,
      message: err.message  // ← frontend ko exact error bhejo
    })
  }
}