const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Chapter = require('./models/Chapter');

// Sample data
const sampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Module.deleteMany({});
    await Chapter.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@company.com',
      password: 'admin123',
      role: 'admin',
      department: 'IT',
      banks: ['All']
    });
    console.log('Created admin user');

    // Create sample employees
    const employee1 = await User.create({
      name: 'John Doe',
      email: 'john@company.com',
      password: 'password123',
      role: 'employee',
      department: 'IT',
      banks: ['SSFB', 'CUB']
    });

    const employee2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@company.com',
      password: 'password123',
      role: 'employee',
      department: 'Customer Service',
      banks: ['CUB', 'ESAF']
    });

    console.log('Created sample employees');

    // Create sample course 1: Banking Basics
    const course1 = await Course.create({
      title: 'Banking Basics for New Employees',
      description: 'Comprehensive introduction to banking operations and customer service',
      tags: {
        department: 'Onboarding',
        bank: 'All'
      },
      createdBy: admin._id,
      assignedTo: [employee1._id, employee2._id]
    });

    // Module 1 for Course 1
    const module1 = await Module.create({
      title: 'Introduction to Banking',
      description: 'Learn the fundamentals of banking and financial services',
      course: course1._id,
      order: 1
    });

    // Chapters for Module 1
    const chapter1 = await Chapter.create({
      title: 'What is Banking?',
      module: module1._id,
      order: 1,
      contentType: 'document',
      content: {
        text: `Banking is the business of accepting deposits and lending money. Banks play a crucial role in the economy by:

1. Accepting deposits from customers
2. Providing loans and credit facilities
3. Facilitating payments and transfers
4. Offering investment and wealth management services

As a banking professional, you will be part of this important ecosystem that helps individuals and businesses manage their finances effectively.`,
        videoUrl: '',
        images: []
      },
      estimatedDuration: 10
    });

    const chapter2 = await Chapter.create({
      title: 'Types of Bank Accounts',
      module: module1._id,
      order: 2,
      contentType: 'document',
      content: {
        text: `Banks offer different types of accounts to meet various customer needs:

**Savings Accounts**
- Designed for saving money
- Earns interest on deposits
- Limited transactions per month

**Current Accounts**
- For business and frequent transactions
- No transaction limits
- Usually no interest earned

**Fixed Deposit Accounts**
- Lock in money for a fixed period
- Higher interest rates
- Penalty for early withdrawal

Understanding these account types will help you guide customers to the right products for their needs.`,
        videoUrl: '',
        images: []
      },
      estimatedDuration: 15
    });

    module1.chapters = [chapter1._id, chapter2._id];
    await module1.save();

    // Module 2 for Course 1
    const module2 = await Module.create({
      title: 'Customer Service Excellence',
      description: 'Learn how to provide outstanding customer service',
      course: course1._id,
      order: 2
    });

    const chapter3 = await Chapter.create({
      title: 'First Impressions Matter',
      module: module2._id,
      order: 1,
      contentType: 'document',
      content: {
        text: `The first interaction with a customer sets the tone for the entire relationship.

**Key Principles:**
- Greet customers warmly
- Make eye contact and smile
- Use the customer's name
- Listen actively to their needs
- Show empathy and understanding

Remember: Every customer interaction is an opportunity to build trust and loyalty.`,
        videoUrl: '',
        images: []
      },
      estimatedDuration: 8
    });

    module2.chapters = [chapter3._id];
    await module2.save();

    course1.modules = [module1._id, module2._id];
    await course1.save();

    // Create sample course 2: IT Security
    const course2 = await Course.create({
      title: 'Cybersecurity Fundamentals for Banking',
      description: 'Essential security practices to protect customer data and bank systems',
      tags: {
        department: 'IT',
        bank: 'All'
      },
      createdBy: admin._id,
      assignedTo: [employee1._id]
    });

    const module3 = await Module.create({
      title: 'Information Security Basics',
      description: 'Understanding the fundamentals of information security',
      course: course2._id,
      order: 1
    });

    const chapter4 = await Chapter.create({
      title: 'Password Security',
      module: module3._id,
      order: 1,
      contentType: 'document',
      content: {
        text: `Strong passwords are your first line of defense against unauthorized access.

**Password Best Practices:**
1. Use at least 12 characters
2. Mix uppercase, lowercase, numbers, and symbols
3. Avoid dictionary words and personal information
4. Use unique passwords for different systems
5. Change passwords regularly
6. Never share your password with anyone

**Two-Factor Authentication (2FA)**
Always enable 2FA when available for an extra layer of security.`,
        videoUrl: '',
        images: []
      },
      estimatedDuration: 10
    });

    module3.chapters = [chapter4._id];
    await module3.save();

    course2.modules = [module3._id];
    await course2.save();

    // Create sample course 3: Risk Management
    const course3 = await Course.create({
      title: 'Risk Management in Banking',
      description: 'Learn to identify, assess, and mitigate risks in banking operations',
      tags: {
        department: 'Risk',
        bank: 'SSFB'
      },
      createdBy: admin._id,
      assignedTo: []
    });

    const module4 = await Module.create({
      title: 'Introduction to Risk Management',
      description: 'Understanding various types of risks in banking',
      course: course3._id,
      order: 1
    });

    const chapter5 = await Chapter.create({
      title: 'Types of Banking Risks',
      module: module4._id,
      order: 1,
      contentType: 'document',
      content: {
        text: `Banks face various types of risks that need to be carefully managed:

**Credit Risk**
The risk that borrowers may default on their loans.

**Market Risk**
Risk from changes in market conditions like interest rates, exchange rates, etc.

**Operational Risk**
Risk from internal processes, systems, or human errors.

**Liquidity Risk**
Risk of not having enough cash to meet obligations.

**Compliance Risk**
Risk of violating laws, regulations, or internal policies.

Understanding these risks is essential for making informed decisions and protecting the bank's assets.`,
        videoUrl: '',
        images: []
      },
      estimatedDuration: 12
    });

    module4.chapters = [chapter5._id];
    await module4.save();

    course3.modules = [module4._id];
    await course3.save();

    // Update employees with assigned courses
    await User.findByIdAndUpdate(employee1._id, {
      assignedCourses: [course1._id, course2._id]
    });

    await User.findByIdAndUpdate(employee2._id, {
      assignedCourses: [course1._id]
    });

    console.log('Sample data created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('Employee 1: john@company.com / password123');
    console.log('Employee 2: jane@company.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

sampleData();
