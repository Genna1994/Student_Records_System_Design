// @ts-nocheck
import { getDb } from "../api/queries/connection";
import { students, courses, enrollments } from "./schema";
import { eq, sql } from "drizzle-orm";

const db = getDb();

// ── Departments & Courses ────────────────────────────────────────────────────

const COURSE_CATALOG = [
  // ── Computer Science (CS) ───────────────────────────────────────────────────
  { courseCode: "CS-101", title: "Intro to Programming",                  credits: 4, department: "CS",  yearLevel: 1, description: "Fundamentals of programming using Python" },
  { courseCode: "CS-102", title: "Web Development Basics",                credits: 3, department: "CS",  yearLevel: 1, description: "HTML, CSS, and JavaScript fundamentals" },
  { courseCode: "CS-103", title: "Computer Science Foundations",          credits: 3, department: "CS",  yearLevel: 1, description: "Boolean logic, number systems, and computational thinking" },
  { courseCode: "CS-201", title: "Data Structures",                       credits: 4, department: "CS",  yearLevel: 2, description: "Arrays, linked lists, trees, graphs, hashing" },
  { courseCode: "CS-202", title: "Algorithms",                            credits: 3, department: "CS",  yearLevel: 2, description: "Algorithm design, analysis, and complexity" },
  { courseCode: "CS-203", title: "Object-Oriented Programming",           credits: 3, department: "CS",  yearLevel: 2, description: "OOP principles using Java" },
  { courseCode: "CS-301", title: "Database Systems",                      credits: 3, department: "CS",  yearLevel: 3, description: "Relational databases, SQL, normalization" },
  { courseCode: "CS-302", title: "Operating Systems",                     credits: 3, department: "CS",  yearLevel: 3, description: "Process management, memory, file systems" },
  { courseCode: "CS-303", title: "Software Engineering",                  credits: 3, department: "CS",  yearLevel: 3, description: "Agile, design patterns, SDLC" },
  { courseCode: "CS-401", title: "Machine Learning",                      credits: 4, department: "CS",  yearLevel: 4, description: "Supervised and unsupervised learning" },
  { courseCode: "CS-402", title: "Computer Networks",                     credits: 3, department: "CS",  yearLevel: 4, description: "TCP/IP, routing, application protocols" },
  { courseCode: "CS-403", title: "Cloud Computing",                       credits: 3, department: "CS",  yearLevel: 4, description: "AWS, Azure, distributed systems" },

  // ── English (ENG) ───────────────────────────────────────────────────────────
  { courseCode: "ENG-101", title: "English Composition",                  credits: 3, department: "ENG", yearLevel: 1, description: "Writing skills and rhetorical strategies" },
  { courseCode: "ENG-102", title: "Public Speaking",                      credits: 3, department: "ENG", yearLevel: 1, description: "Oral communication and presentation skills" },
  { courseCode: "ENG-103", title: "Critical Reading & Thinking",          credits: 3, department: "ENG", yearLevel: 1, description: "Analytical reading strategies and close-text interpretation" },
  { courseCode: "ENG-201", title: "Technical Writing",                    credits: 3, department: "ENG", yearLevel: 2, description: "Professional communication and documentation" },
  { courseCode: "ENG-202", title: "Research Methods",                     credits: 3, department: "ENG", yearLevel: 2, description: "Academic research and citation practice" },
  { courseCode: "ENG-203", title: "World Literature",                     credits: 3, department: "ENG", yearLevel: 2, description: "Survey of global literary traditions from ancient to contemporary" },
  { courseCode: "ENG-301", title: "Advanced Composition",                 credits: 3, department: "ENG", yearLevel: 3, description: "Graduate-level writing and argumentation" },
  { courseCode: "ENG-302", title: "Creative Writing",                     credits: 3, department: "ENG", yearLevel: 3, description: "Fiction, poetry, and nonfiction narrative techniques" },
  { courseCode: "ENG-303", title: "Linguistics",                          credits: 3, department: "ENG", yearLevel: 3, description: "Phonology, morphology, syntax, and language acquisition" },
  { courseCode: "ENG-401", title: "Senior Seminar in English",            credits: 3, department: "ENG", yearLevel: 4, description: "Capstone seminar integrating literary theory and original research" },
  { courseCode: "ENG-402", title: "Digital Rhetoric",                     credits: 3, department: "ENG", yearLevel: 4, description: "Persuasive communication in digital and social media contexts" },
  { courseCode: "ENG-403", title: "Professional Editing & Publishing",    credits: 3, department: "ENG", yearLevel: 4, description: "Manuscript editing, style guides, and publishing industry workflows" },

  // ── Mathematics (MAT) ───────────────────────────────────────────────────────
  { courseCode: "MAT-101", title: "Calculus I",                           credits: 4, department: "MAT", yearLevel: 1, description: "Limits, derivatives, and integrals" },
  { courseCode: "MAT-102", title: "Pre-Calculus",                         credits: 3, department: "MAT", yearLevel: 1, description: "Trigonometry and algebraic foundations" },
  { courseCode: "MAT-103", title: "Introduction to Statistics",           credits: 3, department: "MAT", yearLevel: 1, description: "Descriptive statistics, basic probability, and data interpretation" },
  { courseCode: "MAT-201", title: "Calculus II",                          credits: 4, department: "MAT", yearLevel: 2, description: "Series, multivariable calculus" },
  { courseCode: "MAT-202", title: "Discrete Mathematics",                 credits: 3, department: "MAT", yearLevel: 2, description: "Logic, sets, graphs, combinatorics" },
  { courseCode: "MAT-203", title: "Calculus III",                         credits: 4, department: "MAT", yearLevel: 2, description: "Vector calculus, partial derivatives, and multiple integrals" },
  { courseCode: "MAT-301", title: "Linear Algebra",                       credits: 3, department: "MAT", yearLevel: 3, description: "Vector spaces, matrices, eigenvalues" },
  { courseCode: "MAT-302", title: "Probability & Statistics",             credits: 3, department: "MAT", yearLevel: 3, description: "Distributions, inference, regression" },
  { courseCode: "MAT-303", title: "Differential Equations",               credits: 3, department: "MAT", yearLevel: 3, description: "Ordinary differential equations and applications to modelling" },
  { courseCode: "MAT-401", title: "Numerical Methods",                    credits: 3, department: "MAT", yearLevel: 4, description: "Computational solutions to mathematical problems" },
  { courseCode: "MAT-402", title: "Real Analysis",                        credits: 3, department: "MAT", yearLevel: 4, description: "Rigorous treatment of limits, continuity, and convergence" },
  { courseCode: "MAT-403", title: "Abstract Algebra",                     credits: 3, department: "MAT", yearLevel: 4, description: "Groups, rings, fields, and homomorphisms" },

  // ── Physics (PHY) ───────────────────────────────────────────────────────────
  { courseCode: "PHY-101", title: "Physics I",                            credits: 4, department: "PHY", yearLevel: 1, description: "Mechanics, thermodynamics, waves" },
  { courseCode: "PHY-102", title: "Physics I Laboratory",                 credits: 1, department: "PHY", yearLevel: 1, description: "Hands-on experiments reinforcing classical mechanics concepts" },
  { courseCode: "PHY-103", title: "Astronomy & Astrophysics",             credits: 3, department: "PHY", yearLevel: 1, description: "Solar system, stellar evolution, galaxies, and cosmology" },
  { courseCode: "PHY-201", title: "Physics II",                           credits: 4, department: "PHY", yearLevel: 2, description: "Electricity, magnetism, optics" },
  { courseCode: "PHY-202", title: "Physics II Laboratory",                credits: 1, department: "PHY", yearLevel: 2, description: "Experimental investigation of electromagnetic and optical phenomena" },
  { courseCode: "PHY-203", title: "Thermodynamics & Statistical Mechanics", credits: 3, department: "PHY", yearLevel: 2, description: "Laws of thermodynamics, entropy, and statistical distributions" },
  { courseCode: "PHY-301", title: "Modern Physics",                       credits: 3, department: "PHY", yearLevel: 3, description: "Relativity, quantum mechanics, atomic structure" },
  { courseCode: "PHY-302", title: "Electrodynamics",                      credits: 3, department: "PHY", yearLevel: 3, description: "Maxwell's equations, electromagnetic waves, and radiation" },
  { courseCode: "PHY-303", title: "Computational Physics",                credits: 3, department: "PHY", yearLevel: 3, description: "Numerical simulation and modelling of physical systems" },
  { courseCode: "PHY-401", title: "Quantum Mechanics",                    credits: 4, department: "PHY", yearLevel: 4, description: "Wave functions, operators, perturbation theory, and quantum systems" },
  { courseCode: "PHY-402", title: "Solid State Physics",                  credits: 3, department: "PHY", yearLevel: 4, description: "Crystal structure, band theory, semiconductors, and superconductivity" },
  { courseCode: "PHY-403", title: "Nuclear & Particle Physics",           credits: 3, department: "PHY", yearLevel: 4, description: "Nuclear structure, radioactive decay, and fundamental particles" },

  // ── Biology (BIO) ───────────────────────────────────────────────────────────
  { courseCode: "BIO-101", title: "General Biology",                      credits: 4, department: "BIO", yearLevel: 1, description: "Cell biology, genetics, evolution" },
  { courseCode: "BIO-102", title: "General Biology Laboratory",           credits: 1, department: "BIO", yearLevel: 1, description: "Microscopy, cell culture, and experimental techniques in biology" },
  { courseCode: "BIO-103", title: "Environmental Biology",                credits: 3, department: "BIO", yearLevel: 1, description: "Ecosystems, biodiversity, and human impact on the environment" },
  { courseCode: "BIO-201", title: "Genetics",                             credits: 3, department: "BIO", yearLevel: 2, description: "Mendelian and molecular genetics" },
  { courseCode: "BIO-202", title: "Microbiology",                         credits: 3, department: "BIO", yearLevel: 2, description: "Bacteria, viruses, fungi, and their roles in health and disease" },
  { courseCode: "BIO-203", title: "Cell & Molecular Biology",             credits: 3, department: "BIO", yearLevel: 2, description: "Cell structure, signaling pathways, and gene expression" },
  { courseCode: "BIO-301", title: "Biochemistry",                         credits: 3, department: "BIO", yearLevel: 3, description: "Biomolecules, metabolism, enzymology" },
  { courseCode: "BIO-302", title: "Physiology",                           credits: 3, department: "BIO", yearLevel: 3, description: "Organ systems and their regulatory mechanisms in animals" },
  { courseCode: "BIO-303", title: "Ecology",                              credits: 3, department: "BIO", yearLevel: 3, description: "Population dynamics, community interactions, and ecosystem processes" },
  { courseCode: "BIO-401", title: "Genomics & Bioinformatics",            credits: 4, department: "BIO", yearLevel: 4, description: "Genome sequencing, annotation, and computational analysis of biological data" },
  { courseCode: "BIO-402", title: "Immunology",                           credits: 3, department: "BIO", yearLevel: 4, description: "Innate and adaptive immunity, vaccines, and immunological disorders" },
  { courseCode: "BIO-403", title: "Senior Research in Biology",           credits: 3, department: "BIO", yearLevel: 4, description: "Independent laboratory research culminating in a written thesis" },

  // ── Economics (ECO) — original entries preserved + missing slots filled ─────
  { courseCode: "ECO-101", title: "Microeconomics",                       credits: 3, department: "ECO", yearLevel: 1, description: "Supply, demand, market structures" },
  { courseCode: "ECO-102", title: "Introduction to Economic Thought",     credits: 3, department: "ECO", yearLevel: 1, description: "Historical development of economic theories from mercantilism to modern schools" },
  { courseCode: "ECO-103", title: "Quantitative Methods in Economics",    credits: 3, department: "ECO", yearLevel: 1, description: "Mathematical and statistical tools applied to economic analysis" },
  { courseCode: "ECO-201", title: "Macroeconomics",                       credits: 3, department: "ECO", yearLevel: 2, description: "GDP, inflation, fiscal policy" },
  { courseCode: "ECO-202", title: "Money, Banking & Financial Markets",   credits: 3, department: "ECO", yearLevel: 2, description: "Role of money, central banks, interest rates, and capital markets" },
  { courseCode: "ECO-203", title: "Development Economics",                credits: 3, department: "ECO", yearLevel: 2, description: "Economic growth, poverty, inequality, and development policy" },
  { courseCode: "ECO-301", title: "Econometrics",                         credits: 3, department: "ECO", yearLevel: 3, description: "Statistical methods in economics" },
  { courseCode: "ECO-302", title: "Public Finance",                       credits: 3, department: "ECO", yearLevel: 3, description: "Government expenditure, taxation, and fiscal policy analysis" },
  { courseCode: "ECO-303", title: "Labor Economics",                      credits: 3, department: "ECO", yearLevel: 3, description: "Labor markets, wages, employment, and workforce policy" },
  { courseCode: "ECO-401", title: "International Economics",              credits: 3, department: "ECO", yearLevel: 4, description: "Trade theory, exchange rates, globalization" },
  { courseCode: "ECO-402", title: "Environmental Economics",              credits: 3, department: "ECO", yearLevel: 4, description: "Market failures, externalities, carbon pricing, and sustainability policy" },
  { courseCode: "ECO-403", title: "Economics Capstone Seminar",           credits: 3, department: "ECO", yearLevel: 4, description: "Independent policy research paper integrating core economic theory and data" },

  // ── Psychology (PSY) ────────────────────────────────────────────────────────
  { courseCode: "PSY-101", title: "Intro to Psychology",                  credits: 3, department: "PSY", yearLevel: 1, description: "Behavior, cognition, and mental processes" },
  { courseCode: "PSY-102", title: "Research Methods in Psychology",       credits: 3, department: "PSY", yearLevel: 1, description: "Experimental design, data collection, and APA reporting standards" },
  { courseCode: "PSY-103", title: "Biological Psychology",                credits: 3, department: "PSY", yearLevel: 1, description: "Neural bases of behavior, hormones, and the nervous system" },
  { courseCode: "PSY-201", title: "Developmental Psychology",             credits: 3, department: "PSY", yearLevel: 2, description: "Human development across the lifespan" },
  { courseCode: "PSY-202", title: "Social Psychology",                    credits: 3, department: "PSY", yearLevel: 2, description: "Attitudes, group dynamics, persuasion, and social influence" },
  { courseCode: "PSY-203", title: "Personality Psychology",               credits: 3, department: "PSY", yearLevel: 2, description: "Trait theories, psychodynamic and humanistic models of personality" },
  { courseCode: "PSY-301", title: "Abnormal Psychology",                  credits: 3, department: "PSY", yearLevel: 3, description: "Mental disorders: diagnosis and treatment" },
  { courseCode: "PSY-302", title: "Health Psychology",                    credits: 3, department: "PSY", yearLevel: 3, description: "Psychological factors in illness, wellness, and medical adherence" },
  { courseCode: "PSY-303", title: "Learning & Behavior",                  credits: 3, department: "PSY", yearLevel: 3, description: "Classical and operant conditioning, memory, and cognitive learning theories" },
  { courseCode: "PSY-401", title: "Cognitive Neuroscience",               credits: 3, department: "PSY", yearLevel: 4, description: "Brain structures and cognitive function" },
  { courseCode: "PSY-402", title: "Clinical Psychology",                  credits: 3, department: "PSY", yearLevel: 4, description: "Therapeutic modalities including CBT, DBT, and psychodynamic approaches" },
  { courseCode: "PSY-403", title: "Psychology Capstone Research",         credits: 3, department: "PSY", yearLevel: 4, description: "Independent empirical research project with oral defense and written report" },

  // ── Art & Design (ART) ──────────────────────────────────────────────────────
  { courseCode: "ART-101", title: "Art History",                          credits: 3, department: "ART", yearLevel: 1, description: "Survey of Western art from antiquity to modern" },
  { courseCode: "ART-102", title: "Drawing & Composition",                credits: 3, department: "ART", yearLevel: 1, description: "Foundational drawing techniques, perspective, and visual composition" },
  { courseCode: "ART-103", title: "Color Theory & Design Fundamentals",   credits: 3, department: "ART", yearLevel: 1, description: "Color relationships, visual hierarchy, and principles of graphic design" },
  { courseCode: "ART-201", title: "Digital Design",                       credits: 3, department: "ART", yearLevel: 2, description: "Principles of digital visual communication" },
  { courseCode: "ART-202", title: "Typography",                           credits: 3, department: "ART", yearLevel: 2, description: "Typeface selection, layout, and typographic hierarchy for print and screen" },
  { courseCode: "ART-203", title: "Photography & Visual Storytelling",    credits: 3, department: "ART", yearLevel: 2, description: "Camera fundamentals, composition, and narrative through image sequences" },
  { courseCode: "ART-301", title: "UX/UI Design",                         credits: 3, department: "ART", yearLevel: 3, description: "User research, wireframing, and prototyping" },
  { courseCode: "ART-302", title: "Motion Graphics & Animation",          credits: 3, department: "ART", yearLevel: 3, description: "Keyframe animation, After Effects workflows, and motion design principles" },
  { courseCode: "ART-303", title: "Brand Identity & Visual Systems",      credits: 3, department: "ART", yearLevel: 3, description: "Logo design, brand strategy, and cohesive visual identity development" },
  { courseCode: "ART-401", title: "Portfolio & Professional Practice",    credits: 3, department: "ART", yearLevel: 4, description: "Curating a professional design portfolio and navigating the creative industry" },
  { courseCode: "ART-402", title: "Interaction Design",                   credits: 3, department: "ART", yearLevel: 4, description: "Designing interactive experiences for web, mobile, and emerging interfaces" },
  { courseCode: "ART-403", title: "Senior Design Capstone",               credits: 3, department: "ART", yearLevel: 4, description: "Semester-long client project integrating research, strategy, and design execution" },

  // ── Software Engineering (SE) ───────────────────────────────────────────────
  { courseCode: "SE-101",  title: "Foundations of Software Engineering",  credits: 3, department: "SE",  yearLevel: 1, description: "Introduction to the software development lifecycle, roles, and tooling" },
  { courseCode: "SE-102",  title: "Programming Fundamentals",             credits: 4, department: "SE",  yearLevel: 1, description: "Core programming concepts using Python and version control with Git" },
  { courseCode: "SE-103",  title: "Discrete Structures for SE",           credits: 3, department: "SE",  yearLevel: 1, description: "Logic, sets, relations, and graph theory applied to software problems" },
  { courseCode: "SE-201",  title: "Object-Oriented Design",               credits: 3, department: "SE",  yearLevel: 2, description: "SOLID principles, design patterns, and UML modelling in Java" },
  { courseCode: "SE-202",  title: "Data Structures & Algorithms",         credits: 4, department: "SE",  yearLevel: 2, description: "Core data structures and complexity analysis with software applications" },
  { courseCode: "SE-203",  title: "Requirements Engineering",             credits: 3, department: "SE",  yearLevel: 2, description: "Eliciting, documenting, and validating software requirements" },
  { courseCode: "SE-301",  title: "Software Architecture",                credits: 3, department: "SE",  yearLevel: 3, description: "Architectural patterns, component design, and quality attributes" },
  { courseCode: "SE-302",  title: "Agile & DevOps Practices",             credits: 3, department: "SE",  yearLevel: 3, description: "Scrum, Kanban, CI/CD pipelines, and containerisation with Docker" },
  { courseCode: "SE-303",  title: "Software Testing & Quality Assurance", credits: 3, department: "SE",  yearLevel: 3, description: "Unit, integration, and system testing strategies with automated tooling" },
  { courseCode: "SE-401",  title: "Distributed Systems",                  credits: 4, department: "SE",  yearLevel: 4, description: "Microservices, message queues, CAP theorem, and fault-tolerant design" },
  { courseCode: "SE-402",  title: "Software Security Engineering",        credits: 3, department: "SE",  yearLevel: 4, description: "Threat modelling, secure coding practices, and penetration testing basics" },
  { courseCode: "SE-403",  title: "Software Engineering Capstone",        credits: 3, department: "SE",  yearLevel: 4, description: "Full-cycle team project from requirements through deployment and retrospective" },

  // ── Information Technology (IT) ─────────────────────────────────────────────
  { courseCode: "IT-101",  title: "IT Fundamentals",                      credits: 3, department: "IT",  yearLevel: 1, description: "Computer hardware, software, operating systems, and IT support basics" },
  { courseCode: "IT-102",  title: "Networking Essentials",                credits: 3, department: "IT",  yearLevel: 1, description: "OSI model, TCP/IP, subnetting, and basic network configuration" },
  { courseCode: "IT-103",  title: "Introduction to Cybersecurity",        credits: 3, department: "IT",  yearLevel: 1, description: "Threats, vulnerabilities, and foundational security controls" },
  { courseCode: "IT-201",  title: "Systems Administration",               credits: 3, department: "IT",  yearLevel: 2, description: "Linux and Windows server configuration, user management, and automation scripts" },
  { courseCode: "IT-202",  title: "Database Administration",              credits: 3, department: "IT",  yearLevel: 2, description: "Installation, tuning, backup, and recovery of relational database systems" },
  { courseCode: "IT-203",  title: "Cloud Infrastructure",                 credits: 3, department: "IT",  yearLevel: 2, description: "Provisioning and managing cloud resources on AWS and Azure platforms" },
  { courseCode: "IT-301",  title: "Network Security",                     credits: 3, department: "IT",  yearLevel: 3, description: "Firewalls, VPNs, intrusion detection systems, and network hardening" },
  { courseCode: "IT-302",  title: "IT Project Management",                credits: 3, department: "IT",  yearLevel: 3, description: "Project planning, risk assessment, and delivery using PMBOK and Agile" },
  { courseCode: "IT-303",  title: "Virtualisation & Containers",          credits: 3, department: "IT",  yearLevel: 3, description: "Hypervisors, VMware, Docker, and Kubernetes cluster management" },
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
