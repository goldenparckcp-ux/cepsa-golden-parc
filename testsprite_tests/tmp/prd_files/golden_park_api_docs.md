# Golden Park Station - API Documentation

## Base URL
`https://cepsa-golden-parc.vercel.app`

## 1. Authentication APIs

### Send OTP
- **Endpoint**: `/api/auth/otp/send`
- **Method**: `POST`
- **Description**: Sends a One-Time Password to the user's phone via Supabase Edge Functions / Twilio.
- **Request Body**:
  ```json
  {
    "phone": "+212600000000"
  }
  ```
- **Response**: `200 OK`
  ```json
  { "success": true, "message": "OTP sent successfully" }
  ```

### Verify OTP
- **Endpoint**: `/api/auth/otp/verify`
- **Method**: `POST`
- **Description**: Verifies the OTP and returns the user's ID.
- **Request Body**:
  ```json
  {
    "phone": "+212600000000",
    "token": "123456"
  }
  ```
- **Response**: `200 OK`
  ```json
  { "user": { "id": "uuid-string" } }
  ```

## 2. Profile Management

### Update Profile
- **Endpoint**: `/api/profile`
- **Method**: `POST`
- **Description**: Bypasses RLS using Service Role key to securely update the user's profile information.
- **Request Body**:
  ```json
  {
    "userId": "uuid-string",
    "updates": {
      "full_name": "John Doe",
      "phone": "0600000000"
    }
  }
  ```
- **Response**: `200 OK`
  ```json
  { "success": true, "profile": { ... } }
  ```

## 3. Order & Booking APIs

### Cancel Booking
- **Endpoint**: `/api/bookings/cancel`
- **Method**: `POST`
- **Description**: Cancels an active pool or hotel reservation. Calculates refund eligibility if within 45 minutes of scheduled time.
- **Request Body**:
  ```json
  {
    "bookingId": "uuid-string",
    "tableName": "pool_bookings"
  }
  ```
- **Response**: `200 OK`
  ```json
  { "success": true, "message": "Annulation effectuée." }
  ```

## 4. Developer / System APIs

### Get Maintenance Status
- **Endpoint**: `/api/dev-control`
- **Method**: `GET`
- **Description**: Retrieves the current maintenance configuration from Redis.
- **Response**: `200 OK`
  ```json
  {
    "config": {
      "global": false,
      "restaurant": false,
      "pool": false,
      "lubrifiants": false,
      "hotel": false,
      "admin": false,
      "staff": false
    }
  }
  ```

### Update Maintenance Status
- **Endpoint**: `/api/dev-control`
- **Method**: `POST`
- **Description**: Updates the maintenance configuration via a master secret key.
- **Request Body**:
  ```json
  {
    "secret": "goldenpark2026",
    "config": {
      "global": true,
      "restaurant": false,
      "pool": false,
      "lubrifiants": false,
      "hotel": false,
      "admin": false,
      "staff": false
    }
  }
  ```
- **Response**: `200 OK`
  ```json
  { "success": true, "config": { ... } }
  ```

## 5. Rate Limiting & Edge Middleware
- All `/api/*` routes are rate-limited via Upstash Redis edge middleware.
- **Limit**: Typically 60 requests per minute per IP. Returns HTTP `429 Too Many Requests` if exceeded.
