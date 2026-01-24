# FundTracer

FundTracer is a **transparent, milestone-based fundraising and donation tracking platform** designed to build trust between donors, individuals, and NGOs. It ensures that every donated rupee is **tracked, verified, and reported** using modern technologies like **AI chatbots, AWS verification services, and geotagged evidence**.

---

## 🚀 Key Vision

> *"From donation to impact — every step verified, every milestone transparent."*

FundTracer solves a major problem in traditional fundraising: **lack of transparency and accountability**. Donors often don’t know how or where their money is used. FundTracer fixes this with:

* Milestone-based fund release
* AI-assisted chatbot support
* Document & image verification using AWS
* Real-time campaign progress tracking

---

## 🧩 Core Features

### 1. Campaign Management

* Create fundraising campaigns under categories like:

  * Disaster Relief
  * Medical Aid
  * Education
  * Water Purification
  * Stray & Animal Welfare
* Campaign types:

  * Individual
  * NGO-based

Each campaign includes:

* Goal amount
* Description & updates
* Donor list & contribution history
* Milestone-based progress tracking

---

### 2. 🤖 AI Chatbot (Gemini API Powered)

FundTracer includes an **intelligent AI chatbot** integrated using **Google Gemini API**.

#### Chatbot Capabilities:

* Explains campaign details to donors
* Answers FAQs about donations and milestones
* Guides users through:

  * Campaign creation
  * Donation process
  * Milestone verification status
* Helps admins understand pending verifications

#### How it works:

1. User asks a question via chat interface
2. Query is sent to backend
3. Gemini API processes the intent
4. Context-aware response is returned
5. Chatbot dynamically adapts responses based on campaign data

This improves **user trust, engagement, and clarity**.

---

## 🛡️ Milestone-Based Verification System (Core Innovation)

FundTracer uses a **5-phase milestone system** to ensure funds are used responsibly.

Each milestone must be **verified before moving to the next phase**.

### 🔐 Verification Workflow Overview

1. Campaign creator uploads:

   * Bills / invoices (PDF or image)
   * Geotagged images of goods or work done
2. Files are stored securely in **AWS S3**
3. **AWS Textract** analyzes documents
4. Extracted data is validated against milestone requirements
5. Admin verification approval
6. Milestone marked as completed

---

## 📍 Evidence Storage & Verification

### AWS Services Used

* **AWS S3**

  * Stores all uploaded documents
  * Stores geotagged images
  * Secure, immutable storage

* **AWS Textract**

  * Extracts structured data from bills & invoices
  * Identifies:

    * Supplier name
    * Location of supply
    * Items purchased
    * Quantity
    * Total price

* **Geo-tag Validation**

  * Ensures images are taken at the claimed location
  * Prevents reuse or fake uploads

---

## 🧱 5-Phase Milestone Breakdown

### 🟢 Phase 1: Assessment & Planning

* Initial needs assessment
* Beneficiary identification
* Planning fund utilization

**Verification Evidence:**

* Survey reports
* Planning documents
* Initial location images

---

### 🟡 Phase 2: Implementation Begins

* Purchase of goods or services
* Start of on-ground execution

**Verification Evidence:**

* Purchase invoices
* Supplier bills
* Geotagged images of procured goods

**AWS Textract extracts:**

* Supplier name
* Purchase location
* Item list
* Total amount

---

### 🟠 Phase 3: Mid-term Progress Review

* Monitoring implementation progress
* Partial distribution or usage confirmation

**Verification Evidence:**

* Progress reports
* Distribution images
* Mid-term expense documents

---

### 🔵 Phase 4: Continuation & Scaling

* Scaling successful implementation
* Extended reach or services

**Verification Evidence:**

* Additional invoices
* Updated geotagged images
* Resource utilization proof

---

### ✅ Phase 5: Final Completion & Impact Report

* Final execution completion
* Impact analysis
* Transparency report for donors

**Verification Evidence:**

* Final report
* Completion images
* Expense summary

Once Phase 5 is verified, the campaign is marked **Completed & Verified**.

---

## 👥 User Roles

### Donor

* View campaigns & milestones
* Track fund usage
* Receive verified updates
* Trust-backed donations

### Campaign Creator

* Create & manage campaigns
* Upload milestone evidence
* Communicate with donors

### Admin

* Verify milestone evidence
* Review AWS Textract results
* Approve or reject milestones

---

## 🧠 Tech Stack

### Backend

* Django / Django REST Framework
* PostgreSQL

### Frontend

* React / Next.js
* Modern UI with milestone timelines

### AI & Cloud

* Google Gemini API (Chatbot)
* AWS S3 (Storage)
* AWS Textract (Document Analysis)

---

## 📊 Transparency Dashboard

* Real-time campaign status
* Milestone completion percentage
* Donor contribution summary
* Verified expense breakdown

---

## 🌍 Impact

FundTracer ensures:

* Zero fake claims
* Complete fund traceability
* Higher donor confidence
* Scalable & auditable fundraising

---

## ✨ Future Enhancements

* Blockchain-based immutable records
* Automated fund release per milestone
* NGO verification badges
* Multilingual chatbot support

---

## 👨‍💻 Author

**Team Rockett**
B.Tech CSE (AI & ML)

---

> *FundTracer — because trust matters more than promises.*
