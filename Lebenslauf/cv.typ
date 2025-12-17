#import "template.typ": *

#show: cv-document

#cv-header(
  "Johannes Michael Tauscher",
  "Data Scientist and Technical Generalist",
  summary: "Data Scientist and Technical Generalist with a strong background in software engineering, machine learning, and data analysis. Experienced in building scalable systems and leading technical projects from concept to deployment.",
  email: "j-tauscher@hotmail.com",
  linkedin: link("https://linkedin.com/in/johannes-tauscher")[linkedin.com/in/johannes-tauscher],
  github: link("https://github.com/thejonnyt")[github.com/thejonnyt],
  website: link("https://thejonnyt.github.io")[thejonnyt.github.io]
)

#section("Professional Experience")

#entry(
  "Co-Founder & CTO",
  "Raumdeuter GbR",
  "Leipzig, Germany",
  format-date("2024-11", "2025-11", current: true),
  description: [Building a modern communication and engagement platform for members and fans of clubs and associations to enable participation and engagement — a way to voice your opinion. From Conceptualization and architecture to implementation of the product as an MVP with the help of a 4-person development team and coordinated external IT partners.],
  achievements: (
    [Built engagement platform from 0 → 1 in 12 months on an overall €30k budget],
    [Led product ideation workshops to align team vision and roadmap],
    [Designed Microservices architecture, Docker Containerization (Distroless, Multistage Build, dev/prod) and Service Mesh patterns],
    [Established DevEx/DevOps: CI/CD pipelines, Linting and Pre-commit Hooks, SSL/TLS/DNS (Domain Name System) management and nginx routing],
    [Developed Machine Learning prototypes: Semantic Text Chunking, Sentiment Analysis, Topic Clustering and content summarization],
    [Established GDPR-compliant data privacy and Privacy by Design practices],
  ),
)

#entry(
  "Entrepreneur",
  "Exist",
  "Leipzig, Germany",
  format-date("2024-11", "2025-10", current: false),
  description: [Responsible for developing and launching a startup idea as part of the EXIST scholarship program funded by the German Federal Ministry for Economic Affairs and Climate Action (BMWK).],
  achievements: (
    [Winner of the Impulse Summit 2025],
    [Winner of the TGFS Technologiegründerfonds Sachsen Award as part of the HHL Digitale Space Program 2025],
    [Idea is 1 of 3 winners of TechStart Dresden 2025],
    [Top 5 out of 150 Finalists at Samsung: Solve for Tomorrow 2025],
    [Visited selected Business Seminars on diverse Topics from Leipzig University and Leipzig Graduate School of Management (HHL)],
  ),
  technologies: ("Miro", "Business Model Canvas", "Lean Startup", "Public Administration", "etc"),
)

#entry(
  "Mathematics Teacher (Substitute)",
  "Rahn Education (Private School)",
  "Leipzig, Germany",
  format-date("2022-11", "2023-06", current: false),
  description: [Responsible for the supervision of a few talented pupils],
  achievements: (
    [Prepared customized university level material to challenge and spark interest for Mathematics],
    [Taught basic principles of the mathematics behind 3D printing and coding],
  ),
  technologies: ("Powerpoint", "Algebra", "gcode", "STL", "MS Teams"),
)

#entry(
  "Student Assistant",
  "Child and Adolescent Psychiatry, Philipps University Marburg",
  "Marburg, Germany",
  format-date("2019-05", "2021-01", current: false),
  description: [Responsible for the validation and reproduction of earlier results of research aswell as for programming Machine Learning algorithms in R to solve classification problems in the field of ASD diagnosis.],
  achievements: (
    [My analysis results supported the findings of 3 peer-reviewed publications that are listed in the publications section.],
    [worked highly interdisciplinary with psychologists and medical doctors to understand the clinical background and implications of the data + explain the statistical methods to non-data-scientists],
  ),
  technologies: ("R", "Machine Learning", "Decision Trees", "Random Forests", "Statistics", "Interdisciplinary Collaboration"),
)

#entry(
  "Intern, Data Analyst",
  "Westphalia DataLab GmbH",
  "Münster, Germany",
  format-date("2019-08", "2019-10", current: false),
  description: [As a Data Analyst intern at Westphalia DataLab GmbH, I worked on a medical-diagnostics project combining 3D imaging and clinical data; developed and improved an experiment-tracking R/Shiny frontend and performed clinical-data analysis with Python and R.],
  achievements: (
    [Worked out and enhanced existing features for an experiment-tracking R/Shiny frontend to improve researcher workflow and usability],
    [Analyzed 3D-image and clinical datasets with Python and R to derive actionable diagnostic insights],
    [Integrated and managed project data using MongoDB and PostgreSQL and maintained code/versioning with Git],
  ),
  technologies: ("Python", "Convolutional Neural Networks", "R", "R Shiny", "MongoDB", "PostgreSQL", "Git"),
)

#section("Education")

#simple-entry(
  "M.Sc Data Science, Faculty of Mathematics and Computer Science",
  "Leipzig University",
  "Leipzig, Germany",
  format-date("2021-04", "2024-10"),
  highlights: (
    [Overall Score: 1.7, personal focus on advanced Statistics, Machine Learning, Data Privacy, LLMs],
    [Master's Thesis (1.1): Neural Machine Translation with Transformers - Leveraging the Pivot Technique for Low-Resource Language Pairs],
  ),
)

#simple-entry(
  "B.Sc. Data Science, Faculty of Mathematics and Computer Science",
  "Philipps University Marburg",
  "Marburg, Germany",
  format-date("2017-10", "2021-03"),
  highlights: (
    [Bachelor's Thesis (1.7): Multidimensional Data Exploration and Visualization of Membrane Proteins Attributes],
    [Curriculum focusses on Mathematics, Statistics, Computer Science and Programming],
  ),
)

#simple-entry(
  "B.A. Marketing and Technical Business Administration",
  "HAW Hamburg",
  "Hamburg, Germany",
  format-date("2012-03", "2017-10"),
  highlights: (
    [Bachelor's Thesis (1.7): Use of Linear Discriminant Analysis as an alternative to tree analysis - methodological evaluation and exemplary implementation using a survey on the success of movies.],
    [Curriculum focusses on Marketing, Engineering and Business Administration],
  ),
)

#section("Publications")

#publication(
  "Phenotypic differences between female and male individuals with suspicion of ASD",
  "Sanna Stroth, Johannes Tauscher, Nicole Beyer, Charlotte Küpper, Luise Poustka, Stefan Roepke, Veit Roessner, Dominik Heider, Inge Kamp-Becker",
  "Molecular Autism, 13 (1)",
  2022,
  doi: "https://doi.org/10.1186/s13229-022-00491-9",
  citations: 16,
)

#publication(
  "Is the Combination of ADOS and ADI-R Necessary to Classify ASD? Rethinking the “Gold Standard” in Diagnosing ASD",
  "Sanna Stroth, Johannes Tauscher, Nicole Beyer, Charlotte Küpper, Luise Poustka, Stefan Roepke, Veit Roessner, Dominik Heider, Inge Kamp-Becker",
  "Frontiers of Psychiatry, 12",
  2021,
  doi: "https://doi.org/10.3389/fpsyt.2021.727308",
  citations: 45,
)

#publication(
  "Identification of the most indicative and discriminative features from diagnostic instruments for children with autism",
  "Sanna Stroth, Johannes Tauscher, Nicole Wolff, Charlotte Küpper, Luise Poustka, Stefan Roepke, Veit Roessner, Dominik Heider, Inge Kamp-Becker",
  "JCPP Advances, Volume 1, Issue 2",
  2021,
  doi: "https://doi.org/10.1002/jcv2.12023",
  citations: 9,
)

#section("Technical Skills")

#skills-section((
  ("Analysis, ML & AI", ("LLMs", "NLP/ML", "Machine Learning", "Statistics",)),
  ("Backend & DevOps", ("Docker", "gRPC", "MongoDB", "PostgreSQL", "nginx",)),
  ("Programming Languages", ("Java", "Python", "JavaScript", "R", "Bash", "SQL",)),
  ("Tools & Systems", ("Git", "Linux", "Excel", "Powerpoint", "MS Office", "MS Teams", "VSCode", LaTeX,)),
  ("Web & Creative", ("Next.js", "Adobe Photoshop", "HTML",)),
))
