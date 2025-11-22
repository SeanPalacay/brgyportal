# Certificate Edit & Delete Functionality

## Backend Implementation (Completed ✅)

### Health Certificates

**Controller:** `backend/src/controllers/health.controller.ts`

**New Functions:**
- `updateCertificate` - Update certificate details (lines 768-824)
- `deleteCertificate` - Delete a certificate (lines 826-847)

**Routes:** `backend/src/routes/health.routes.ts`
- `PUT /api/health/certificates/:id` - Update certificate
- `DELETE /api/health/certificates/:id` - Delete certificate

**Request Body (Update):**
```json
{
  "certificateType": "Medical Clearance",
  "certificateNumber": "CERT-2025-001",
  "purpose": "Employment",
  "findings": "Patient is in good health",
  "recommendations": "Cleared for work",
  "expiryDate": "2025-12-31",
  "issuedBy": "userId" // Will be converted to full name
}
```

---

### Daycare Certificates

**Controller:** `backend/src/controllers/daycare.controller.ts`

**New Functions:**
- `updateDaycareCertificate` - Update certificate details (lines 1119-1175)
- `deleteDaycareCertificate` - Delete a certificate (lines 1177-1198)

**Routes:** `backend/src/routes/daycare.routes.ts`
- `PUT /api/daycare/certificates/:id` - Update certificate
- `DELETE /api/daycare/certificates/:id` - Delete certificate

**Request Body (Update):**
```json
{
  "certificateType": "Completion Certificate",
  "certificateNumber": "DC-2025-001",
  "purpose": "Daycare Completion",
  "achievements": "Successfully completed daycare program",
  "recommendations": "Ready for kindergarten",
  "expiryDate": "2026-06-30",
  "issuedBy": "userId" // Will be converted to full name
}
```

---

### SK Certificates

**Controller:** `backend/src/controllers/sk.controller.ts`

**New Functions:**
- `updateSKCertificate` - Update certificate details (lines 334-392)
- `deleteSKCertificate` - Delete a certificate (lines 394-415)

**Routes:** `backend/src/routes/sk.routes.ts`
- `PUT /api/sk/certificates/:id` - Update certificate
- `DELETE /api/sk/certificates/:id` - Delete certificate

**Request Body (Update):**
```json
{
  "certificateType": "Participation",
  "certificateNumber": "SK-2025-001",
  "purpose": "Event Participation",
  "achievements": "Active participant in youth summit",
  "recommendations": "Recommended for leadership training",
  "expiryDate": "2025-12-31",
  "issuedBy": "userId" // Will be converted to full name
}
```

---

## Key Features

### 1. Issuer Name Resolution
All update functions automatically convert `issuedBy` user ID to full name:
```typescript
let issuedByName = issuedBy;
if (issuedBy) {
  const issuer = await prisma.user.findUnique({ where: { id: issuedBy } });
  if (issuer) {
    issuedByName = `${issuer.firstName} ${issuer.lastName}`;
  }
}
```

### 2. Certificate Validation
Both update and delete functions check if certificate exists before proceeding:
```typescript
const certificate = await prisma.certificate.findUnique({ where: { id } });
if (!certificate) {
  return res.status(404).json({ error: 'Certificate not found' });
}
```

### 3. Response Format
**Success (Update):**
```json
{
  "message": "Certificate updated successfully",
  "certificate": { /* updated certificate object */ }
}
```

**Success (Delete):**
```json
{
  "message": "Certificate deleted successfully"
}
```

**Error:**
```json
{
  "error": "Certificate not found"
}
```

---

## Testing the Endpoints

### Update Certificate
```bash
# Health Certificate
curl -X PUT http://localhost:5000/api/health/certificates/CERT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certificateType": "Updated Type",
    "certificateNumber": "NEW-NUMBER",
    "purpose": "Updated purpose",
    "issuedBy": "USER_ID"
  }'

# Daycare Certificate
curl -X PUT http://localhost:5000/api/daycare/certificates/CERT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certificateType": "Updated Type",
    "achievements": "Updated achievements"
  }'

# SK Certificate
curl -X PUT http://localhost:5000/api/sk/certificates/CERT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "certificateType": "Updated Type",
    "achievements": "Updated achievements"
  }'
```

### Delete Certificate
```bash
# Health Certificate
curl -X DELETE http://localhost:5000/api/health/certificates/CERT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Daycare Certificate
curl -X DELETE http://localhost:5000/api/daycare/certificates/CERT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# SK Certificate
curl -X DELETE http://localhost:5000/api/sk/certificates/CERT_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Frontend Implementation (TODO)

The backend is ready. To complete the feature, implement the following in the frontend:

### 1. Certificate Management Pages
- Health: `frontend/src/pages/health/CertificateGenerator.tsx`
- Daycare: `frontend/src/pages/daycare/CertificateGenerator.tsx`
- SK: `frontend/src/pages/sk/CertificateGenerator.tsx`

### 2. Add Edit & Delete Buttons
```tsx
<Button variant="outline" size="sm" onClick={() => handleEdit(certificate.id)}>
  <Edit className="h-4 w-4 mr-1" />
  Edit
</Button>
<Button variant="destructive" size="sm" onClick={() => handleDelete(certificate.id)}>
  <Trash2 className="h-4 w-4 mr-1" />
  Delete
</Button>
```

### 3. Edit Dialog Component
Use shadcn Dialog component with form fields for:
- Certificate Type
- Certificate Number
- Purpose/Achievements
- Recommendations
- Expiry Date
- Issued By (dropdown of staff users)

### 4. API Integration
```typescript
// Update certificate
const handleUpdate = async (id: string, data: CertificateData) => {
  await api.put(`/health/certificates/${id}`, data);
  toast.success('Certificate updated successfully');
  fetchCertificates();
};

// Delete certificate
const handleDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this certificate?')) {
    await api.delete(`/health/certificates/${id}`);
    toast.success('Certificate deleted successfully');
    fetchCertificates();
  }
};
```

---

## Deployment Status

✅ **Backend Changes Deployed**
- All endpoints added to controllers
- All routes registered
- Code pushed to GitHub
- Render will auto-deploy

⏳ **Frontend Changes Pending**
- UI components need to be added
- Edit dialogs need implementation
- Delete confirmations need implementation

---

## Security Considerations

1. **Authentication Required**: All endpoints use `authenticate` middleware
2. **Authorization**: Consider adding `authorize()` middleware for role-based access
3. **Validation**: Request body validation should be added (consider using Zod)
4. **Audit Trail**: Consider logging certificate modifications for compliance

---

## Next Steps

1. Implement frontend edit/delete UI components
2. Add form validation
3. Add confirmation dialogs for destructive actions
4. Test end-to-end workflow
5. Add permission checks (only staff should edit/delete)
