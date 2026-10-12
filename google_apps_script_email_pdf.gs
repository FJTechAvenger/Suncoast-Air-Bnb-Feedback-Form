/**
 * SUN COAST AIR BNB FIJI — Guest Feedback PDF Emailer
 * Deploy as a Google Apps Script Web App:
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Emails a PDF copy of each guest submission to:
 *   iliutaki@gmail.com
 *   mliutaki@gmail.com
 */
const RECIPIENTS = ["iliutaki@gmail.com", "mliutaki@gmail.com"];

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No form data received.");
    }
    const data = JSON.parse(e.postData.contents);

    const fields = [
      ["Guest name or organization representative", "Guest name / Organization representative"],
      ["Guest email address", "Guest email address"],
      ["Booking or room reference", "Booking / room reference"],
      ["Departure date", "Departure date"],
      ["Rating - Overall experience", "Overall experience (1–5)"],
      ["Rating - Cleanliness and hygiene", "Cleanliness and hygiene (1–5)"],
      ["Rating - Facilities and amenities", "Facilities and amenities (1–5)"],
      ["Rating - Comfort and condition", "Comfort and condition (1–5)"],
      ["Rating - Customer service and communication", "Customer service and communication (1–5)"],
      ["Rating - Value for money", "Value for money (1–5)"],
      ["Issues", "Facilities / hygiene issues"],
      ["Other issue", "Other issue"],
      ["What you enjoyed", "What the guest enjoyed"],
      ["Suggested improvements", "Suggested improvements"],
      ["Would recommend", "Would recommend Sun Coast Air BnB"],
      ["Contact permission", "Contact permission"]
    ];

    const rows = fields.map(([key, label]) => {
      let value = data[key];
      if (Array.isArray(value)) value = value.join(", ");
      if (value === undefined || value === null || String(value).trim() === "") value = "Not provided";
      return { label, value: String(value) };
    });

    const submittedAt = data.submittedAt ? new Date(data.submittedAt) : new Date();
    const timeZone = Session.getScriptTimeZone() || "Pacific/Fiji";
    const timestamp = Utilities.formatDate(submittedAt, timeZone, "yyyy-MM-dd HH:mm:ss");
    const fileStamp = Utilities.formatDate(submittedAt, timeZone, "yyyyMMdd-HHmmss");

    let body = `
      <div style="font-family:Arial,sans-serif;color:#16334a">
        <div style="background:#064b70;color:#fff;padding:18px">
          <h1 style="margin:0;font-size:22px">SUN COAST AIR BNB FIJI</h1>
          <p style="margin:6px 0 0">Guest Feedback Submission</p>
        </div>
        <p><b>Submitted:</b> ${escapeHtml(timestamp)}</p>
        <table style="width:100%;border-collapse:collapse">`;
    rows.forEach((row, i) => {
      body += `<tr style="background:${i % 2 ? "#eff7fa" : "#fff"}">
        <th style="text-align:left;vertical-align:top;padding:9px;border:1px solid #d7e5ec;width:36%">${escapeHtml(row.label)}</th>
        <td style="padding:9px;border:1px solid #d7e5ec;white-space:pre-wrap">${escapeHtml(row.value)}</td>
      </tr>`;
    });
    body += `</table><p style="color:#62788a;font-size:12px">Generated automatically from the Sun Coast Air BnB Fiji guest feedback form.</p></div>`;

    const pdf = Utilities.newBlob(body, "text/html", "guest-feedback.html")
      .getAs(MimeType.PDF)
      .setName("Sun-Coast-Guest-Feedback-" + fileStamp + ".pdf");

    const guestEmail = String(data["Guest email address"] || "").trim();
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail);
    MailApp.sendEmail({
      to: RECIPIENTS.join(","),
      subject: "Sun Coast Air BnB Fiji — New Guest Feedback",
      body: "A guest has submitted the feedback form. The completed submission is attached as a PDF.",
      htmlBody: "<p>A guest has submitted the Sun Coast Air BnB Fiji feedback form. The completed submission is attached as a PDF.</p>",
      attachments: [pdf],
      name: "Sun Coast Air BnB Fiji Feedback",
      ...(validEmail ? { replyTo: guestEmail } : {})
    });

    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}
