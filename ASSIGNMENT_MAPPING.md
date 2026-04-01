# Assignment Mapping

## 1. User and Role Management
- Users can be created, viewed, updated, and deleted by admin.
- Roles supported: `viewer`, `analyst`, `admin`.
- User status supported: `active`, `inactive`.
- Inactive users cannot log in.

## 2. Financial Records Management
- Create, view, update, and delete financial records.
- Fields included: amount, type, category, date, notes.
- Supports filtering by type, category, date range, and search.
- Supports pagination and sorting.

## 3. Dashboard Summary APIs
- Total income
- Total expenses
- Net balance
- Category-wise totals
- Recent activity
- Monthly or weekly trends

## 4. Access Control Logic
- Viewer: read-only access to records and summaries.
- Analyst: read-only access to records and summaries.
- Admin: full access to records and users.
- Enforced using authentication + permission middleware.

## 5. Validation and Error Handling
- Zod validation for body/query inputs.
- Clean error responses and status codes.
- Invalid tokens, bad input, and missing resources are handled.

## 6. Data Persistence
- Uses JSON file persistence for easy local review.
- Data is stored in `data/db.json`.
- Reset supported with `npm run seed:reset`.

## Optional Enhancements Included
- JWT authentication
- Pagination
- Search
- Soft delete for records
- Rate limiting
- Deploy configs for Vercel and Render
