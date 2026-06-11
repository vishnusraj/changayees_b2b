# CHANGAYEES API SPECIFICATION

Version: 1.0

Status: Backend Contract

Owner: Engineering Team

API Style: REST

Authentication: JWT

Content Type: application/json

Base URL:

/api/v1

---

# API PRINCIPLES

All APIs must:

* Be RESTful
* Be Versioned
* Return Consistent Responses
* Support Pagination
* Support Filtering
* Support Sorting
* Return Proper Status Codes

---

# STANDARD RESPONSE FORMAT

Success

{
"success": true,
"message": "Request completed",
"data": {}
}

---

Error

{
"success": false,
"message": "Something went wrong",
"errors": []
}

---

# AUTHENTICATION APIs

---

## Login

POST

/auth/login

Request

{
"email": "",
"password": ""
}

Response

{
"token": "",
"user": {}
}

---

## Forgot Password

POST

/auth/forgot-password

---

## Reset Password

POST

/auth/reset-password

---

## Logout

POST

/auth/logout

---

# USER MANAGEMENT

---

## Get Users

GET

/users

---

## Get User

GET

/users/{id}

---

## Create User

POST

/users

---

## Update User

PUT

/users/{id}

---

## Delete User

DELETE

/users/{id}

---

# ROLE MANAGEMENT

---

GET /roles

POST /roles

PUT /roles/{id}

DELETE /roles/{id}

---

# CATEGORY APIs

---

## List Categories

GET

/categories

---

## Get Category

GET

/categories/{id}

---

## Create Category

POST

/categories

---

## Update Category

PUT

/categories/{id}

---

## Delete Category

DELETE

/categories/{id}

---

# PRODUCT APIs

---

## List Products

GET

/products

Query Parameters

page

limit

category

subcategory

search

sort

status

---

## Get Product

GET

/products/{slug}

---

## Create Product

POST

/products

---

## Update Product

PUT

/products/{id}

---

## Delete Product

DELETE

/products/{id}

---

## Feature Product

PATCH

/products/{id}/feature

---

## Upload Product Images

POST

/products/{id}/images

---

# INDUSTRY APIs

---

GET /industries

GET /industries/{slug}

POST /industries

PUT /industries/{id}

DELETE /industries/{id}

---

# RFQ APIs

---

## Submit RFQ

POST

/rfqs

Request

{
"organization": "",
"contactPerson": "",
"email": "",
"phone": "",
"requirements": "",
"expectedQuantity": ""
}

---

## Get RFQs

GET

/rfqs

---

## Get RFQ Details

GET

/rfqs/{id}

---

## Update RFQ

PUT

/rfqs/{id}

---

## Assign RFQ

PATCH

/rfqs/{id}/assign

---

## Change RFQ Status

PATCH

/rfqs/{id}/status

---

# CONTACT FORM APIs

---

## Submit Contact Request

POST

/contact

---

## Get Contact Requests

GET

/contact

(Admin Only)

---

# LEAD APIs

---

## Get Leads

GET

/leads

---

## Get Lead Details

GET

/leads/{id}

---

## Update Lead

PUT

/leads/{id}

---

## Assign Lead

PATCH

/leads/{id}/assign

---

## Change Lead Status

PATCH

/leads/{id}/status

---

## Export Leads

GET

/leads/export

---

# CATALOG APIs

---

## List Catalogs

GET

/catalogs

---

## Download Catalog

POST

/catalogs/download

Request

{
"catalogId": "",
"name": "",
"phone": "",
"email": ""
}

---

## Create Catalog

POST

/catalogs

---

## Update Catalog

PUT

/catalogs/{id}

---

## Delete Catalog

DELETE

/catalogs/{id}

---

# BLOG APIs

---

GET /blogs

GET /blogs/{slug}

POST /blogs

PUT /blogs/{id}

DELETE /blogs/{id}

---

# CASE STUDY APIs

---

GET /case-studies

GET /case-studies/{slug}

POST /case-studies

PUT /case-studies/{id}

DELETE /case-studies/{id}

---

# TESTIMONIAL APIs

---

GET /testimonials

POST /testimonials

PUT /testimonials/{id}

DELETE /testimonials/{id}

---

# ORDER MANAGEMENT APIs

---

## Create Order

POST

/orders

Request

{
"customerName": "",
"organization": "",
"phone": "",
"email": ""
}

Response

{
"orderNumber": "",
"trackingId": ""
}

---

## Get Orders

GET

/orders

---

## Get Order Details

GET

/orders/{id}

---

## Update Order

PUT

/orders/{id}

---

## Delete Order

DELETE

/orders/{id}

---

# ORDER STATUS APIs

---

## Update Status

PATCH

/orders/{id}/status

Request

{
"status": "",
"customerNote": "",
"sendNotification": true
}

---

Workflow

Status Updated

↓

Timeline Created

↓

Tracking Updated

↓

WhatsApp Triggered

↓

Audit Logged

---

## Get Order Timeline

GET

/orders/{id}/timeline

---

# TRACKING APIs

---

## Track Order

POST

/track

Request

{
"trackingId": "",
"phone": ""
}

---

## Get Tracking Details

GET

/track/{trackingId}

Response

{
"order": {},
"timeline": [],
"notes": []
}

---

## Verify Tracking Access

POST

/track/verify

---

# CUSTOMER NOTES APIs

---

## Add Customer Note

POST

/orders/{id}/notes

---

## Get Notes

GET

/orders/{id}/notes

---

# WHATSAPP APIs

---

## Send Notification

POST

/notifications/whatsapp

---

## Get Notification Logs

GET

/notifications/whatsapp

---

## Retry Notification

POST

/notifications/whatsapp/{id}/retry

---

# EMAIL APIs

---

## Send Email

POST

/notifications/email

---

## Get Email Logs

GET

/notifications/email

---

# MEDIA LIBRARY APIs

---

## Upload Media

POST

/media

---

## List Media

GET

/media

---

## Delete Media

DELETE

/media/{id}

---

# CMS APIs

---

## Pages

GET /pages

GET /pages/{slug}

POST /pages

PUT /pages/{id}

DELETE /pages/{id}

---

## Homepage Content

GET /cms/homepage

PUT /cms/homepage

---

## Industry Content

GET /cms/industries

PUT /cms/industries

---

## Footer Content

GET /cms/footer

PUT /cms/footer

---

# SETTINGS APIs

---

## General Settings

GET /settings/general

PUT /settings/general

---

## WhatsApp Settings

GET /settings/whatsapp

PUT /settings/whatsapp

---

## Email Settings

GET /settings/email

PUT /settings/email

---

## SEO Settings

GET /settings/seo

PUT /settings/seo

---

# ANALYTICS APIs

---

## Dashboard Analytics

GET

/analytics/dashboard

---

## Lead Analytics

GET

/analytics/leads

---

## RFQ Analytics

GET

/analytics/rfqs

---

## Order Analytics

GET

/analytics/orders

---

## Catalog Analytics

GET

/analytics/catalogs

---

## Website Analytics

GET

/analytics/website

---

# ROLE ACCESS MATRIX

Super Admin

Full Access

---

Sales Manager

Leads

RFQs

Orders

---

Order Manager

Orders

Tracking

Notifications

---

Production Manager

Order Status Updates

Tracking

---

Marketing Manager

Blogs

Catalogs

Case Studies

Testimonials

---

Content Manager

CMS

Pages

Media

---

# FUTURE APIs

Institution Portal

Invoices

Courier Tracking

Reorders

Vendor Management

Distributor Portal

ERP Integration

CRM Integration

Webhook Integrations

---

# API VERSIONING STRATEGY

Current

/api/v1

Future

/api/v2

Maintain backward compatibility.

Never break existing integrations.

Deprecate gradually.

---

# SECURITY REQUIREMENTS

JWT Authentication

Role Authorization

Rate Limiting

Input Validation

File Validation

Audit Logging

Secure Uploads

HTTPS Only

CSRF Protection

SQL Injection Prevention

XSS Protection

---

# PERFORMANCE REQUIREMENTS

Pagination

Lazy Loading

Caching

Response Compression

CDN Assets

Optimized Queries

Indexed Lookups

Background Jobs

Queue Processing
