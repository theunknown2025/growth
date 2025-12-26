# Growth AI - Database Structure Documentation

## 📊 Database Overview

**Database Name**: `growthai`  
**Database Type**: MongoDB (NoSQL)  
**ODM**: Mongoose (Node.js)

---

## 📁 Collections

The database consists of **6 main collections**:

1. **users** - User accounts and authentication
2. **assignements** - Assignments and templates
3. **conversations** - Chat conversations
4. **simpletests** - Simple evaluation tests
5. **advancedtests** - Advanced evaluation tests
6. **companydetails** - Company information

---

## 1. Users Collection

**Collection Name**: `users`  
**Model**: `User`

### Schema Structure

```javascript
{
  _id: ObjectId,                    // Auto-generated
  firstName: String,                // Required
  lastName: String,                 // Required
  username: String,                 // Required, Unique, Lowercase
  email: String,                    // Required, Unique, Lowercase
  password: String,                 // Required, Min 6 chars, Hashed (bcrypt)
  role: String,                     // Enum: ['admin', 'client'], Default: 'client'
  createdAt: Date,                 // Auto-generated
  updatedAt: Date                  // Auto-generated
}
```

### Field Details

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Auto | Yes | - | MongoDB document ID |
| `firstName` | String | Yes | No | - | User's first name |
| `lastName` | String | Yes | No | - | User's last name |
| `username` | String | Yes | Yes | Lowercase | Unique username for login |
| `email` | String | Yes | Yes | Lowercase | User's email address |
| `password` | String | Yes | No | Min 6 chars | Hashed password (bcrypt) |
| `role` | String | No | No | Enum: admin/client | User role, default: 'client' |
| `createdAt` | Date | Auto | No | - | Document creation timestamp |
| `updatedAt` | Date | Auto | No | - | Document update timestamp |

### Indexes

- **Unique Index**: `username`
- **Unique Index**: `email`

### Relationships

- Referenced by: `assignements.owner`, `assignements.assignedTo`
- Referenced by: `simpletests.user`
- Referenced by: `advancedtests.user`
- Referenced by: `companydetails.user`

### Security

- Password is automatically hashed using bcrypt before saving
- Password comparison method: `matchPassword(enteredPassword)`

---

## 2. Assignements Collection

**Collection Name**: `assignements`  
**Model**: `Assignements`

### Schema Structure

```javascript
{
  _id: ObjectId,                    // Auto-generated
  title: String,                    // Required
  description: String,               // Required
  questions: [                       // Array of question objects
    {
      question: String,             // Required
      description: String,           // Required
      answer: String,               // Optional
      urlresources: [String],        // Array of URLs
      fileresources: [String]        // Array of file paths
    }
  ],
  status: String,                    // Enum: ['in progress', 'finished'], Default: 'in progress'
  deadline: Date,                    // Optional
  type: String,                     // Enum: ['assignement', 'template'], Default: 'assignement'
  owner: ObjectId,                  // Required, Reference to User
  assignedTo: ObjectId,             // Optional, Reference to User
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

### Field Details

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Auto | Yes | - | MongoDB document ID |
| `title` | String | Yes | No | - | Assignment title |
| `description` | String | Yes | No | - | Assignment description |
| `questions` | Array | No | No | - | Array of question objects |
| `questions[].question` | String | Yes | No | - | Question text |
| `questions[].description` | String | Yes | No | - | Question description |
| `questions[].answer` | String | No | No | - | User's answer |
| `questions[].urlresources` | [String] | No | No | - | Array of URL resources |
| `questions[].fileresources` | [String] | No | No | - | Array of file resources |
| `status` | String | No | No | Enum: in progress/finished | Assignment status |
| `deadline` | Date | No | No | - | Assignment deadline |
| `type` | String | No | No | Enum: assignement/template | Assignment type |
| `owner` | ObjectId | Yes | No | Ref: User | User who created the assignment |
| `assignedTo` | ObjectId | No | No | Ref: User | User assigned to complete |
| `createdAt` | Date | Auto | No | - | Document creation timestamp |
| `updatedAt` | Date | Auto | No | - | Document update timestamp |

### Indexes

- **Index**: `owner` (for faster queries)
- **Index**: `assignedTo` (for faster queries)
- **Index**: `type` (for filtering templates vs assignments)
- **Index**: `status` (for filtering by status)

### Relationships

- **References**: `User` (via `owner` and `assignedTo`)

---

## 3. Conversations Collection

**Collection Name**: `conversations`  
**Model**: `Conversation`

### Schema Structure

```javascript
{
  _id: ObjectId,                    // Auto-generated
  userId: String,                    // Required
  title: String,                    // Required
  messages: [                       // Array of message objects
    {
      sender: String,                // Required
      message: String,               // Required
      timestamp: Date                // Default: Date.now
    }
  ],
  createdAt: Date                   // Default: Date.now
}
```

### Field Details

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Auto | Yes | - | MongoDB document ID |
| `userId` | String | Yes | No | - | User ID who owns the conversation |
| `title` | String | Yes | No | - | Conversation title |
| `messages` | Array | No | No | - | Array of message objects |
| `messages[].sender` | String | Yes | No | - | Message sender (user/assistant) |
| `messages[].message` | String | Yes | No | - | Message content |
| `messages[].timestamp` | Date | No | No | Default: Date.now | Message timestamp |
| `createdAt` | Date | No | No | Default: Date.now | Conversation creation timestamp |

### Indexes

- **Index**: `userId` (for faster user conversation queries)
- **Index**: `createdAt` (for sorting by date)

### Relationships

- **References**: `User` (via `userId` - stored as String, not ObjectId)

---

## 4. SimpleTests Collection

**Collection Name**: `simpletests`  
**Model**: `SimpleTest`

### Schema Structure

```javascript
{
  _id: ObjectId,                    // Auto-generated
  scores: Map<String, Number>,      // Required - Key-value pairs of scores
  feedback: Map<String, String>,     // Required - Key-value pairs of feedback
  recommendations: Map<String, String>, // Required - Key-value pairs of recommendations
  answers: {
    assess: {
      marketResearch: String,
      consumerSegmentation: String,
      competitiveAnalysis: String,
      problemSolutionFit: String
    },
    implement: {
      brandPositioning: String,
      productDevelopment: String,
      marketingEffectiveness: String,
      customerExperience: String
    },
    monitor: {
      performanceTracking: String,
      consumerSentiment: String
    }
  },
  progress: Number,                 // Default: 0 (percentage 0-100)
  overall: String,                   // Optional overall assessment
  user: ObjectId,                    // Required, Reference to User
  status: String,                    // Enum: ['in progress', 'reviewed', 'completed'], Default: 'in progress'
  createdAt: Date                    // Default: Date.now
}
```

### Field Details

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Auto | Yes | - | MongoDB document ID |
| `scores` | Map | Yes | No | - | Map of category scores (Number) |
| `feedback` | Map | Yes | No | - | Map of category feedback (String) |
| `recommendations` | Map | Yes | No | - | Map of category recommendations (String) |
| `answers.assess.marketResearch` | String | No | No | Default: '' | Market research answer |
| `answers.assess.consumerSegmentation` | String | No | No | Default: '' | Consumer segmentation answer |
| `answers.assess.competitiveAnalysis` | String | No | No | Default: '' | Competitive analysis answer |
| `answers.assess.problemSolutionFit` | String | No | No | Default: '' | Problem-solution fit answer |
| `answers.implement.brandPositioning` | String | No | No | Default: '' | Brand positioning answer |
| `answers.implement.productDevelopment` | String | No | No | Default: '' | Product development answer |
| `answers.implement.marketingEffectiveness` | String | No | No | Default: '' | Marketing effectiveness answer |
| `answers.implement.customerExperience` | String | No | No | Default: '' | Customer experience answer |
| `answers.monitor.performanceTracking` | String | No | No | Default: '' | Performance tracking answer |
| `answers.monitor.consumerSentiment` | String | No | No | Default: '' | Consumer sentiment answer |
| `progress` | Number | No | No | Default: 0 | Test progress percentage (0-100) |
| `overall` | String | No | No | - | Overall assessment text |
| `user` | ObjectId | Yes | No | Ref: User | User who took the test |
| `status` | String | No | No | Enum: in progress/reviewed/completed | Test status |
| `createdAt` | Date | No | No | Default: Date.now | Test creation timestamp |

### Indexes

- **Index**: `user` (for faster user test queries)
- **Index**: `status` (for filtering by status)
- **Index**: `createdAt` (for sorting by date)

### Relationships

- **References**: `User` (via `user`)

### Answer Categories

**Assess Phase:**
- `marketResearch`
- `consumerSegmentation`
- `competitiveAnalysis`
- `problemSolutionFit`

**Implement Phase:**
- `brandPositioning`
- `productDevelopment`
- `marketingEffectiveness`
- `customerExperience`

**Monitor Phase:**
- `performanceTracking`
- `consumerSentiment`

---

## 5. AdvancedTests Collection

**Collection Name**: `advancedtests`  
**Model**: `AdvancedTest`

### Schema Structure

```javascript
{
  _id: ObjectId,                    // Auto-generated
  scores: Map<String, Number>,       // Required - Key-value pairs of scores
  feedback: Map<String, String>,     // Required - Key-value pairs of feedback
  recommendations: Map<String, String>, // Required - Key-value pairs of recommendations
  answers: {
    assess: {
      marketResearch: {
        main: String,
        researchSources: String,
        validatedFindings: String,
        aiTools: String
      },
      consumerSegmentation: {
        main: String,
        updatingSegments: String,
        behavioralPatterns: String,
        targetingCriteria: String
      },
      competitiveAnalysis: {
        main: String,
        competitorStrengths: String,
        marketTrends: String,
        competitiveAdvantage: String
      },
      problemSolutionFit: {
        main: String,
        validatedAssumptions: String,
        customerProblems: String,
        customerDissatisfaction: String
      }
    },
    implement: {
      brandPositioning: {
        main: String,
        brandValues: String,
        brandPerception: String,
        brandConsistency: String
      },
      productDevelopment: {
        main: String,
        customerInsights: String,
        productRoadmap: String,
        usabilityTesting: String
      },
      marketingEffectiveness: {
        main: String,
        targetedMessages: String,
        campaignPerformance: String,
        channelStrategy: String
      },
      customerExperience: {
        main: String,
        omniChannelExperience: String,
        customerService: String,
        continuousImprovement: String
      }
    },
    monitor: {
      performanceTracking: {
        main: String,
        kpiAlignment: String,
        metricsReview: String,
        trackingSystems: String
      },
      consumerSentiment: {
        main: String,
        feedbackCollection: String,
        sentimentAnalysis: String,
        socialMediaMonitoring: String
      }
    }
  },
  progress: Number,                  // Default: 0 (percentage 0-100)
  overall: String,                  // Optional overall assessment
  user: ObjectId,                    // Required, Reference to User
  status: String,                    // Enum: ['in progress', 'reviewed', 'completed'], Default: 'in progress'
  createdAt: Date                    // Default: Date.now
}
```

### Field Details

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Auto | Yes | - | MongoDB document ID |
| `scores` | Map | Yes | No | - | Map of category scores (Number) |
| `feedback` | Map | Yes | No | - | Map of category feedback (String) |
| `recommendations` | Map | Yes | No | - | Map of category recommendations (String) |
| `answers.assess.marketResearch.*` | String | No | No | Default: '' | Market research sub-answers |
| `answers.assess.consumerSegmentation.*` | String | No | No | Default: '' | Consumer segmentation sub-answers |
| `answers.assess.competitiveAnalysis.*` | String | No | No | Default: '' | Competitive analysis sub-answers |
| `answers.assess.problemSolutionFit.*` | String | No | No | Default: '' | Problem-solution fit sub-answers |
| `answers.implement.brandPositioning.*` | String | No | No | Default: '' | Brand positioning sub-answers |
| `answers.implement.productDevelopment.*` | String | No | No | Default: '' | Product development sub-answers |
| `answers.implement.marketingEffectiveness.*` | String | No | No | Default: '' | Marketing effectiveness sub-answers |
| `answers.implement.customerExperience.*` | String | No | No | Default: '' | Customer experience sub-answers |
| `answers.monitor.performanceTracking.*` | String | No | No | Default: '' | Performance tracking sub-answers |
| `answers.monitor.consumerSentiment.*` | String | No | No | Default: '' | Consumer sentiment sub-answers |
| `progress` | Number | No | No | Default: 0 | Test progress percentage (0-100) |
| `overall` | String | No | No | - | Overall assessment text |
| `user` | ObjectId | Yes | No | Ref: User | User who took the test |
| `status` | String | No | No | Enum: in progress/reviewed/completed | Test status |
| `createdAt` | Date | No | No | Default: Date.now | Test creation timestamp |

### Indexes

- **Index**: `user` (for faster user test queries)
- **Index**: `status` (for filtering by status)
- **Index**: `createdAt` (for sorting by date)

### Relationships

- **References**: `User` (via `user`)

### Answer Structure

Each category in AdvancedTest has multiple sub-questions:

**Assess Phase:**
- `marketResearch`: main, researchSources, validatedFindings, aiTools
- `consumerSegmentation`: main, updatingSegments, behavioralPatterns, targetingCriteria
- `competitiveAnalysis`: main, competitorStrengths, marketTrends, competitiveAdvantage
- `problemSolutionFit`: main, validatedAssumptions, customerProblems, customerDissatisfaction

**Implement Phase:**
- `brandPositioning`: main, brandValues, brandPerception, brandConsistency
- `productDevelopment`: main, customerInsights, productRoadmap, usabilityTesting
- `marketingEffectiveness`: main, targetedMessages, campaignPerformance, channelStrategy
- `customerExperience`: main, omniChannelExperience, customerService, continuousImprovement

**Monitor Phase:**
- `performanceTracking`: main, kpiAlignment, metricsReview, trackingSystems
- `consumerSentiment`: main, feedbackCollection, sentimentAnalysis, socialMediaMonitoring

---

## 6. CompanyDetails Collection

**Collection Name**: `companydetails`  
**Model**: `CompanyDetails`

### Schema Structure

```javascript
{
  _id: ObjectId,                    // Auto-generated
  companyName: String,               // Required, Trimmed
  sectorOfActivity: String,          // Required, Trimmed
  size: Number,                      // Required
  yearsOfActivity: Number,           // Required
  description: String,               // Required
  user: ObjectId,                    // Required, Reference to User
  createdAt: Date,                   // Default: Date.now
  updatedAt: Date                     // Auto-generated
}
```

### Field Details

| Field | Type | Required | Unique | Constraints | Description |
|-------|------|----------|--------|-------------|-------------|
| `_id` | ObjectId | Auto | Yes | - | MongoDB document ID |
| `companyName` | String | Yes | No | Trimmed | Company name |
| `sectorOfActivity` | String | Yes | No | Trimmed | Business sector |
| `size` | Number | Yes | No | - | Company size (number of employees) |
| `yearsOfActivity` | Number | Yes | No | - | Years in business |
| `description` | String | Yes | No | - | Company description |
| `user` | ObjectId | Yes | No | Ref: User | User who owns the company |
| `createdAt` | Date | No | No | Default: Date.now | Document creation timestamp |
| `updatedAt` | Date | Auto | No | - | Document update timestamp |

### Indexes

- **Index**: `user` (for faster user company queries)
- **Unique Index**: `user` (one company per user - if enforced)

### Relationships

- **References**: `User` (via `user`)
- **One-to-One**: Typically one company per user

---

## 🔗 Entity Relationship Diagram

```
┌─────────────┐
│    Users     │
│             │
│ _id         │◄─────┐
│ firstName   │      │
│ lastName    │      │
│ username    │      │
│ email       │      │
│ password    │      │
│ role        │      │
└─────────────┘      │
                     │
        ┌────────────┼────────────┐
        │            │            │
        │            │            │
┌───────▼──────┐ ┌───▼──────┐ ┌───▼──────────────┐
│ Assignements │ │SimpleTest│ │  AdvancedTest    │
│              │ │          │ │                  │
│ owner        │ │ user     │ │ user             │
│ assignedTo   │ │          │ │                  │
└──────────────┘ └──────────┘ └──────────────────┘

┌─────────────┐
│Conversations│
│             │
│ userId      │ (String reference)
└─────────────┘

┌──────────────┐
│CompanyDetails│
│              │
│ user        │
└──────────────┘
```

---

## 📊 Data Types Summary

### Primitive Types
- **String**: Text data
- **Number**: Numeric data
- **Date**: Date and timestamp
- **Boolean**: True/false values
- **ObjectId**: MongoDB document reference

### Complex Types
- **Array**: List of items
- **Map**: Key-value pairs (MongoDB Map type)
- **Object**: Nested object structure

---

## 🔍 Recommended Indexes

### Performance Optimization

```javascript
// Users Collection
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Assignements Collection
db.assignements.createIndex({ owner: 1 })
db.assignements.createIndex({ assignedTo: 1 })
db.assignements.createIndex({ type: 1 })
db.assignements.createIndex({ status: 1 })
db.assignements.createIndex({ createdAt: -1 })

// Conversations Collection
db.conversations.createIndex({ userId: 1 })
db.conversations.createIndex({ createdAt: -1 })

// SimpleTests Collection
db.simpletests.createIndex({ user: 1 })
db.simpletests.createIndex({ status: 1 })
db.simpletests.createIndex({ createdAt: -1 })

// AdvancedTests Collection
db.advancedtests.createIndex({ user: 1 })
db.advancedtests.createIndex({ status: 1 })
db.advancedtests.createIndex({ createdAt: -1 })

// CompanyDetails Collection
db.companydetails.createIndex({ user: 1 }, { unique: true })
```

---

## 🔐 Security Considerations

1. **Password Hashing**: All passwords are hashed using bcrypt before storage
2. **Unique Constraints**: Username and email are unique to prevent duplicates
3. **Reference Integrity**: User references should be validated before saving
4. **Data Validation**: Mongoose schemas enforce required fields and data types

---

## 📝 Notes

1. **Conversation.userId**: Stored as String, not ObjectId (consider migration)
2. **Maps vs Objects**: `scores`, `feedback`, and `recommendations` use MongoDB Map type
3. **Timestamps**: Most collections have `createdAt` and `updatedAt` automatically managed
4. **Default Values**: Many fields have default values to ensure data consistency

---

## 🛠️ Database Connection

**Connection String Format:**
```
mongodb://username:password@host:port/database?authSource=admin
```

**Example:**
```
mongodb://growthai_user:password@localhost:27017/growthai?authSource=admin
```

---

**Last Updated**: 2025-12-26  
**Database Version**: MongoDB 7.0  
**ODM**: Mongoose 8.3.0

