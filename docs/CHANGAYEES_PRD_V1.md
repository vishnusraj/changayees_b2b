# CHANGAYEES

## Product Requirements Document (PRD)

Version: 3.0
Status: Production Build
Platform: Mobile-First Web Application
Type: B2B Wholesale Uniform Procurement Platform

---

# PRODUCT VISION

Changayees is a mobile-first B2B procurement platform that enables schools, colleges, hospitals, hotels, corporate organizations, and institutions to discover, inquire, order, and track bulk uniform requirements.

The platform must not feel like a traditional ecommerce website.

Desktop Experience:

* Premium enterprise website
* Trust-building
* Product showcase
* Lead generation

Mobile Experience:

* Native app-inspired
* Fast
* Interactive
* Procurement-focused
* WhatsApp-first communication

The majority of users are expected to interact through mobile devices.

Therefore:

Desktop = Website

Mobile = App

---

# CORE BUSINESS MODEL

Changayees is NOT a retail ecommerce platform.

Do NOT implement:

* Shopping Cart
* Checkout
* Online Payments
* Customer Accounts

Instead implement:

* Product Discovery
* RFQ Submission
* WhatsApp Conversion
* Catalog Downloads
* Order Tracking
* Automated Notifications
* Lead Management

---

# TARGET USERS

Primary Users:

School Principals

School Administrators

Procurement Officers

College Management

University Administrators

Corporate Procurement Teams

Hospital Management

Hotel Management

Industrial Buyers

Security Agencies

---

# MOBILE-FIRST DESIGN PRINCIPLES

The platform must be designed mobile-first.

Desktop layouts are derived from mobile layouts.

---

## Mobile Design Inspiration

Linear Mobile

Notion Mobile

Airbnb Mobile

Stripe Dashboard Mobile

Apple Store Mobile

Shopify Mobile

---

## Mobile UX Principles

Large touch targets

Sticky actions

Bottom navigation

Swipeable content

Card-first layouts

Step-by-step forms

Minimal typing

Progressive disclosure

Fast interactions

Native-like transitions

---

# NAVIGATION

## Desktop Navigation

Home

Products

Industries

Catalogs

Case Studies

Blog

About

Contact

Track Order

---

## Mobile Navigation

Bottom Navigation Bar

Home

Products

Track

Catalogs

Contact

Persistent across the platform.

---

# HOMEPAGE

## Desktop

Traditional premium landing page.

---

## Mobile

App Dashboard Experience

Sections:

Header

Search

Quick Actions

Categories

Industries

Featured Products

Case Studies

WhatsApp CTA

---

# MOBILE QUICK ACTIONS

Request Quote

Track Order

Download Catalog

Call Us

WhatsApp Us

Displayed as app-style action cards.

---

# PRODUCT CATALOG

Categories:

School Uniforms

College Uniforms

Uniform Sarees

Corporate Uniforms

Sports Uniforms

Lab Coats

Accessories

---

# MOBILE PRODUCT EXPERIENCE

Should resemble a shopping application.

Features:

Swipeable Gallery

Sticky Bottom CTA

Product Specifications Accordion

Related Products Carousel

Quick Inquiry

WhatsApp Inquiry

---

# PRODUCT DETAIL PAGE

Gallery

Specifications

MOQ

Customization Options

Related Products

Request Quote

WhatsApp

Call Sales

Download Brochure

---

# RFQ SYSTEM

The RFQ system replaces the cart.

---

# MOBILE RFQ EXPERIENCE

Multi-step wizard.

Step 1

Institution Information

Step 2

Product Requirements

Step 3

Quantity

Step 4

File Upload

Step 5

Review

Step 6

Submit

Users should never see a long form.

---

# BULK ORDER SYSTEM

Dedicated procurement workflow.

Institution Type

Products

Quantities

References

Expected Delivery

Submission

---

# WHATSAPP-FIRST COMMUNICATION

WhatsApp is the primary conversion channel.

---

# WHATSAPP ENTRY POINTS

Homepage

Product Pages

Category Pages

Industry Pages

RFQ Completion

Contact Page

Tracking Page

---

# CATALOG CENTER

Catalogs:

School Uniforms

College Uniforms

Corporate Uniforms

Uniform Sarees

Company Profile

Brochures

---

# LEAD CAPTURE

Before download:

Name

Phone

Email

Organization

Location

---

# INDUSTRY PAGES

Schools

Colleges

Hospitals

Hotels

Corporate

Industrial

---

# EACH INDUSTRY PAGE

Industry Challenges

Recommended Products

Case Studies

Testimonials

Inquiry CTA

---

# CASE STUDIES

Client

Location

Industry

Challenge

Solution

Products Supplied

Outcome

Images

Testimonials

---

# BLOG

Procurement Guides

Uniform Guides

Fabric Knowledge

Industry Insights

Corporate Branding

School Branding

---

# ORDER TRACKING SYSTEM

Tracking is a core feature.

No login required.

---

# TRACKING METHOD

Customer receives:

Order ID

Tracking Link

Through WhatsApp

Example:

changayees.com/track/CHG-SCH-2026-00124

---

# MOBILE TRACKING EXPERIENCE

Must feel like an app.

Large status card

Progress percentage

Timeline

Order details

Customer notes

Quick support actions

---

# TRACKING PAGE

Order Summary

Current Status

Timeline

Expected Delivery

Notes

Support Actions

---

# ORDER STATUS WORKFLOW

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

# AUTOMATED WHATSAPP NOTIFICATIONS

Every status update must trigger a WhatsApp notification.

No manual intervention required.

---

# TRIGGERS

Order Confirmed

Fabric Ordered

Fabric Received

Cutting Started

Stitching Started

Quality Inspection

Packing

Dispatched

Delivered

Delay Alerts

Customer Notes Added

Weekly Progress Summary

---

# NOTIFICATION CONTENT

Order ID

Current Status

Tracking Link

Expected Delivery Date

Customer Notes

---

# ADMIN CMS

Everything should be manageable without developers.

---

# DASHBOARD

Products

Leads

Orders

RFQs

Downloads

Notifications

Analytics

---

# PRODUCT CMS

Create Product

Edit Product

Delete Product

Duplicate Product

Bulk Upload

Bulk Edit

SEO Settings

Media Upload

---

# CONTENT CMS

Homepage

About

Industries

Case Studies

Blogs

Catalogs

Footer

Contact Information

---

# MEDIA LIBRARY

Images

Videos

PDFs

Catalogs

Documents

Folders

Bulk Upload

---

# LEAD MANAGEMENT

Sources:

RFQ

Contact Form

Product Inquiry

Catalog Download

WhatsApp

Bulk Orders

---

# LEAD STATUS

New

Contacted

Quotation Sent

Negotiation

Won

Lost

---

# ORDER MANAGEMENT

Create Orders

Generate Tracking IDs

Update Status

Add Notes

Trigger WhatsApp Notifications

Track Timeline

View History

---

# USER ROLES

Super Admin

Sales Manager

Production Manager

Marketing Manager

Content Manager

Order Manager

---

# SEO REQUIREMENTS

Metadata

Open Graph

Schema

XML Sitemap

Canonical URLs

SEO Friendly URLs

---

# PERFORMANCE REQUIREMENTS

Mobile First

Responsive

Core Web Vitals

Accessibility

Image Optimization

Caching

Lazy Loading

---

# TECHNOLOGY STACK

Frontend:
Next.js 15

Language:
TypeScript

UI:
TailwindCSS

Components:
Shadcn UI

Animations:
Framer Motion

Backend:
Node.js

Database:
PostgreSQL

ORM:
Prisma

Storage:
AWS S3 / Cloudinary

Authentication:
RBAC

Hosting:
Vercel / AWS

WhatsApp:
Meta WhatsApp Business API

---

# FUTURE ROADMAP

Phase 2

Sample Request System

Uniform Configurator

CRM Integration

Email Automation

Lead Scoring

---

Phase 3

Institution Portal

Invoice Downloads

Reorder Management

Courier Integration

Distributor Portal

Vendor Portal

---

# SUCCESS METRICS

Increase RFQ Submissions

Increase WhatsApp Leads

Increase Catalog Downloads

Increase Conversion Rate

Reduce Support Calls

Improve Customer Transparency

Position Changayees as the most modern digital procurement platform in the institutional uniform industry.
