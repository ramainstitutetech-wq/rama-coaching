# Rama Coaching Center — MongoDB + Mongoose Database Architecture

> **Phase:** Architecture & design only. No code, no models, no API routes, no DB connections, no file modifications to existing code.
> **Stack:** Next.js 14 App Router → MongoDB + Mongoose (planned).
> **Basis:** Every field below is verified against `data/types.ts`, `data/*.ts`, `types/certificate.ts`, `lib/defaults.ts`, and the admin page forms / certificate generator components.

---

## 1. Recommended collections

```text
users
students
courses
certificates
testimonials
banners
achievements
notices
contactMessages
franchiseApplications
settings
```

**Why these and not more:**

- `users` is required up front for future admin authentication (admin/staff roles).
- `students`, `courses`, `certificates`, `testimonials`, `banners`, `achievements`, `notices`, `contactMessages`, `franchiseApplications`, `settings` map 1:1 to the existing admin modules.
- **No extra collections.** "Batch" is a plain string on `Student` (e.g. `Morning-A`), not a collection. "Role" lives inside `users`, not a separate collection. Contact messages and franchise applications are independent entities (the form is filled by the public, not necessarily a student), so they are **not** child documents of `students`.
- `settings` is a singleton — a single document in its own collection (recommended in §3.6).

---

## 2. Complete schema for every collection

### 2.1 `users`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `name` | String | ✅ | — | — | — | Admin/staff display name |
| `email` | String | ✅ | ✅ unique | — | — | Login identifier |
| `passwordHash` | String | ✅ | — | — | — | bcrypt hash; never plain text |
| `role` | String | ✅ | — | `"admin"` | enum `["admin","staff"]` | Authorization |
| `status` | String | — | — | `"active"` | enum `["active","inactive"]` | Soft-delete without removing record |
| `lastLoginAt` | Date | — | — | — | — | Audit |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

Notes:
- `role` starts as `"admin"` for the seeded first account. `"staff"` for everyone else.
- `status` `"inactive"` locks the account without losing history.
- Future: add `resetPasswordToken` / `resetPasswordExpires` if password reset is added later.

### 2.2 `students`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `fullName` | String | ✅ | — | — | — | Student's full name |
| `rollNumber` | String | ✅ | ✅ unique | — | — | Institute roll number (e.g. `RCC/2026/001`) |
| `email` | String | ✅ | ✅ unique | — | — | Contact email |
| `phone` | String | ✅ | — | — | — | Contact phone |
| `courseId` | ObjectId | ✅ | — | — | → `courses._id` | Enrollment lookup |
| `courseName` | String | ✅ | — | — | — | Denormalized for display / search without a join |
| `batch` | String | ✅ | — | — | — | e.g. `Morning-A`, `Evening-B` |
| `admissionDate` | Date | ✅ | — | — | — | |
| `status` | String | — | — | `"active"` | enum `["active","completed","pending","inactive"]` | Lifecycle |
| `avatarColor` | String | — | — | `"#1F3354"` | — | Hex colour for initials avatar (frontend) |
| `courseFree` | String | — | — | `""` | — | Free-text course name if dropdown choice doesn't fit |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

Notes:
- `courseId` is the canonical reference; `courseName` is denormalized so the frontend never needs a join to render a student row.
- `courseFree` exists in the student form; it should be merged into `courseName` on save (and `courseId` populated by matching the name to `courses.name`).
- All dates are `Date` in the DB (the frontend currently stores them as strings like `"12 Jan 2026"` — migration must parse them).

### 2.3 `courses`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `name` | String | ✅ | ✅ unique | — | — | Full course title |
| `description` | String | ✅ | — | — | — | |
| `duration` | String | ✅ | — | — | — | e.g. `"12 Months"` |
| `fees` | String | ✅ | — | — | — | e.g. `"₹18,000"` (keep as string; may become number later) |
| `category` | String | ✅ | — | — | — | e.g. `"Diploma"`, `"Accounting"` |
| `accent` | String | — | — | `"#1F3354"` | — | Hex colour for the course card header |
| `status` | String | — | — | `"active"` | enum `["active","inactive"]` | Hide inactive from the public catalog |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

Notes:
- No `image` field today — banners/courses use `accent` colour panels in the frontend. Image support can be added later via an upload API + `public/uploads` or cloud storage.
- Category is a free string, not a reference (small, static catalog).

### 2.4 `certificates`

The richest document. It must be **self-contained for public verification** (see §5) while still holding typed references for querying.

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `certificateNumber` | String | ✅ | ✅ unique | — | — | Verification key, e.g. `RCC-2026-0001` |
| `studentId` | ObjectId | ✅ | — | — | → `students._id` | Link to student (kept even if student is soft-deleted) |
| `courseId` | ObjectId | ✅ | — | — | → `courses._id` | Link to course |
| `documentType` | String | ✅ | — | — | enum `["excellence","marksheet"]` | Which generator template |
| `type` | String | ✅ | — | — | alias of `documentType` | Backward compat with current `CertificateRecord.type` |
| `slNo` | String | ✅ | — | — | — | Serial number on the certificate |
| `rollNo` | String | ✅ | — | — | — | Denormalized for display |
| `enrollmentNo` | String | ✅ | — | — | — | |
| `studentName` | String | ✅ | — | — | — | **Denormalized** so verification survives student deletion |
| `fatherName` | String | — | — | — | — | |
| `motherName` | String | — | — | — | — | Marksheet only |
| `courseCode` | String | ✅ | — | — | — | e.g. `ADCA-2026` |
| `courseName` | String | ✅ | — | — | — | Denormalized display name |
| `completionDate` | Date | ✅ | — | — | — | |
| `trainingCenter` | String | ✅ | — | — | — | e.g. `Rama Coaching Center, Main Branch` |
| `centerCode` | String | — | — | — | — | Certificate of Excellence only |
| `performance` | String | — | — | — | — | Certificate of Excellence only (e.g. `A+`) |
| `courseDuration` | String | — | — | — | — | Marksheet only |
| `photoUrl` | String | — | — | — | — | Marksheet only (currently unused by UI; kept for completeness) |
| `issuedById` | ObjectId | — | — | — | → `users._id` | Who issued it (audit) |
| `issueDate` | Date | ✅ | — | — | — | Date printed on the certificate |
| `status` | String | ✅ | — | `"issued"` | enum `["issued","pending","revoked"]` | Lifecycle |
| `dated` | String | ✅ | — | — | — | Footer date string (e.g. `"28 August 2026"`) |
| `place` | String | ✅ | — | — | — | Footer place (e.g. `"Fatehpur"`) |
| `subjects` | `[MarkRow]` | — | — | `[]` | — | Marksheet only; embedded subdocuments (see §2.7) |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

Notes:
- `studentName`, `rollNo`, `courseName`, `courseCode`, `trainingCenter`, `dated`, `place` are **denormalized** into this document. This is intentional: verification must succeed even if the referenced student or course is deleted (historical preservation — see §3.4).
- `subjects` is an **embedded array** (§2.7), not a separate collection.
- `issuedById` is optional; populate it once auth is implemented.
- For certificates where the template does not use a field (e.g. `motherName` on an excellence cert), the field is simply absent/empty — Mongoose allows sparse documents; the schema marks type-specific fields as optional.

### 2.5 `testimonials`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `studentName` | String | ✅ | — | — | — | |
| `course` | String | ✅ | — | — | — | Denormalized course name |
| `courseId` | ObjectId | — | — | — | → `courses._id` | Optional lookup |
| `review` | String | ✅ | — | — | — | |
| `rating` | Number | ✅ | — | — | enum `1..5` | |
| `avatarColor` | String | — | — | `"#1F3354"` | — | Hex colour for initials avatar |
| `published` | Boolean | — | — | `true` | — | Draft vs live |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

### 2.6 `banners`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `heading` | String | ✅ | — | — | — | |
| `description` | String | ✅ | — | — | — | |
| `buttonText` | String | ✅ | — | — | — | |
| `buttonLink` | String | ✅ | — | — | — | Internal route, e.g. `/courses` |
| `accent` | String | — | — | `"#b91c1c"` | — | Hex colour for the gradient panel |
| `active` | Boolean | — | — | `true` | — | Show/hide on the site |
| `ordering` | Number | — | — | `0` | — | Sort order |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

Notes:
- No `image` field today — the frontend renders a gradient panel using `accent`. Image upload can be added later (§8).
- `ordering` supports reordering the banner carousel.

### 2.7 `achievements`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `value` | String | ✅ | — | — | — | e.g. `"500+"`, `"95%"` |
| `label` | String | ✅ | — | — | — | e.g. `"Students Trained"` |
| `description` | String | — | — | — | — | |
| `icon` | String | ✅ | — | `"Star"` | — | lucide icon name (frontend) |
| `status` | String | — | — | `"active"` | enum `["active","inactive"]` | |
| `ordering` | Number | — | — | `0` | — | Sort order |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

### 2.8 `notices`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `title` | String | ✅ | — | — | — | |
| `description` | String | ✅ | — | — | — | |
| `date` | Date | ✅ | — | — | — | |
| `priority` | String | ✅ | — | `"normal"` | enum `["low","normal","high"]` | |
| `published` | Boolean | — | — | `true` | — | |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

### 2.9 `contactMessages`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `name` | String | ✅ | — | — | — | Sender name |
| `email` | String | ✅ | — | — | — | |
| `phone` | String | ✅ | — | — | — | |
| `message` | String | ✅ | — | — | — | |
| `status` | String | — | — | `"unread"` | enum `["read","unread"]` | |
| `date` | Date | — | — | `Date.now` | — | |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

Notes:
- No `studentId` — these come from the public contact form and may be from non-students.
- No further normalization needed.

### 2.10 `franchiseApplications`

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `name` | String | ✅ | — | — | — | Applicant name |
| `email` | String | ✅ | — | — | — | |
| `phone` | String | ✅ | — | — | — | |
| `city` | String | ✅ | — | — | — | |
| `state` | String | ✅ | — | — | — | |
| `message` | String | ✅ | — | — | — | |
| `status` | String | ✅ | — | `"pending"` | enum `["pending","contacted","approved","rejected"]` | |
| `date` | Date | — | — | `Date.now` | — | |
| `createdAt` | Date | ✅ | — | `Date.now` | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

Notes:
- No `studentId` — franchise applicants are external.
- `status` transitions are driven by the admin (Pending → Contacted → Approved/Rejected).

### 2.11 `settings`

A single-document singleton collection.

| Field | Type | Required? | Unique? | Default | Reference | Purpose |
|---|---|---|---|---|---|---|
| `instituteName` | String | ✅ | — | — | — | |
| `phone` | String | ✅ | — | — | — | |
| `email` | String | ✅ | — | — | — | |
| `address` | String | ✅ | — | — | — | |
| `website` | String | — | — | — | — | |
| `facebook` | String | — | — | — | — | |
| `instagram` | String | — | — | — | — | |
| `youtube` | String | — | — | — | — | |
| `linkedin` | String | — | — | — | — | |
| `footerText` | String | — | — | — | — | |
| `updatedAt` | Date | ✅ | — | `Date.now` | — | |

Notes:
- Recommended approach: **single collection, single document** (not embedded in `users`, not a multi-document collection). A singleton `settings` document is decoupled from any user, lets multiple staff edit profile without touching a user doc, and is trivially fetched with `Settings.findOne()`. Enforce the singleton in application logic (findOrCreate with a fixed id, or enforce `countDocuments() <= 1`).
- The frontend's disabled "Logo / Favicon" upload is intentionally out of scope for phase 1 (§8).

### 2.12 Sub-document: `MarkRow` (embedded inside `certificates.subjects`)

| Field | Type | Required? | Unique? | Default | Purpose |
|---|---|---|---|---|---|
| `paper` | String | ✅ | — | — | Paper number (e.g. `"1"`) |
| `subject` | String | ✅ | — | — | Subject name |
| `theoryMax` | Number | ✅ | — | — | |
| `theoryMin` | Number | ✅ | — | — | |
| `practicalMax` | Number | ✅ | — | — | |
| `practicalMin` | Number | ✅ | — | — | |
| `total` | Number | ✅ | — | — | |
| `grade` | String | ✅ | — | — | e.g. `"A+"` |

Notes:
- Embedded array — no separate collection, because subjects belong exclusively to one certificate and verification must read them without a join.
- Frontend stores the numeric fields as strings; migration step converts them to `Number`.

---

## 3. Relationships

```
Student 1 ────────── N  Certificates        (one student → many certificates)
Course   1 ────────── N  Students            (one course → many students)
Course   1 ────────── N  Certificates        (one course → many certificates)
User     1 ────────── N  Certificates        (issued-by audit; optional)
ContactMessage  (standalone)                (no student ref)
FranchiseApplication  (standalone)          (no student ref)
```

**Cardinality notes:**
- A student has **many** certificates (one per course/type issued).
- A course has **many** students and **many** certificates.
- Each certificate references **one** student and **one** course via `ObjectId`.
- Contact messages and franchise applications are **independent** — they are filled by the general public, not necessarily enrolled students. Forcing a `studentId` there would be wrong and would block submissions.

### 3.1 Deletion behaviour (coaching-institute policy)

| Parent deleted | Child behaviour | Rationale |
|---|---|---|
| `student` | **Certificates NOT deleted.** `studentId` kept as-is (or nullified); denormalized `studentName`/`rollNo` remain. | Legal/historical records must survive. A coaching institute must be able to verify past certificates years later. |
| `course` | **Certificates NOT deleted.** `courseId` kept. | Same — historical accuracy. |
| `certificate` | **Soft delete** recommended (`status: "revoked"` + `deletedAt`). | Certificates are legal documents; hard delete destroys audit trail. |
| `course` (catalog) | Prefer **soft delete** (`status: "inactive"` / `"archived"`) over hard delete. | Prevents breaking existing student/certificate references. |

**Recommendation:** Use **soft deletes everywhere** (a `deletedAt: Date` or a `status: "deleted"` flag). Hard delete should be gated behind an admin "purge" action and never automatic.

---

## 4. Index strategy

| Collection | Index | Why |
|---|---|---|
| `users` | `email` **unique** | Login lookup must be fast and unambiguous |
| `students` | `rollNumber` **unique** | Roll number is the natural key; used in verification fallbacks |
| `students` | `email` **unique** | Prevent duplicate accounts |
| `students` | `courseId` | "Show all students in a course" |
| `students` | `status` | Filter active/completed/pending |
| `courses` | `name` **unique** | Prevent duplicate course entries |
| `courses` | `status` | Filter active catalog |
| `certificates` | `certificateNumber` **unique** | **The verification key** — single indexed lookup |
| `certificates` | `studentId` | "Show all certificates for a student" |
| `certificates` | `courseId` | "Certificates issued for a course" |
| `certificates` | `status` | Filter issued/pending/revoked |
| `certificates` | `issueDate` | Date-range reports |
| `testimonials` | `published` | Show only live testimonials |
| `banners` | `active` | Show only active banners |
| `banners` | `ordering` | Sort carousels |
| `achievements` | `status` | Show active stats |
| `achievements` | `ordering` | Sort |
| `notices` | `published` | Show only live notices |
| `notices` | `priority` | Sort by priority |
| `notices` | `date` | Chronological listing |
| `contactMessages` | `status` | Unread count / triage |
| `contactMessages` | `createdAt` | Sorted inbox |
| `franchiseApplications` | `status` | Filter pending/contacted/approved/rejected |
| `franchiseApplications` | `createdAt` | Chronological |
| `settings` | (none needed — singleton `findOne()`) | |

**Guideline:** Do not over-index. Every index slows writes and uses RAM, so index only fields used in filters, joins, or sort orders. The unique constraints on `users.email`, `students.rollNumber`, `students.email`, and `certificates.certificateNumber` are the most critical — they enforce business keys at the database level.

---

## 5. Certificate verification architecture

The verification page accepts a **certificate number** (or roll number) and returns the certificate + student summary. The database is designed so this is a **single indexed lookup** that works even if the student or course is deleted.

```
User enters certificateNumber (e.g. RCC-2026-0001)
        │
        ▼
GET /api/verify?certificateNumber=RCC-2026-0001
        │
        ▼
  certificates.findOne({ certificateNumber })   ← unique indexed field
        │
        ▼
  Returns the full certificate document, which already contains
    studentName, rollNo, courseName, courseCode,
    issueDate, trainingCenter, performance, subjects …
        │
        ▼
  UI renders the verified result — no extra joins needed
```

**Why this is resilient:**
- `studentName`, `rollNo`, `courseName` are **embedded** in the certificate document, so the page renders correctly even if `students` or `courses` documents are soft-deleted later.
- `certificateNumber` is **unique + indexed**, so lookups are O(1).
- Roll-number fallback is also possible: `certificates.findOne({ rollNo })` (rollNo is not unique across students but is unique within a certificate stream in practice; if needed, combine `{ rollNo, courseCode }`).
- The response is **read-only** — verification never mutates data.

---

## 6. Future API mapping (no code written)

Authentication comes first; all other endpoints assume a valid JWT / session.

```
# Auth
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/me
POST   /api/auth/logout

# Users (admin management)
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

# Students
GET    /api/students
GET    /api/students/:id
POST   /api/students
PUT    /api/students/:id
DELETE /api/students/:id

# Courses
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id

# Certificates
GET    /api/certificates
GET    /api/certificates/:id
POST   /api/certificates
PUT    /api/certificates/:id
DELETE /api/certificates/:id
GET    /api/certificates/:id/print          # returns HTML for window.print()
POST   /api/certificates/:id/issue          # generate + save a new cert

# Verification
GET    /api/verify?certificateNumber=...     # public, no auth

# Testimonials
GET    /api/testimonials
GET    /api/testimonials/:id
POST   /api/testimonials
PUT    /api/testimonials/:id
DELETE /api/testimonials/:id

# Banners
GET    /api/banners
GET    /api/banners/:id
POST   /api/banners
PUT    /api/banners/:id
DELETE /api/banners/:id

# Achievements
GET    /api/achievements
GET    /api/achievements/:id
POST   /api/achievements
PUT    /api/achievements/:id
DELETE /api/achievements/:id

# Notices
GET    /api/notices
GET    /api/notices/:id
POST   /api/notices
PUT    /api/notices/:id
DELETE /api/notices/:id

# Contact messages
GET    /api/messages
GET    /api/messages/:id
PUT    /api/messages/:id/read               # mark as read
DELETE /api/messages/:id
POST   /api/messages                        # public form submission

# Franchise applications
GET    /api/franchise
GET    /api/franchise/:id
POST   /api/franchise
PUT    /api/franchise/:id
DELETE /api/franchise/:id

# Settings (singleton)
GET    /api/settings
PUT    /api/settings

# Upload (for future logo / banner images)
POST   /api/upload
```

---

## 7. Migration plan (frontend mock → MongoDB + API)

The current UI is already structured for a data-source swap — every admin page holds a local `useState` initialized from a `data/*.ts` array and wires add/edit/delete to that state. Migration is therefore a **data-source replacement**, not a UI rewrite.

**Step 1 — Seed MongoDB.** Import the existing `data/*.ts` arrays into MongoDB collections (one-off script or `mongorestore`). Map string dates → `Date`, merge `courseFree` into `courseName`, keep `certificateNumber` unique.

**Step 2 — Create Mongoose schemas.** Use the schemas in §2 (they are a near 1:1 match to the existing TS interfaces). The only structural additions are the relationship fields (`studentId`, `courseId`, `courseName`, `issuedById`) and lifecycle timestamps.

**Step 3 — Create Route Handlers.** Build the endpoints in §6. The shape of each response matches the existing TS interface, so the UI needs minimal changes.

**Step 4 — Wire the UI.** Replace every `useState(seedArray)` + local setter with:
```ts
const [items, setItems] = useState([]);
useEffect(() => { fetch("/api/students").then(r => r.json()).then(setItems); }, []);
```
Then replace local `setItems(...)` calls inside add/edit/delete modals with the matching `fetch(..., {method:"POST"/"PUT"/"DELETE"})` calls. Because the frontend already has a complete CRUD UI, the wiring is mechanical.

**Step 5 — Certificate generator reuse.** `CertificateForm` and `CertificatePreview` remain unchanged. The `Certificates` admin page builds a `CertificateData` object from the selected student + form state and passes it to `CertificateForm` (via the `initialData` prop already added) and `CertificatePreview`. On "Save to Records," the page POSTs to `/api/certificates`. The generator itself does not need to change — it is already decoupled and reusable.

**Migration rule of thumb:** keep the existing TypeScript interfaces as the contract between frontend and API. The API response shape = the current `data/*.ts` shape + the new relationship fields.

---

## 8. Potential problems / risks

1. **Date formats are strings in the frontend.** Students, certificates, notices, messages, and franchise apps all store dates as strings (`"12 Jan 2026"`). MongoDB needs `Date` for sorting/range queries. **Migration must parse these strings.** The frontend also prints them verbatim, so keep a consistent display format (e.g. `toLocaleDateString("en-IN")`).

2. **Numeric fields stored as strings.** `MarkRow.theoryMax/theoryMin/practicalMax/practicalMin/total` are strings in the frontend. Store as `Number` in MongoDB and convert on migration. If any downstream logic compares them as strings, update that logic at the same time.

3. **`photoUrl` (marksheet) exists in the type but is never rendered.** Keep it as an optional field for completeness, but do not build UI around it until a photo-upload feature is actually requested.

4. **`courseFree` is a form-only field** on the Student page. It is not in `data/types.ts`. Either merge it into `courseName` at save time, or add it to the model as a nullable `customCourseName`. Do **not** ship it as a separate persisted column without deciding.

5. **Image upload is disabled today.** Settings (logo/favicon), courses, and banners currently use colours/icons instead of images. Adding real images requires: an upload route (`POST /api/upload`), a storage destination (`public/uploads` or cloud), and a `url` field on the relevant document. **Out of phase 1.**

6. **Certificate type-specific fields are sparse.** `centerCode`/`performance` belong to excellence; `motherName`/`courseDuration`/`subjects` belong to marksheet. The schema should allow these fields to be absent without validation errors. The API must validate based on `documentType` (e.g. reject a marksheet with no `subjects`).

7. **Soft-delete vs hard-delete consistency.** Pick one policy and apply it uniformly. A mixed approach (hard-delete messages, soft-delete students) creates confusion. Recommended: **soft-delete everywhere** (`deletedAt: Date`), with a separate admin "purge" action if needed.

8. **Roll number uniqueness.** `students.rollNumber` is unique in the mock data, but the frontend does not enforce it. The DB unique index enforces it — the API must catch the duplicate-key error and surface it as a form error.

9. **Verification must remain public and fast.** The `/api/verify` endpoint must not require auth and must use the `certificateNumber` unique index. Do not add joins or population here — the embedded denormalized fields exist precisely to make this a single-document read.

10. **Mongoose discriminator option.** Do **not** use Mongoose discriminators for `excellence` vs `marksheet` certificates. They share enough fields; keep them in one `certificates` collection and just allow type-specific fields to be optional. Discriminators would add complexity for little benefit here.

---

*End of architecture document. Awaiting your approval before any backend implementation (models, APIs, DB connection, or seeding).*
