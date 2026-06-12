// @ts-nocheck
import { getDb } from "../api/queries/connection";
import { students, courses, enrollments } from "./schema";
import { eq, sql } from "drizzle-orm";

const db = getDb();

// ── Departments & Courses ────────────────────────────────────────────────────

const COURSE_CATALOG = [
  // ── Computer Science (CS) ───────────────────────────────────────────────────
  { courseCode: "CS-101", title: "Intro to Programming, Web Development Basics, Computer Science Foundations",         credits: 4, department: "CS",  yearLevel: 1, description: "Fundamentals of programming using Python, HTML, CSS, and JavaScript fundamentals, Boolean logic, number systems, and computational thinking" },
  { courseCode: "CS-102", title: "Intro to Programming, Web Development Basics, Computer Science Foundations",         credits: 4, department: "CS",  yearLevel: 1, description: "Fundamentals of programming using Python, HTML, CSS, and JavaScript fundamentals, Boolean logic, number systems, and computational thinking" },
  { courseCode: "CS-103", title: "Intro to Programming, Web Development Basics, Computer Science Foundations",         credits: 4, department: "CS",  yearLevel: 1, description: "Fundamentals of programming using Python, HTML, CSS, and JavaScript fundamentals, Boolean logic, number systems, and computational thinking" },
  { courseCode: "CS-201", title: "Data Structures, Algorithms, Object-Oriented Programming",                           credits: 4, department: "CS",  yearLevel: 2, description: "Arrays, linked lists, trees, graphs, hashing, Algorithm design, analysis, and complexity, OOP principles using Java" },
  { courseCode: "CS-202", title: "Data Structures, Algorithms, Object-Oriented Programming",                           credits: 4, department: "CS",  yearLevel: 2, description: "Arrays, linked lists, trees, graphs, hashing, Algorithm design, analysis, and complexity, OOP principles using Java" },
  { courseCode: "CS-203", title: "Data Structures, Algorithms, Object-Oriented Programming",                           credits: 4, department: "CS",  yearLevel: 2, description: "Arrays, linked lists, trees, graphs, hashing, Algorithm design, analysis, and complexity, OOP principles using Java" },
  { courseCode: "CS-301", title: "Database Systems, Operating Systems, Software Engineering",                          credits: 3, department: "CS",  yearLevel: 3, description: "Relational databases, SQL, normalization, Process management, memory, file systems, Agile, design patterns, SDLC" },
  { courseCode: "CS-302", title: "Database Systems, Operating Systems, Software Engineering",                          credits: 3, department: "CS",  yearLevel: 3, description: "Relational databases, SQL, normalization, Process management, memory, file systems, Agile, design patterns, SDLC" },
  { courseCode: "CS-303", title: "Database Systems, Operating Systems, Software Engineering",                          credits: 3, department: "CS",  yearLevel: 3, description: "Relational databases, SQL, normalization, Process management, memory, file systems, Agile, design patterns, SDLC" },
  { courseCode: "CS-401", title: "Machine Learning, Computer Networks, Cloud Computing",                               credits: 4, department: "CS",  yearLevel: 4, description: "Supervised and unsupervised learning, TCP/IP, routing, application protocols, AWS, Azure, distributed systems" },
  { courseCode: "CS-402", title: "Machine Learning, Computer Networks, Cloud Computing",                               credits: 4, department: "CS",  yearLevel: 4, description: "Supervised and unsupervised learning, TCP/IP, routing, application protocols, AWS, Azure, distributed systems" },
  { courseCode: "CS-403", title: "Machine Learning, Computer Networks, Cloud Computing",                               credits: 4, department: "CS",  yearLevel: 4, description: "Supervised and unsupervised learning, TCP/IP, routing, application protocols, AWS, Azure, distributed systems" },

  // ── English (ENG) ───────────────────────────────────────────────────────────
  { courseCode: "ENG-101", title: "English Composition, Public Speaking, Critical Reading & Thinking",                     credits: 3, department: "ENG", yearLevel: 1, description: "Writing skills and rhetorical strategies, Oral communication and presentation skills, Analytical reading strategies and close-text interpretation" },
  { courseCode: "ENG-102", title: "English Composition, Public Speaking, Critical Reading & Thinking",                     credits: 3, department: "ENG", yearLevel: 1, description: "Writing skills and rhetorical strategies, Oral communication and presentation skills, Analytical reading strategies and close-text interpretation" },
  { courseCode: "ENG-103", title: "English Composition, Public Speaking, Critical Reading & Thinking",                     credits: 3, department: "ENG", yearLevel: 1, description: "Writing skills and rhetorical strategies, Oral communication and presentation skills, Analytical reading strategies and close-text interpretation" },
  { courseCode: "ENG-201", title: "Technical Writing, Research Methods, World Literature",                                 credits: 3, department: "ENG", yearLevel: 2, description: "Professional communication and documentation, Academic research and citation practice, Survey of global literary traditions from ancient to contemporary" },
  { courseCode: "ENG-202", title: "Technical Writing, Research Methods, World Literature",                                 credits: 3, department: "ENG", yearLevel: 2, description: "Professional communication and documentation, Academic research and citation practice, Survey of global literary traditions from ancient to contemporary" },
  { courseCode: "ENG-203", title: "Technical Writing, Research Methods, World Literature",                                 credits: 3, department: "ENG", yearLevel: 2, description: "Professional communication and documentation, Academic research and citation practice, Survey of global literary traditions from ancient to contemporary" },
  { courseCode: "ENG-301", title: "Advanced Composition, Creative Writing, Linguistics",                                   credits: 3, department: "ENG", yearLevel: 3, description: "Graduate-level writing and argumentation, Fiction, poetry, and nonfiction narrative techniques, Phonology, morphology, syntax, and language acquisition" },
  { courseCode: "ENG-302", title: "Advanced Composition, Creative Writing, Linguistics",                                   credits: 3, department: "ENG", yearLevel: 3, description: "Graduate-level writing and argumentation, Fiction, poetry, and nonfiction narrative techniques, Phonology, morphology, syntax, and language acquisition" },
  { courseCode: "ENG-303", title: "Advanced Composition, Creative Writing, Linguistics",                                   credits: 3, department: "ENG", yearLevel: 3, description: "Graduate-level writing and argumentation, Fiction, poetry, and nonfiction narrative techniques, Phonology, morphology, syntax, and language acquisition" },
  { courseCode: "ENG-401", title: "Senior Seminar in English, Digital Rhetoric, Professional Editing & Publishing",        credits: 3, department: "ENG", yearLevel: 4, description: "Capstone seminar integrating literary theory and original research, Persuasive communication in digital and social media contexts, Manuscript editing, style guides, and publishing industry workflows" },
  { courseCode: "ENG-402", title: "Senior Seminar in English, Digital Rhetoric, Professional Editing & Publishing",        credits: 3, department: "ENG", yearLevel: 4, description: "Capstone seminar integrating literary theory and original research, Persuasive communication in digital and social media contexts, Manuscript editing, style guides, and publishing industry workflows" },
  { courseCode: "ENG-403", title: "Senior Seminar in English, Digital Rhetoric, Professional Editing & Publishing",        credits: 3, department: "ENG", yearLevel: 4, description: "Capstone seminar integrating literary theory and original research, Persuasive communication in digital and social media contexts, Manuscript editing, style guides, and publishing industry workflows" },

  // ── Economics (ECO) — original entries preserved + missing slots filled ─────
  { courseCode: "ECO-101", title: "Microeconomics, Introduction to Economic Thought, Quantitative Methods in Economics",       credits: 3, department: "ECO", yearLevel: 1, description: "Supply, demand, market structures, Historical development of economic theories from mercantilism to modern schools, Mathematical and statistical tools applied to economic analysis" },
  { courseCode: "ECO-102", title: "Microeconomics, Introduction to Economic Thought, Quantitative Methods in Economics",       credits: 3, department: "ECO", yearLevel: 1, description: "Supply, demand, market structures, Historical development of economic theories from mercantilism to modern schools, Mathematical and statistical tools applied to economic analysis" },
  { courseCode: "ECO-103", title: "Microeconomics, Introduction to Economic Thought, Quantitative Methods in Economics",       credits: 3, department: "ECO", yearLevel: 1, description: "Supply, demand, market structures, Historical development of economic theories from mercantilism to modern schools, Mathematical and statistical tools applied to economic analysis" },
  { courseCode: "ECO-201", title: "Macroeconomics, Money, Banking & Financial Markets,Development Economics",                  credits: 3, department: "ECO", yearLevel: 2, description: "GDP, inflation, fiscal policy, Role of money, central banks, interest rates, and capital markets, Economic growth, poverty, inequality, and development policy" },
  { courseCode: "ECO-202", title: "Macroeconomics, Money, Banking & Financial Markets,Development Economics",                  credits: 3, department: "ECO", yearLevel: 2, description: "GDP, inflation, fiscal policy, Role of money, central banks, interest rates, and capital markets, Economic growth, poverty, inequality, and development policy" },
  { courseCode: "ECO-203", title: "Macroeconomics, Money, Banking & Financial Markets,Development Economics",                  credits: 3, department: "ECO", yearLevel: 2, description: "GDP, inflation, fiscal policy, Role of money, central banks, interest rates, and capital markets, Economic growth, poverty, inequality, and development policy" },
  { courseCode: "ECO-301", title: "Econometrics, Public FinanceLabor Economics",                                               credits: 3, department: "ECO", yearLevel: 3, description: "Statistical methods in economics, Government expenditure, taxation, and fiscal policy analysis, Labor markets, wages, employment, and workforce policy" },
  { courseCode: "ECO-302", title: "Econometrics, Public FinanceLabor Economics",                                               credits: 3, department: "ECO", yearLevel: 3, description: "Statistical methods in economics, Government expenditure, taxation, and fiscal policy analysis, Labor markets, wages, employment, and workforce policy" },
  { courseCode: "ECO-303", title: "Econometrics, Public FinanceLabor Economics",                                               credits: 3, department: "ECO", yearLevel: 3, description: "Statistical methods in economics, Government expenditure, taxation, and fiscal policy analysis, Labor markets, wages, employment, and workforce policy" },
  { courseCode: "ECO-401", title: "International Economics, Environmental Economics, Economics Capstone Seminar",              credits: 3, department: "ECO", yearLevel: 4, description: "Trade theory, exchange rates, globalization, Market failures, externalities, carbon pricing, and sustainability policy, Independent policy research paper integrating core economic theory and data" },
  { courseCode: "ECO-402", title: "International Economics, Environmental Economics, Economics Capstone Seminar",              credits: 3, department: "ECO", yearLevel: 4, description: "Trade theory, exchange rates, globalization, Market failures, externalities, carbon pricing, and sustainability policy, Independent policy research paper integrating core economic theory and data" },
  { courseCode: "ECO-403", title: "International Economics, Environmental Economics, Economics Capstone Seminar",              credits: 3, department: "ECO", yearLevel: 4, description: "Trade theory, exchange rates, globalization, Market failures, externalities, carbon pricing, and sustainability policy, Independent policy research paper integrating core economic theory and data" },

  // ── Software Engineering (SE) ───────────────────────────────────────────────
  { courseCode: "SE-101",  title: "Foundations of Software Engineering, Programming Fundamentals, Discrete Structures for SE",       credits: 3, department: "SE",  yearLevel: 1, description: "Introduction to the software development lifecycle, roles, and tooling" },
  { courseCode: "SE-102",  title: "Foundations of Software Engineering, Programming Fundamentals, Discrete Structures for SE",       credits: 3, department: "SE",  yearLevel: 1, description: "Core programming concepts using Python and version control with Git" },
  { courseCode: "SE-103",  title: "Foundations of Software Engineering, Programming Fundamentals, Discrete Structures for SE",       credits: 3, department: "SE",  yearLevel: 1, description: "Logic, sets, relations, and graph theory applied to software problems" },
  { courseCode: "SE-201",  title: "Object-Oriented Design, Data Structures & Algorithms, Requirements Engineering",                  credits: 3, department: "SE",  yearLevel: 2, description: "SOLID principles, design patterns, and UML modelling in Java" },
  { courseCode: "SE-202",  title: "Object-Oriented Design, Data Structures & Algorithms, Requirements Engineering",                  credits: 3, department: "SE",  yearLevel: 2, description: "Core data structures and complexity analysis with software applications" },
  { courseCode: "SE-203",  title: "Object-Oriented Design, Data Structures & Algorithms, Requirements Engineering",                  credits: 3, department: "SE",  yearLevel: 2, description: "Eliciting, documenting, and validating software requirements" },
  { courseCode: "SE-301",  title: "Software Architecture, Agile & DevOps Practices, Software Testing & Quality Assurance",           credits: 3, department: "SE",  yearLevel: 3, description: "Architectural patterns, component design, and quality attributes" },
  { courseCode: "SE-302",  title: "Software Architecture, Agile & DevOps Practices, Software Testing & Quality Assurance",           credits: 3, department: "SE",  yearLevel: 3, description: "Scrum, Kanban, CI/CD pipelines, and containerisation with Docker" },
  { courseCode: "SE-303",  title: "Software Architecture, Agile & DevOps Practices, Software Testing & Quality Assurance",           credits: 3, department: "SE",  yearLevel: 3, description: "Unit, integration, and system testing strategies with automated tooling" },
  { courseCode: "SE-401",  title: "Distributed Systems, Software Security Engineering, Software Engineering Capstone",               credits: 4, department: "SE",  yearLevel: 4, description: "Microservices, message queues, CAP theorem, and fault-tolerant design" },
  { courseCode: "SE-402",  title: "Distributed Systems, Software Security Engineering, Software Engineering Capstone",               credits: 4, department: "SE",  yearLevel: 4, description: "Threat modelling, secure coding practices, and penetration testing basics" },
  { courseCode: "SE-403",  title: "Distributed Systems, Software Security Engineering, Software Engineering Capstone",               credits: 4, department: "SE",  yearLevel: 4, description: "Full-cycle team project from requirements through deployment and retrospective" },

  // ── Information Technology (IT) ─────────────────────────────────────────────
  { courseCode: "IT-101",  title: "IT Fundamentals, Networking Essentials, Introduction to Cybersecurity",                      credits: 3, department: "IT",  yearLevel: 1, description: "Computer hardware, software, operating systems, and IT support basics" },
  { courseCode: "IT-102",  title: "IT Fundamentals, Networking Essentials, Introduction to Cybersecurity",                credits: 3, department: "IT",  yearLevel: 1, description: "OSI model, TCP/IP, subnetting, and basic network configuration" },
  { courseCode: "IT-103",  title: "IT Fundamentals, Networking Essentials, Introduction to Cybersecurity",        credits: 3, department: "IT",  yearLevel: 1, description: "Threats, vulnerabilities, and foundational security controls" },
  { courseCode: "IT-201",  title: "Systems Administration, Database Administration, Cloud Infrastructure",               credits: 3, department: "IT",  yearLevel: 2, description: "Linux and Windows server configuration, user management, and automation scripts" },
  { courseCode: "IT-202",  title: "Systems Administration, Database Administration, Cloud Infrastructure",              credits: 3, department: "IT",  yearLevel: 2, description: "Installation, tuning, backup, and recovery of relational database systems" },
  { courseCode: "IT-203",  title: "Systems Administration, Database Administration, Cloud Infrastructure",                 credits: 3, department: "IT",  yearLevel: 2, description: "Provisioning and managing cloud resources on AWS and Azure platforms" },
  { courseCode: "IT-301",  title: "Network Security, IT Project Management, Virtualisation & Containers",                     credits: 3, department: "IT",  yearLevel: 3, description: "Firewalls, VPNs, intrusion detection systems, and network hardening" },
  { courseCode: "IT-302",  title: "Network Security, IT Project Management, Virtualisation & Containers",                credits: 3, department: "IT",  yearLevel: 3, description: "Project planning, risk assessment, and delivery using PMBOK and Agile" },
  { courseCode: "IT-303",  title: "",          credits: 3, department: "IT",  yearLevel: 3, description: "Hypervisors, VMware, Docker, and Kubernetes cluster management" },
  { courseCode: "IT-401",  title: "IT Governance & Compliance",           credits: 3, department: "IT",  yearLevel: 4, description: "ITIL framework, ISO 27001, GDPR, and organisational IT policy" },
  { courseCode: "IT-402",  title: "Enterprise Architecture",              credits: 3, department: "IT",  yearLevel: 4, description: "Aligning IT infrastructure with business strategy using TOGAF principles" },
  { courseCode: "IT-403",  title: "IT Capstone Project",                  credits: 3, department: "IT",  yearLevel: 4, description: "End-to-end infrastructure or security solution designed for a real-world brief" },

  // ── Electrical Engineering (EE) ─────────────────────────────────────────────
  { courseCode: "EE-101",  title: "Introduction to Electrical Engineering", credits: 3, department: "EE",  yearLevel: 1, description: "Basic electrical quantities, circuit elements, and safety practices" },
  { courseCode: "EE-102",  title: "Circuit Analysis",                     credits: 4, department: "EE",  yearLevel: 1, description: "Kirchhoff's laws, nodal and mesh analysis, Thevenin and Norton equivalents" },
  { courseCode: "EE-103",  title: "Engineering Mathematics",              credits: 3, department: "EE",  yearLevel: 1, description: "Complex numbers, differential equations, and Laplace transforms for EE" },
  { courseCode: "EE-201",  title: "Electronics I",                        credits: 4, department: "EE",  yearLevel: 2, description: "Diodes, BJTs, MOSFETs, and amplifier biasing circuits" },
  { courseCode: "EE-202",  title: "Signals & Systems",                    credits: 3, department: "EE",  yearLevel: 2, description: "Continuous and discrete-time signals, Fourier and Z-transforms" },
  { courseCode: "EE-203",  title: "Electromagnetics",                     credits: 3, department: "EE",  yearLevel: 2, description: "Electrostatics, magnetostatics, Maxwell's equations, and wave propagation" },
  { courseCode: "EE-301",  title: "Digital Electronics",                  credits: 3, department: "EE",  yearLevel: 3, description: "Logic gates, combinational and sequential circuits, FPGAs" },
  { courseCode: "EE-302",  title: "Control Systems",                      credits: 4, department: "EE",  yearLevel: 3, description: "Feedback control, stability, Bode plots, and PID controller design" },
  { courseCode: "EE-303",  title: "Power Systems",                        credits: 3, department: "EE",  yearLevel: 3, description: "AC power analysis, transformers, motors, and three-phase systems" },
  { courseCode: "EE-401",  title: "Embedded Systems",                     credits: 4, department: "EE",  yearLevel: 4, description: "Microcontroller programming, real-time OS, and hardware-software integration" },
  { courseCode: "EE-402",  title: "Wireless Communications",              credits: 3, department: "EE",  yearLevel: 4, description: "Modulation, channel coding, antenna design, and 5G/6G architectures" },
  { courseCode: "EE-403",  title: "Electrical Engineering Capstone",      credits: 3, department: "EE",  yearLevel: 4, description: "Team-based design project addressing a real engineering problem from spec to prototype" },

  // ── Civil Engineering (CE) ──────────────────────────────────────────────────
  { courseCode: "CE-101",  title: "Introduction to Civil Engineering",    credits: 3, department: "CE",  yearLevel: 1, description: "Overview of civil engineering disciplines, infrastructure, and the built environment" },
  { courseCode: "CE-102",  title: "Engineering Drawing & CAD",            credits: 3, department: "CE",  yearLevel: 1, description: "Technical drawing conventions and 2D/3D modelling using AutoCAD" },
  { courseCode: "CE-103",  title: "Engineering Mechanics: Statics",       credits: 3, department: "CE",  yearLevel: 1, description: "Equilibrium of rigid bodies, free-body diagrams, and truss analysis" },
  { courseCode: "CE-201",  title: "Mechanics of Materials",               credits: 4, department: "CE",  yearLevel: 2, description: "Stress, strain, bending, shear, and material failure criteria" },
  { courseCode: "CE-202",  title: "Fluid Mechanics",                      credits: 3, department: "CE",  yearLevel: 2, description: "Fluid statics, Bernoulli's equation, pipe flow, and open-channel hydraulics" },
  { courseCode: "CE-203",  title: "Engineering Geology & Soil Mechanics", credits: 3, department: "CE",  yearLevel: 2, description: "Rock and soil classification, consolidation, shear strength, and site investigation" },
  { courseCode: "CE-301",  title: "Structural Analysis",                  credits: 4, department: "CE",  yearLevel: 3, description: "Analysis of beams, frames, and trusses under static and dynamic loading" },
  { courseCode: "CE-302",  title: "Transportation Engineering",           credits: 3, department: "CE",  yearLevel: 3, description: "Highway design, traffic flow theory, and sustainable transport planning" },
  { courseCode: "CE-303",  title: "Environmental Engineering",            credits: 3, department: "CE",  yearLevel: 3, description: "Water and wastewater treatment, air quality, and solid waste management" },
  { courseCode: "CE-401",  title: "Foundation Engineering",               credits: 3, department: "CE",  yearLevel: 4, description: "Shallow and deep foundation design, pile analysis, and retaining structures" },
  { courseCode: "CE-402",  title: "Construction Project Management",      credits: 3, department: "CE",  yearLevel: 4, description: "Scheduling, cost estimation, contracts, and health and safety on-site" },
  { courseCode: "CE-403",  title: "Civil Engineering Capstone Design",    credits: 3, department: "CE",  yearLevel: 4, description: "Integrated design of a civil infrastructure project with technical report and presentation" },

  // ── Mechanical Engineering (ME) ─────────────────────────────────────────────
  { courseCode: "ME-101",  title: "Introduction to Mechanical Engineering", credits: 3, department: "ME",  yearLevel: 1, description: "Overview of mechanical systems, engineering profession, and design process" },
  { courseCode: "ME-102",  title: "Engineering Graphics & CAD",           credits: 3, department: "ME",  yearLevel: 1, description: "Orthographic projection, tolerancing, and 3D parametric modelling in SolidWorks" },
  { courseCode: "ME-103",  title: "Statics & Dynamics",                   credits: 4, department: "ME",  yearLevel: 1, description: "Equilibrium, kinematics, and kinetics of particles and rigid bodies" },
  { courseCode: "ME-201",  title: "Thermodynamics",                       credits: 4, department: "ME",  yearLevel: 2, description: "Laws of thermodynamics, thermodynamic cycles, and energy conversion systems" },
  { courseCode: "ME-202",  title: "Mechanics of Materials",               credits: 3, department: "ME",  yearLevel: 2, description: "Stress-strain relationships, bending, torsion, and failure theories" },
  { courseCode: "ME-203",  title: "Fluid Dynamics",                       credits: 3, department: "ME",  yearLevel: 2, description: "Conservation laws, viscous flow, boundary layers, and turbomachinery basics" },
  { courseCode: "ME-301",  title: "Machine Design",                       credits: 4, department: "ME",  yearLevel: 3, description: "Design of shafts, gears, bearings, fasteners, and power transmission elements" },
  { courseCode: "ME-302",  title: "Heat Transfer",                        credits: 3, department: "ME",  yearLevel: 3, description: "Conduction, convection, and radiation with engineering applications" },
  { courseCode: "ME-303",  title: "Manufacturing Processes",              credits: 3, department: "ME",  yearLevel: 3, description: "Machining, casting, forming, welding, and additive manufacturing techniques" },
  { courseCode: "ME-401",  title: "Robotics & Mechatronics",              credits: 4, department: "ME",  yearLevel: 4, description: "Kinematics, actuators, sensors, and control of robotic systems" },
  { courseCode: "ME-402",  title: "Finite Element Analysis",              credits: 3, department: "ME",  yearLevel: 4, description: "FEA theory and simulation of structural and thermal engineering problems" },
  { courseCode: "ME-403",  title: "Mechanical Engineering Capstone",      credits: 3, department: "ME",  yearLevel: 4, description: "Team-based product design project from concept through prototype and testing" },

  // ── Accounting & Finance (AF) ───────────────────────────────────────────────
  { courseCode: "AF-101",  title: "Financial Accounting Fundamentals",    credits: 3, department: "AF",  yearLevel: 1, description: "Accounting equation, double-entry bookkeeping, and preparation of financial statements" },
  { courseCode: "AF-102",  title: "Business Mathematics & Finance",       credits: 3, department: "AF",  yearLevel: 1, description: "Time value of money, interest calculations, annuities, and financial ratios" },
  { courseCode: "AF-103",  title: "Business Law & Ethics",                credits: 3, department: "AF",  yearLevel: 1, description: "Contract law, corporate governance, and ethical frameworks in business" },
  { courseCode: "AF-201",  title: "Managerial Accounting",                credits: 3, department: "AF",  yearLevel: 2, description: "Cost behaviour, budgeting, variance analysis, and decision-making support" },
  { courseCode: "AF-202",  title: "Corporate Finance",                    credits: 4, department: "AF",  yearLevel: 2, description: "Capital structure, WACC, investment appraisal, and dividend policy" },
  { courseCode: "AF-203",  title: "Financial Statement Analysis",         credits: 3, department: "AF",  yearLevel: 2, description: "Ratio analysis, cash flow interpretation, and credit and equity analysis" },
  { courseCode: "AF-301",  title: "Taxation",                             credits: 3, department: "AF",  yearLevel: 3, description: "Income tax principles, corporate tax, VAT, and tax planning strategies" },
  { courseCode: "AF-302",  title: "Auditing & Assurance",                 credits: 3, department: "AF",  yearLevel: 3, description: "Audit process, evidence gathering, internal controls, and professional standards" },
  { courseCode: "AF-303",  title: "Investments & Portfolio Management",   credits: 3, department: "AF",  yearLevel: 3, description: "Asset classes, Modern Portfolio Theory, CAPM, and derivatives" },
  { courseCode: "AF-401",  title: "Advanced Financial Reporting",         credits: 3, department: "AF",  yearLevel: 4, description: "IFRS consolidation, group accounts, and complex financial instruments" },
  { courseCode: "AF-402",  title: "Risk Management & Financial Modelling", credits: 4, department: "AF",  yearLevel: 4, description: "Market, credit, and operational risk models using Excel and Python" },
  { courseCode: "AF-403",  title: "Accounting & Finance Capstone",        credits: 3, department: "AF",  yearLevel: 4, description: "Comprehensive financial analysis and advisory report for a real or simulated company" },

  // ── Management (MG) ─────────────────────────────────────────────────────────
  { courseCode: "MG-101",  title: "Principles of Management, Introduction to Marketing, Organisational Behaviour",                credits: 3, department: "MG",  yearLevel: 1, description: "Planning, organising, leading, and controlling in modern organisations, Marketing mix, consumer behaviour, segmentation, and brand positioning, Motivation, group dynamics, leadership styles, and workplace culture" },
  { courseCode: "MG-102",  title: "Principles of Management, Introduction to Marketing, Organisational Behaviour",                credits: 3, department: "MG",  yearLevel: 1, description: "Planning, organising, leading, and controlling in modern organisations, Marketing mix, consumer behaviour, segmentation, and brand positioning, Motivation, group dynamics, leadership styles, and workplace culture" },
  { courseCode: "MG-103",  title: "Principles of Management, Introduction to Marketing, Organisational Behaviour",                credits: 3, department: "MG",  yearLevel: 1, description: "Planning, organising, leading, and controlling in modern organisations, Marketing mix, consumer behaviour, segmentation, and brand positioning, Motivation, group dynamics, leadership styles, and workplace culture" },
  { courseCode: "MG-201",  title: "Human Resource Management, Operations Management, Business Statistics",                        credits: 3, department: "MG",  yearLevel: 2, description: "Recruitment, performance management, training, and employment law, Process design, supply chain management, quality control, and lean methods, Descriptive and inferential statistics applied to business decision-making" },
  { courseCode: "MG-202",  title: "Human Resource Management, Operations Management, Business Statistics",                        credits: 3, department: "MG",  yearLevel: 2, description: "Recruitment, performance management, training, and employment law, Process design, supply chain management, quality control, and lean methods, Descriptive and inferential statistics applied to business decision-making" },
  { courseCode: "MG-203",  title: "Human Resource Management, Operations Management, Business Statistics",                        credits: 3, department: "MG",  yearLevel: 2, description: "Recruitment, performance management, training, and employment law, Process design, supply chain management, quality control, and lean methods, Descriptive and inferential statistics applied to business decision-making" },
  { courseCode: "MG-301",  title: "Strategic Management, Entrepreneurship & Innovation, International Business",                  credits: 3, department: "MG",  yearLevel: 3, description: "Competitive analysis, corporate strategy, and strategic planning frameworks, Business plan development, startup financing, and innovation management, Global market entry, cross-cultural management, and multinational strategy" },
  { courseCode: "MG-302",  title: "Strategic Management, Entrepreneurship & Innovation, International Business",                  credits: 3, department: "MG",  yearLevel: 3, description: "Competitive analysis, corporate strategy, and strategic planning frameworks, Business plan development, startup financing, and innovation management, Global market entry, cross-cultural management, and multinational strategy" },
  { courseCode: "MG-303",  title: "Strategic Management, Entrepreneurship & Innovation, International Business",                  credits: 3, department: "MG",  yearLevel: 3, description: "Competitive analysis, corporate strategy, and strategic planning frameworks, Business plan development, startup financing, and innovation management, Global market entry, cross-cultural management, and multinational strategy" },
  { courseCode: "MG-401",  title: "Leadership & Change Management, Business Analytics, Management Capstone Consulting Project",   credits: 3, department: "MG",  yearLevel: 4, description: "Change models, transformational leadership, and managing organisational transitions, Data-driven decision-making using dashboards, regression, and predictive models, Team-based consulting engagement delivering strategic recommendations to an industry client" },
  { courseCode: "MG-402",  title: "Leadership & Change Management, Business Analytics, Management Capstone Consulting Project",   credits: 4, department: "MG",  yearLevel: 4, description: "Change models, transformational leadership, and managing organisational transitions, Data-driven decision-making using dashboards, regression, and predictive models, Team-based consulting engagement delivering strategic recommendations to an industry client" },
  { courseCode: "MG-403",  title: "Leadership & Change Management, Business Analytics, Management Capstone Consulting Project",   credits: 3, department: "MG",  yearLevel: 4, description: "Change models, transformational leadership, and managing organisational transitions, Data-driven decision-making using dashboards, regression, and predictive models, Team-based consulting engagement delivering strategic recommendations to an industry client" },
];

// ── Semesters: Spring/Summer/Fall 2023 → Spring 2026 ────────────────────────

const SEMESTERS = [
  "Spring 2023", "Summer 2023", "Fall 2023",
  "Spring 2024", "Summer 2024", "Fall 2024",
  "Spring 2025", "Summer 2025", "Fall 2025",
  "Spring 2026",
];

// Semesters considered "current/future" → status = enrolled (not yet graded)
const OPEN_SEMESTERS = new Set(["Summer 2025", "Fall 2025", "Spring 2026"]);

// ── Name data ────────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  "James","Emma","Liam","Olivia","Noah","Ava","Ethan","Sophia","Mason","Isabella",
  "Lucas","Mia","Oliver","Charlotte","Elijah","Amelia","Aiden","Harper","Jackson",
  "Evelyn","Logan","Abigail","Carter","Emily","Benjamin","Elizabeth","Alexander",
  "Sofia","Daniel","Avery","Matthew","Ella","Henry","Madison","Sebastian","Scarlett",
  "Jack","Victoria","Samuel","Chloe","David","Grace","Joseph","Zoey","Wyatt","Nora",
  "Luke","Lily","Gabriel","Hannah","Dylan","Layla","Owen","Zoe","Ryan","Natalie",
  "Nathan","Addison","Isaac","Eleanor","Joshua","Aubrey","Andrew","Ellie","Christopher",
  "Stella","Anthony","Paisley","Lincoln","Savannah","Julian","Brooklyn","Easton","Claire",
  "Grayson","Skylar","Hunter","Violet","Evan","Aurora","Cameron","Bella","Connor",
  "Lucy","Nolan","Anna","Jordan","Sadie","Aaron","Caroline","Adrian","Genesis","Miles",
];

const LAST_NAMES = [
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez",
  "Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor",
  "Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez",
  "Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright",
  "Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall",
  "Rivera","Campbell","Mitchell","Carter","Roberts","Phillips","Evans","Turner",
  "Parker","Collins","Edwards","Stewart","Morris","Murphy","Cook","Rogers","Morgan",
  "Peterson","Cooper","Reed","Bailey","Bell","Gomez","Kelly","Howard","Ward","Cox",
  "Diaz","Richardson","Wood","Watson","Brooks","Bennett","Gray","James","Reyes",
  "Cruz","Hughes","Price","Myers","Long","Foster","Sanders","Ross","Morales","Powell",
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randGrade(): number {
  const r = Math.random();
  if (r < 0.08) return randInt(50, 59);
  if (r < 0.20) return randInt(60, 69);
  if (r < 0.40) return randInt(70, 79);
  if (r < 0.70) return randInt(80, 89);
  return randInt(90, 100);
}

// ── Main seed ────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Seeding database (large dataset)...");

  // Clear in FK-safe order
  await db.delete(enrollments);
  await db.delete(students);
  await db.delete(courses);
  console.log("  ✓ Cleared existing data");

  // ── 1. Courses ──────────────────────────────────────────────────────────
  const DEPARTMENTS = [...new Set(COURSE_CATALOG.map(c => c.department))];

  // Each course gets one representative semester per year-level section
  // Year 1 → Spring/Fall 2023, Year 2 → 2024, Year 3 → 2024-2025, Year 4 → 2025-2026
  const yearSemesterMap: Record<number, string[]> = {
    1: ["Spring 2023", "Fall 2023", "Spring 2024", "Fall 2024"],
    2: ["Spring 2024", "Fall 2024", "Spring 2025"],
    3: ["Fall 2024", "Spring 2025", "Fall 2025"],
    4: ["Spring 2025", "Fall 2025", "Spring 2026"],
  };

  const courseInsertData = COURSE_CATALOG.map(c => ({
    courseCode: c.courseCode,
    title: c.title,
    description: c.description,
    credits: c.credits,
    maxCapacity: randInt(25, 45),
    currentEnrollment: 0,
    department: c.department,
    semester: rand(yearSemesterMap[c.yearLevel] || SEMESTERS),
  }));

  await db.insert(courses).values(courseInsertData);
  const allCourses = await db.select().from(courses);
  console.log(`  ✓ Inserted ${allCourses.length} courses across ${DEPARTMENTS.length} departments`);

  // Build lookup maps
  const courseByCode = new Map(allCourses.map(c => [c.courseCode, c]));
  const coursesByDept: Record<string, typeof allCourses> = {};
  const coursesByYear: Record<number, typeof allCourses> = { 1: [], 2: [], 3: [], 4: [] };

  for (const c of allCourses) {
    if (!coursesByDept[c.department]) coursesByDept[c.department] = [];
    coursesByDept[c.department].push(c);
    const level = parseInt(c.courseCode.split("-")[1][0]);
    if (coursesByYear[level]) coursesByYear[level].push(c);
  }

  // ── 2. Students (200 unique) ────────────────────────────────────────────
  const MAJORS = DEPARTMENTS;
  const usedEmails = new Set<string>();
  const usedStudentIds = new Set<string>();
  const studentValues: any[] = [];

  for (let i = 0; i < 200; i++) {
    const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
    const lastName  = LAST_NAMES[i % LAST_NAMES.length];
    const major     = MAJORS[i % MAJORS.length];
    const enrollmentYear = randInt(2021, 2025);

    // Unique student ID: STU-YYYY-NNNN
    let studentId: string;
    do {
      studentId = `STU-${enrollmentYear}-${String(randInt(1000, 9999))}`;
    } while (usedStudentIds.has(studentId));
    usedStudentIds.add(studentId);

    // Unique email
    let email: string;
    let suffix = randInt(1, 999);
    do {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${suffix}@nexus.edu`;
      suffix++;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const r = Math.random();
    const status = (r < 0.80 ? "active" : r < 0.92 ? "probation" : "inactive") as
      "active" | "probation" | "inactive";

    studentValues.push({
      studentId, firstName, lastName, email, major, enrollmentYear,
      status, currentGpa: "0.00",
    });
  }

  // Batch insert students in chunks of 50
  for (let i = 0; i < studentValues.length; i += 50) {
    await db.insert(students).values(studentValues.slice(i, i + 50));
  }
  const allStudents = await db.select().from(students);
  console.log(`  ✓ Inserted ${allStudents.length} students`);

  // ── 3. Enrollments (800–1000) ───────────────────────────────────────────
  const enrollmentValues: any[] = [];
  const usedKeys = new Set<string>();

  for (const student of allStudents) {
    // Each student gets 4–8 courses spread across realistic semesters
    const numCourses = randInt(4, 8);
    const major = student.major;

    // Build a pool: 60% from student's department, 40% from others
    const deptCourses   = coursesByDept[major] || allCourses;
    const otherCourses  = allCourses.filter(c => c.department !== major);
    const pool = [
      ...deptCourses,
      ...deptCourses,                     // weight dept courses 2×
      ...otherCourses.slice(0, 20),
    ];

    const chosen = new Set<number>();
    let attempts = 0;
    while (chosen.size < numCourses && attempts < 80) {
      attempts++;
      const course = rand(pool);
      if (chosen.has(course.id)) continue;

      // Assign a semester from the course's year-level range
      const level = parseInt(course.courseCode.split("-")[1][0]);
      const semPool = yearSemesterMap[level] || SEMESTERS;
      const semester = rand(semPool);

      const key = `${student.id}-${course.id}-${semester}`;
      if (usedKeys.has(key)) continue;
      usedKeys.add(key);
      chosen.add(course.id);

      const isOpen = OPEN_SEMESTERS.has(semester);
      const dropped = Math.random() < 0.08; // 8% drop rate

      let status: "enrolled" | "completed" | "dropped";
      let finalGrade: string | null = null;

      if (dropped) {
        status = "dropped";
      } else if (isOpen) {
        status = "enrolled";
      } else {
        status = "completed";
        finalGrade = String(randGrade());
      }

      enrollmentValues.push({
        studentId: student.id,
        courseId:  course.id,
        semester,
        status,
        finalGrade,
      });
    }
  }

  console.log(`  Preparing ${enrollmentValues.length} enrollments...`);

  // Batch insert in chunks of 50
  for (let i = 0; i < enrollmentValues.length; i += 50) {
    await db.insert(enrollments).values(enrollmentValues.slice(i, i + 50));
  }
  console.log(`  ✓ Inserted ${enrollmentValues.length} enrollments`);

  // ── 4. Update course enrollment counts ─────────────────────────────────
  await db.execute(sql`
    UPDATE courses c
    SET current_enrollment = (
      SELECT COUNT(*) FROM enrollments e
      WHERE e.course_id = c.id AND e.status != 'dropped'
    )
  `);
  console.log("  ✓ Updated course enrollment counts");

  // ── 5. Calculate and update student GPAs ───────────────────────────────
  const gpaResults = await db.execute(sql`
    SELECT
      e.student_id,
      ROUND(
        SUM(
          CASE
            WHEN CAST(e.final_grade AS DECIMAL) >= 90 THEN 4.0 * c.credits
            WHEN CAST(e.final_grade AS DECIMAL) >= 80 THEN 3.0 * c.credits
            WHEN CAST(e.final_grade AS DECIMAL) >= 70 THEN 2.0 * c.credits
            WHEN CAST(e.final_grade AS DECIMAL) >= 60 THEN 1.0 * c.credits
            ELSE 0.0
          END
        ) / SUM(c.credits), 2
      ) AS gpa
    FROM enrollments e
    JOIN courses c ON e.course_id = c.id
    WHERE e.status = 'completed' AND e.final_grade IS NOT NULL
    GROUP BY e.student_id
  `);

  let gpaUpdated = 0;
  for (const row of (gpaResults[0] as any[])) {
    const gpaVal = parseFloat(row.gpa) || 0;
    const gpaStr = gpaVal.toFixed(2);
    const newStatus = gpaVal < 2.0 ? "probation" as const : undefined;
    await db.update(students)
      .set(newStatus ? { currentGpa: gpaStr, status: newStatus } : { currentGpa: gpaStr })
      .where(eq(students.id, row.student_id));
    gpaUpdated++;
  }
  console.log(`  ✓ Updated GPAs for ${gpaUpdated} students`);

  // ── Summary ─────────────────────────────────────────────────────────────
  const [sCnt] = await db.execute(sql`SELECT COUNT(*) as n FROM students`);
  const [cCnt] = await db.execute(sql`SELECT COUNT(*) as n FROM courses`);
  const [eCnt] = await db.execute(sql`SELECT COUNT(*) as n FROM enrollments`);
  console.log("\n✅ Seed complete!");
  console.log(`   Students:    ${(sCnt[0] as any).n}`);
  console.log(`   Courses:     ${(cCnt[0] as any).n}`);
  console.log(`   Enrollments: ${(eCnt[0] as any).n}`);

  // Department breakdown
  console.log("\n📊 Courses by department & year level:");
  const depts = [...new Set(COURSE_CATALOG.map(c => c.department))];
  for (const dept of depts) {
    const dCourses = COURSE_CATALOG.filter(c => c.department === dept);
    const byYear = [1,2,3,4].map(y => {
      const n = dCourses.filter(c => c.yearLevel === y).length;
      return n ? `Y${y}:${n}` : null;
    }).filter(Boolean).join("  ");
    console.log(`   ${dept.padEnd(4)} — ${String(dCourses.length).padStart(2)} courses  ${byYear}`);
  }
}

seed().catch(err => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
