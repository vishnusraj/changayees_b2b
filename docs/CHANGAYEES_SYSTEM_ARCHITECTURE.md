# CHANGAYEES SYSTEM ARCHITECTURE

Version: 1.0

Status: Foundation Architecture

Owner: Engineering Team

---

# 1. ARCHITECTURE OVERVIEW

Changayees is a mobile-first B2B procurement platform.

The system consists of:

1. Public Website
2. Admin Portal
3. Order Tracking Portal
4. Lead Management System
5. Content Management System
6. WhatsApp Notification Engine

---

# 2. HIGH LEVEL ARCHITECTURE

Users

↓

Next.js Frontend

↓

API Layer

↓

Business Services

↓

PostgreSQL Database

↓

External Services

* WhatsApp Business API
* AWS S3
* Email Provider

---

# 3. APPLICATION MODULES

## Public Platform

Responsibilities:

* Product Discovery
* RFQ Submission
* Catalog Downloads
* Lead Generation
* Contact Requests
* Order Tracking

---

## Admin Portal

Responsibilities:

* Product Management
* Order Management
* Lead Management
* Content Management
* Catalog Management
* Blog Management

---

## Tracking Portal

Responsibilities:

* Public Order Tracking
* Progress Updates
* Timeline Visualization
* Customer Notes
* Support Actions

---

## Notification Engine

Responsibilities:

* WhatsApp Notifications
* Email Notifications
* Notification History
* Retry Mechanism

---

# 4. FRONTEND ARCHITECTURE

Framework

Next.js 15

---

Language

TypeScript

---

Styling

Tailwind CSS

---

Components

Shadcn UI

---

Animation

Framer Motion

---

Rendering Strategy

Marketing Pages:
SSG

Products:
ISR

Blogs:
ISR

Tracking:
SSR

Admin:
Client Side

---

# 5. PROJECT STRUCTURE

/app

/public

/admin

/track

/products

/catalogs

/industries

/blog

/about

/contact

/api

/components

/features

/services

/lib

/hooks

/types

/styles

/prisma

---

# 6. FEATURE MODULES

## Products

Product Listing

Product Details

Categories

Subcategories

Recommendations

---

## RFQ

RFQ Wizard

Bulk Order Wizard

File Uploads

Submission Management

---

## Leads

Lead Creation

Lead Assignment

Lead Status

Lead Notes

---

## Orders

Order Creation

Status Updates

Tracking Links

Notifications

---

## CMS

Pages

Blogs

Testimonials

Case Studies

Catalogs

---

# 7. DATABASE ARCHITECTURE

Database

PostgreSQL

---

ORM

Prisma

---

Primary Domains

Users

Products

Orders

Leads

RFQs

Content

Media

Notifications

Settings

---

# 8. AUTHENTICATION ARCHITECTURE

Authentication

Email + Password

---

Authorization

Role Based Access Control

---

Roles

Super Admin

Sales Manager

Order Manager

Production Manager

Marketing Manager

Content Manager

---

# 9. ORDER TRACKING ARCHITECTURE

Order Created

↓

Tracking ID Generated

↓

Tracking URL Generated

↓

Customer Receives WhatsApp Link

↓

Customer Views Timeline

↓

Status Updates Trigger Notifications

---

Tracking URL Example

/track/CHG-SCH-2026-00124

---

# 10. WHATSAPP NOTIFICATION ARCHITECTURE

Admin Updates Order

↓

Order Status Saved

↓

Event Triggered

↓

Notification Service

↓

WhatsApp API

↓

Customer Receives Update

---

Supported Events

Order Confirmed

Fabric Ordered

Fabric Received

Cutting Started

Stitching Started

Quality Inspection

Packing

Dispatched

Delivered

Delay Alert

Weekly Summary

---

# 11. FILE STORAGE ARCHITECTURE

Provider

AWS S3

---

Storage Categories

Products

Catalogs

Blog Images

Case Studies

RFQ Attachments

Order Attachments

Media Library

---

# 12. CMS ARCHITECTURE

Content Types

Pages

Blogs

Case Studies

Testimonials

Catalogs

Homepage Sections

Settings

---

Editable By

Content Manager

Marketing Manager

Super Admin

---

# 13. API ARCHITECTURE

REST APIs

---

Public APIs

Products

Categories

Catalogs

Blogs

Tracking

Contact

RFQ

---

Admin APIs

Products

Orders

Leads

Content

Media

Users

Analytics

---

# 14. ANALYTICS ARCHITECTURE

Track

Page Views

Product Views

Catalog Downloads

RFQ Submissions

WhatsApp Clicks

Order Tracking Views

Lead Sources

Conversion Metrics

---

# 15. SECURITY ARCHITECTURE

HTTPS Everywhere

Role Based Permissions

Secure File Uploads

Input Validation

Rate Limiting

Audit Logs

JWT Sessions

CSRF Protection

---

# 16. SCALABILITY STRATEGY

Modular Architecture

Feature-Based Structure

Database Indexing

CDN Assets

Caching Layer

Queue-Based Notifications

Background Jobs

---

# 17. FUTURE EXPANSION

Institution Portal

Invoice Downloads

Courier Tracking

Distributor Portal

Vendor Portal

ERP Integration

CRM Integration

Multi-Language Support

Multi-Region Support

---

# 18. DEPLOYMENT ARCHITECTURE

Frontend

Vercel

---

Backend

Node.js

---

Database

Managed PostgreSQL

---

Storage

AWS S3

---

Monitoring

Sentry

PostHog

Google Analytics

---

# 19. NON FUNCTIONAL REQUIREMENTS

Mobile First

Responsive

SEO Optimized

Accessible

Fast Loading

Secure

Scalable

Maintainable

Production Ready
