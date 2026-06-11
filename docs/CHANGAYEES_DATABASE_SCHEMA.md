# CHANGAYEES DATABASE SCHEMA

Version: 1.0

Status: Backend Foundation

Owner: Engineering Team

Database: PostgreSQL

ORM: Prisma

---

# DATABASE DESIGN PRINCIPLES

Goals:

* Scalable
* Normalized
* Audit Friendly
* Tracking Friendly
* CMS Friendly
* Analytics Friendly

---

# ENTITY OVERVIEW

Authentication

Users

Roles

Permissions

---

Catalog

Products

Categories

Subcategories

Product Images

Product Documents

---

Lead Generation

Leads

RFQs

Contact Requests

Catalog Downloads

---

Order Management

Orders

Order Items

Order Status History

Customer Notes

Tracking Links

---

Content Management

Pages

Blogs

Case Studies

Testimonials

Catalogs

Media

---

Notifications

WhatsApp Notifications

Email Notifications

Notification Logs

---

Settings

System Settings

SEO Settings

WhatsApp Settings

---

# USERS

Table: users

Purpose:
Admin users.

Fields:

id

name

email

phone

password_hash

role_id

status

last_login

created_at

updated_at

---

# ROLES

Table: roles

Fields:

id

name

description

created_at

---

Examples

Super Admin

Sales Manager

Order Manager

Production Manager

Marketing Manager

Content Manager

---

# PERMISSIONS

Table: permissions

Fields:

id

name

module

description

---

# ROLE PERMISSIONS

Table: role_permissions

Fields:

role_id

permission_id

---

# CATEGORIES

Table: categories

Fields:

id

name

slug

description

banner_image

sort_order

status

created_at

updated_at

---

Examples

School Uniforms

College Uniforms

Uniform Sarees

Corporate Uniforms

Accessories

---

# SUBCATEGORIES

Table: subcategories

Fields:

id

category_id

name

slug

description

status

created_at

updated_at

---

# PRODUCTS

Table: products

Fields:

id

product_code

name

slug

short_description

description

category_id

subcategory_id

fabric_type

moq

available_sizes

available_colors

is_featured

status

created_by

created_at

updated_at

---

# PRODUCT IMAGES

Table: product_images

Fields:

id

product_id

image_url

sort_order

created_at

---

# PRODUCT DOCUMENTS

Table: product_documents

Fields:

id

product_id

document_type

file_url

created_at

---

# INDUSTRIES

Table: industries

Fields:

id

name

slug

description

banner_image

status

created_at

---

Examples

Schools

Colleges

Hospitals

Hotels

Corporate

Industrial

---

# LEADS

Table: leads

Purpose:
Central lead repository.

Fields:

id

lead_number

name

phone

email

organization

designation

industry_id

source

status

assigned_to

notes

created_at

updated_at

---

Lead Sources

RFQ

Contact Form

Catalog Download

WhatsApp

Product Inquiry

Bulk Order

---

Lead Status

New

Contacted

Quotation Sent

Negotiation

Won

Lost

---

# CONTACT REQUESTS

Table: contact_requests

Fields:

id

name

phone

email

organization

message

created_at

---

# RFQS

Table: rfqs

Fields:

id

rfq_number

organization

contact_person

phone

email

industry_id

requirements

expected_quantity

expected_delivery

status

assigned_to

created_at

updated_at

---

RFQ Status

Submitted

Under Review

Quotation Sent

Approved

Rejected

Closed

---

# RFQ FILES

Table: rfq_files

Fields:

id

rfq_id

file_url

file_type

created_at

---

# CATALOGS

Table: catalogs

Fields:

id

title

description

thumbnail

file_url

category

status

created_at

---

# CATALOG DOWNLOADS

Table: catalog_downloads

Fields:

id

catalog_id

name

phone

email

organization

created_at

---

# ORDERS

Table: orders

Purpose:
Production tracking.

Fields:

id

order_number

tracking_id

customer_name

organization

phone

email

assigned_manager

expected_delivery

current_status

progress_percentage

created_at

updated_at

---

Tracking Example

CHG-SCH-2026-00124

---

# ORDER ITEMS

Table: order_items

Fields:

id

order_id

product_id

quantity

remarks

created_at

---

# ORDER STATUS HISTORY

Table: order_status_history

Purpose:
Timeline.

Fields:

id

order_id

status

customer_note

internal_note

updated_by

created_at

---

Status Values

Inquiry Received

Quotation Sent

Quotation Approved

Order Confirmed

Fabric Ordered

Fabric Received

Cutting Started

Cutting Completed

Stitching Started

Stitching Completed

Quality Inspection

Packing

Dispatched

Delivered

Closed

---

# CUSTOMER NOTES

Table: customer_notes

Fields:

id

order_id

message

visible_to_customer

created_by

created_at

---

# TRACKING LINKS

Table: tracking_links

Fields:

id

order_id

tracking_token

is_active

created_at

---

# WHATSAPP NOTIFICATIONS

Table: whatsapp_notifications

Fields:

id

order_id

phone

template_name

message

status

sent_at

created_at

---

Notification Status

Queued

Sent

Delivered

Read

Failed

---

# EMAIL NOTIFICATIONS

Table: email_notifications

Fields:

id

order_id

email

subject

status

sent_at

created_at

---

# BLOGS

Table: blogs

Fields:

id

title

slug

excerpt

content

featured_image

seo_title

seo_description

status

published_at

created_at

---

# CASE STUDIES

Table: case_studies

Fields:

id

title

slug

industry

client_name

challenge

solution

results

featured_image

status

created_at

---

# TESTIMONIALS

Table: testimonials

Fields:

id

name

organization

designation

testimonial

photo

status

created_at

---

# PAGES

Table: pages

Purpose:
CMS Pages.

Fields:

id

title

slug

content

seo_title

seo_description

status

created_at

---

# MEDIA

Table: media

Fields:

id

file_name

file_url

file_type

file_size

uploaded_by

created_at

---

# SYSTEM SETTINGS

Table: settings

Fields:

id

setting_key

setting_value

updated_at

---

Examples

Company Name

Phone

Email

Address

WhatsApp Number

Social Links

---

# SEO SETTINGS

Table: seo_settings

Fields:

id

page_type

page_id

meta_title

meta_description

og_image

canonical_url

updated_at

---

# AUDIT LOGS

Table: audit_logs

Purpose:
Track all admin actions.

Fields:

id

user_id

module

action

entity_id

old_value

new_value

created_at

---

# ANALYTICS EVENTS

Table: analytics_events

Fields:

id

event_name

event_type

user_identifier

metadata

created_at

---

Examples

Product Viewed

Catalog Downloaded

RFQ Submitted

WhatsApp Clicked

Tracking Viewed

Lead Created

---

# INDEXING STRATEGY

Indexes Required

products.slug

categories.slug

blogs.slug

orders.tracking_id

orders.order_number

leads.status

rfqs.status

notifications.status

---

# FUTURE TABLES

institution_accounts

reorders

invoices

courier_tracking

vendors

distributors

crm_sync

erp_sync

---

# DATABASE DESIGN RULES

Use UUIDs for all primary keys.

Use soft deletes where possible.

Store timestamps in UTC.

Track audit logs for all admin actions.

Never delete order history.

Never delete notification history.

All tracking updates must remain permanent.

Database must support future ERP integrations without schema redesign.
