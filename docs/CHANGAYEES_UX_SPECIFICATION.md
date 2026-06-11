# CHANGAYEES UX SPECIFICATION

Version: 1.0

Status: Product Blueprint

Owner: Product Team

Purpose:
Define detailed behavior for all user-facing and admin-facing experiences.

---

# UX PRINCIPLES

## Mobile First

Every experience must be designed for mobile first.

Desktop is an enhancement.

---

## App-Like Experience

Mobile should behave like a native application.

Characteristics:

* Sticky actions
* Fast navigation
* Minimal scrolling
* Progressive disclosure
* Large touch targets
* Bottom navigation

---

## Procurement First

The objective is not purchasing.

The objective is:

* Discovery
* Inquiry
* Quotation
* Tracking
* Communication

---

# SCREEN 01

# HOMEPAGE

---

## User Goal

Understand what Changayees offers.

Find products quickly.

Contact sales.

---

## Components

Header

Search

Quick Actions

Categories

Featured Products

Industries

Testimonials

Catalog CTA

Footer

---

## Mobile Behavior

App dashboard style.

Large cards.

Bottom navigation visible.

---

## Desktop Behavior

Traditional landing page.

Multi-column layout.

---

## Loading State

Skeleton cards.

---

## Empty State

No products available.

Show contact CTA.

---

# SCREEN 02

# PRODUCT LISTING

---

## User Goal

Find relevant products.

---

## Components

Search

Filters

Sorting

Product Grid

Pagination

---

## Filters

Category

Subcategory

Fabric

Color

MOQ

---

## Mobile Behavior

Filters open in drawer.

Product cards stacked.

---

## Desktop Behavior

Left sidebar filters.

Grid layout.

---

## Empty State

No matching products.

Show clear filters action.

---

# SCREEN 03

# PRODUCT DETAIL

---

## User Goal

Understand product details.

Submit inquiry.

---

## Components

Gallery

Specifications

MOQ

Customization

Related Products

CTA

---

## Primary Actions

Request Quote

WhatsApp

Call Sales

---

## Mobile Behavior

Sticky bottom actions.

Swipe gallery.

Accordion specifications.

---

## Desktop Behavior

Two-column layout.

---

# SCREEN 04

# RFQ WIZARD

---

## User Goal

Submit requirements.

---

## Design Principle

Never show large forms.

---

## Step 1

Institution Information

Fields

Institution Name

Contact Person

Email

Phone

Location

---

Validation

Required

---

## Step 2

Product Requirements

Select Products

Custom Requirements

---

## Step 3

Quantity

Estimated Quantity

Student Count

Staff Count

---

## Step 4

Attachments

Upload Files

PDF

Excel

Images

---

## Step 5

Review

Show summary.

---

## Step 6

Submit

Confirmation.

---

## Success State

RFQ Submitted.

Reference Number Generated.

WhatsApp CTA.

---

# SCREEN 05

# CATALOG CENTER

---

## User Goal

Download catalogs.

---

## Components

Catalog Cards

Search

Categories

Lead Form

---

## Download Flow

Select Catalog

↓

Enter Details

↓

Submit

↓

Download

---

# SCREEN 06

# INDUSTRY PAGE

---

## User Goal

View industry-specific solutions.

---

## Components

Hero

Challenges

Products

Case Studies

Testimonials

Contact CTA

---

# SCREEN 07

# CASE STUDY DETAILS

---

## User Goal

Build confidence.

---

## Components

Challenge

Solution

Products

Results

Gallery

Testimonial

---

# SCREEN 08

# CONTACT PAGE

---

## User Goal

Reach Changayees.

---

## Components

Contact Form

Phone

Email

Map

WhatsApp

---

# SCREEN 09

# TRACK ORDER SEARCH

---

## User Goal

Locate order.

---

## Components

Order ID

Phone Number

Track Button

---

## Validation

Order ID required.

Phone required.

---

## Error State

Order not found.

Provide support CTA.

---

# SCREEN 10

# ORDER TRACKING DASHBOARD

---

## User Goal

Track progress.

---

## Components

Order Summary

Current Status

Progress Bar

Timeline

Customer Notes

Support Actions

---

## Current Status Card

Large

Prominent

Visible immediately

---

## Timeline

Vertical

Chronological

Status

Date

Notes

---

## Mobile Behavior

Single-column

App-like layout

---

## Desktop Behavior

Two-column

Summary + Timeline

---

# SCREEN 11

# WHATSAPP SUPPORT

---

## User Goal

Contact support quickly.

---

## Components

WhatsApp CTA

Call CTA

Email CTA

---

# ADMIN EXPERIENCE

---

# SCREEN 12

# DASHBOARD

---

## User Goal

Monitor business activity.

---

## Widgets

Products

Orders

RFQs

Leads

Downloads

Notifications

---

## Quick Actions

Add Product

Create Order

View Leads

---

# SCREEN 13

# PRODUCT LIST

---

## User Goal

Manage products.

---

## Components

Table

Search

Filters

Bulk Actions

---

## Actions

Edit

Delete

Duplicate

Preview

---

# SCREEN 14

# CREATE PRODUCT

---

## Sections

Basic Information

Media

Specifications

SEO

Publishing

---

## Validation

Required fields.

---

# SCREEN 15

# ORDER LIST

---

## User Goal

Manage orders.

---

## Components

Order Table

Filters

Search

Status Tags

---

# SCREEN 16

# ORDER DETAILS

---

## Components

Customer Information

Products

Timeline

Notes

Notifications

Tracking Link

---

# SCREEN 17

# UPDATE STATUS

---

## User Goal

Update production stage.

---

## Components

Status Dropdown

Customer Note

Notification Toggle

Save

---

## Workflow

Update Status

↓

Save

↓

Tracking Updated

↓

WhatsApp Triggered

↓

History Logged

---

# SCREEN 18

# LEAD LIST

---

## Components

Lead Table

Search

Filters

Assignment

Export

---

# SCREEN 19

# LEAD DETAILS

---

## Components

Contact Information

Source

Notes

History

Assignment

---

# SCREEN 20

# BLOG CMS

---

## Components

Blog List

Create Blog

Edit Blog

SEO

Publishing

---

# SCREEN 21

# MEDIA LIBRARY

---

## Components

Folders

Search

Upload

Preview

Delete

---

# SCREEN 22

# SETTINGS

---

## Sections

General

SEO

WhatsApp

Email

Users

Roles

---

# GLOBAL STATES

---

## Loading

Use skeleton loaders.

Never use spinners alone.

---

## Empty

Explain situation.

Provide next action.

---

## Error

Friendly messages.

Recovery actions.

---

## Success

Confirmation.

Next step guidance.

---

# ACCESSIBILITY

WCAG Compliant

Keyboard Accessible

Proper Labels

Focus States

Color Contrast Compliance

---

# RESPONSIVE RULES

Mobile First

Tablet Adaptive

Desktop Enhanced

---

# PERFORMANCE RULES

Fast Navigation

Optimized Images

Minimal Layout Shift

Efficient Forms

---

# UX SUCCESS METRICS

RFQ Completion Rate

Catalog Download Rate

WhatsApp Engagement

Order Tracking Usage

Lead Conversion Rate

Mobile Retention

Customer Satisfaction
